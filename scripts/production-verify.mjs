import "dotenv/config";

function normalizeOrigin(input) {
  const trimmed = (input || "").trim().replace(/\/+$/, "");
  if (!trimmed) {
    throw new Error("NEXT_PUBLIC_SITE_URL is required for production verification.");
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a valid absolute URL.");
  }

  if (parsed.protocol !== "https:") {
    throw new Error("production:verify requires NEXT_PUBLIC_SITE_URL to use https.");
  }

  const host = parsed.hostname.toLowerCase();
  if (host === "localhost" || host === "127.0.0.1") {
    throw new Error("production:verify cannot run against localhost or 127.0.0.1.");
  }

  if (parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be an origin only, without path/query/hash.");
  }

  return `${parsed.protocol}//${parsed.host}`;
}

const siteUrl = normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL);

const checks = [];

function addCheck(name, pass, details) {
  checks.push({ name, pass, details });
}

async function fetchPath(pathname) {
  const response = await fetch(`${siteUrl}${pathname}`, {
    redirect: "follow",
    headers: {
      "user-agent": "zerocool-production-verify",
    },
  });

  const body = await response.text();
  return { response, body };
}

function extractXmlLocs(xmlBody) {
  const matches = [...xmlBody.matchAll(/<loc>([^<]+)<\/loc>/g)];
  return matches.map((match) => match[1].trim()).filter(Boolean);
}

function hasHubSpotScript(html) {
  return /https:\/\/js\.hs-scripts\.com\/\d+\.js/i.test(html);
}

function checkCsp(pathname, cspHeader) {
  const prefix = `CSP ${pathname}`;
  addCheck(`${prefix} present`, Boolean(cspHeader), cspHeader ? "Header found" : "Header missing");

  if (!cspHeader) {
    return;
  }

  addCheck(
    `${prefix} allows js-na2 HubSpot host`,
    cspHeader.includes("https://js-na2.hs-scripts.com"),
    "script-src should include https://js-na2.hs-scripts.com"
  );
  addCheck(
    `${prefix} excludes unsafe-eval`,
    !cspHeader.includes("'unsafe-eval'"),
    "Production CSP must not include unsafe-eval"
  );
}

async function verifyRobots() {
  const { response, body } = await fetchPath("/robots.txt");
  addCheck("robots.txt status 200", response.status === 200, `Status ${response.status}`);

  const contentType = response.headers.get("content-type") || "";
  addCheck("robots.txt content type", contentType.includes("text/plain"), contentType || "Missing content-type");
  addCheck("robots.txt has no localhost", !/localhost|127\.0\.0\.1/i.test(body), "robots.txt must not include localhost/127.0.0.1");

  const expectedSitemap = `Sitemap: ${siteUrl}/sitemap.xml`;
  addCheck(
    "robots.txt sitemap points to production domain",
    body.includes(expectedSitemap),
    expectedSitemap
  );

  addCheck("robots.txt disallow /admin/", body.includes("Disallow: /admin/"), "Disallow /admin/ required");
  addCheck("robots.txt disallow /api/", body.includes("Disallow: /api/"), "Disallow /api/ required");
  addCheck(
    "robots.txt disallow /client-portal/",
    body.includes("Disallow: /client-portal/"),
    "Disallow /client-portal/ required"
  );
}

async function verifySitemap() {
  const { response, body } = await fetchPath("/sitemap.xml");
  addCheck("sitemap.xml status 200", response.status === 200, `Status ${response.status}`);

  const contentType = response.headers.get("content-type") || "";
  addCheck(
    "sitemap.xml content type",
    contentType.includes("xml"),
    contentType || "Missing content-type"
  );

  addCheck("sitemap.xml valid XML structure", /<urlset[^>]*>[\s\S]*<\/urlset>/i.test(body), "Expected <urlset> root");
  addCheck("sitemap.xml has no localhost", !/localhost|127\.0\.0\.1/i.test(body), "sitemap.xml must not include localhost/127.0.0.1");

  const locs = extractXmlLocs(body);
  addCheck("sitemap.xml has loc entries", locs.length > 0, `Found ${locs.length} loc entries`);

  const invalidLocs = locs.filter((loc) => {
    if (!loc.startsWith("https://")) {
      return true;
    }
    return !(loc === siteUrl || loc.startsWith(`${siteUrl}/`));
  });

  addCheck(
    "sitemap.xml loc entries match production domain",
    invalidLocs.length === 0,
    invalidLocs.length === 0 ? "All loc entries use production domain" : `${invalidLocs.length} loc entries use a different domain`
  );

  const duplicates = locs.length - new Set(locs).size;
  addCheck("sitemap.xml has no duplicate URLs", duplicates === 0, duplicates === 0 ? "No duplicate loc values" : `${duplicates} duplicate loc values found`);

  const disallowedPrefixes = [
    `${siteUrl}/admin`,
    `${siteUrl}/api`,
    `${siteUrl}/client-portal`,
  ];

  const privateLocs = locs.filter((loc) => disallowedPrefixes.some((prefix) => loc === prefix || loc.startsWith(`${prefix}/`)));
  addCheck(
    "sitemap.xml excludes admin/api/private routes",
    privateLocs.length === 0,
    privateLocs.length === 0 ? "No admin/api/private URLs in sitemap" : `${privateLocs.length} private URL(s) found`
  );
}

async function verifyPages() {
  const candidates = ["/free-estimate", "/estimate"];
  let estimatePath = "/estimate";

  for (const candidate of candidates) {
    const { response } = await fetchPath(candidate);
    if (response.status === 200) {
      estimatePath = candidate;
      break;
    }
  }

  const paths = ["/", "/contact", "/free-consultation", estimatePath];

  for (const path of paths) {
    const { response, body } = await fetchPath(path);
    addCheck(`${path} status 200`, response.status === 200, `Status ${response.status}`);

    const csp = response.headers.get("content-security-policy") || "";
    checkCsp(path, csp);

    const shouldHaveHubSpot = !path.startsWith("/admin") && !path.startsWith("/client-portal");
    if (shouldHaveHubSpot) {
      addCheck(`${path} contains HubSpot script tag`, hasHubSpotScript(body), "Expected js.hs-scripts.com script tag");
    }
  }
}

await verifyRobots();
await verifySitemap();
await verifyPages();

for (const check of checks) {
  const prefix = check.pass ? "PASS" : "FAIL";
  console.log(`${prefix} - ${check.name}: ${check.details}`);
}

const failed = checks.filter((check) => !check.pass);
if (failed.length > 0) {
  console.error(`\nVerification failed: ${failed.length} check(s) failed.`);
  process.exit(1);
}

console.log("\nVerification passed.");
