import "dotenv/config";

export function readOptionalEnv(name: string, fallback = "") {
  const value = process.env[name];
  if (!value) {
    return fallback;
  }

  return value;
}

export function readRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSiteUrl() {
  const nodeEnv = readOptionalEnv("NODE_ENV", "development").trim().toLowerCase();
  const isProduction = nodeEnv === "production";
  const rawSiteUrl = readOptionalEnv("NEXT_PUBLIC_SITE_URL").trim();

  if (!rawSiteUrl) {
    if (isProduction) {
      throw new Error(
        "NEXT_PUBLIC_SITE_URL is required in production and must be a valid https URL."
      );
    }

    return "http://localhost:3000";
  }

  const normalizedSiteUrl = rawSiteUrl.replace(/\/+$/, "");

  let parsed: URL;
  try {
    parsed = new URL(normalizedSiteUrl);
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL is invalid: \"${normalizedSiteUrl}\". Provide a full URL such as https://your-production-domain.com`
    );
  }

  const hostname = parsed.hostname.toLowerCase();
  const hasPath = parsed.pathname !== "/";
  const hasQueryOrHash = Boolean(parsed.search) || Boolean(parsed.hash);

  if (hasPath || hasQueryOrHash) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must not include a path, query, or hash. Provide only the site origin."
    );
  }

  if (isProduction && parsed.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_SITE_URL must use https in production.");
  }

  if (isProduction && (hostname === "localhost" || hostname === "127.0.0.1")) {
    throw new Error("NEXT_PUBLIC_SITE_URL cannot use localhost or 127.0.0.1 in production.");
  }

  const isLocalDevHost = hostname === "localhost" || hostname === "127.0.0.1";
  if (!isProduction && !["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("NEXT_PUBLIC_SITE_URL must use http or https.");
  }

  if (!isProduction && isLocalDevHost && parsed.protocol !== "http:") {
    throw new Error("Local development URLs should use http for NEXT_PUBLIC_SITE_URL.");
  }

  return `${parsed.protocol}//${parsed.host}`;
}

export function getContactEmail() {
  return readOptionalEnv(
    "CONTACT_EMAIL",
    readOptionalEnv("LEAD_TO_EMAIL", "zerocool.development.project@gmail.com")
  );
}

export function getLeadSenderEmail() {
  return readOptionalEnv("LEAD_FROM_EMAIL", "onboarding@resend.dev");
}
