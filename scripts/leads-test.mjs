import { config as loadEnv } from "dotenv";

loadEnv();

const baseUrlCandidates = [
  process.env.LEADS_TEST_BASE_URL?.trim(),
  "http://localhost:3000",
  process.env.NEXT_PUBLIC_SITE_URL?.trim(),
  "https://zerocool-development.com",
].filter(Boolean);

const requiredEnv = [
  "HUBSPOT_ACCESS_TOKEN",
  "RESEND_API_KEY",
  "CONTACT_EMAIL",
  "NEXT_PUBLIC_SITE_URL",
  "ADMIN_ACCESS_CODE",
];

function readPresentEnv() {
  const base = requiredEnv.map((key) => ({
    key,
    present: Boolean(process.env[key]?.trim()),
  }));

  base.push({
    key: "EMAIL_FROM or LEAD_FROM_EMAIL",
    present: Boolean(
      process.env.EMAIL_FROM?.trim() || process.env.LEAD_FROM_EMAIL?.trim()
    ),
  });

  return base;
}

async function safeJson(response) {
  return (await response.json().catch(() => null)) ?? null;
}

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function checkHealth(baseUrl) {
  const response = await fetch(`${baseUrl}/api/health`, {
    headers: { Accept: "application/json" },
  });

  const payload = await safeJson(response);

  return {
    ok: response.ok,
    status: response.status,
    payload,
  };
}

async function checkHubSpot() {
  const token = process.env.HUBSPOT_ACCESS_TOKEN?.trim();
  if (!token) {
    return { ok: false, status: 0, safeError: "HUBSPOT_ACCESS_TOKEN missing" };
  }

  const response = await fetch("https://api.hubapi.com/integrations/v1/me", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return {
    ok: response.ok,
    status: response.status,
    safeError: response.ok ? null : "HubSpot auth check failed",
  };
}

async function checkEmail() {
  const token = process.env.RESEND_API_KEY?.trim();
  const fromAddress =
    process.env.EMAIL_FROM?.trim() ||
    process.env.LEAD_FROM_EMAIL?.trim() ||
    "";

  const extractEmailAddress = (input) => {
    const angleMatch = input.match(/<([^>]+)>/);
    const raw = angleMatch?.[1] || input;
    return raw.trim().toLowerCase();
  };

  const senderEmail = extractEmailAddress(fromAddress);
  const senderDomain = senderEmail.includes("@") ? senderEmail.split("@")[1] : "";

  if (!token) {
    return { ok: false, status: 0, safeError: "RESEND_API_KEY missing" };
  }

  const response = await fetch("https://api.resend.com/domains", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      safeError: "Email provider auth check failed",
    };
  }

  const domains = Array.isArray(payload?.data) ? payload.data : [];
  const senderDomainRecord = domains.find((d) => {
    const name = String(d?.name || "").toLowerCase();
    return senderDomain === name || senderDomain.endsWith(`.${name}`);
  });

  if (!senderDomainRecord) {
    return {
      ok: false,
      status: 400,
      safeError: "EMAIL_FROM domain is not present in provider domains list",
    };
  }

  const senderDomainStatus = String(senderDomainRecord?.status || "").toLowerCase();
  let senderDomainSendVerified = false;

  if (senderDomainRecord?.id) {
    const detailResponse = await fetch(`https://api.resend.com/domains/${senderDomainRecord.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const detailPayload = await detailResponse.json().catch(() => null);
    const records = Array.isArray(detailPayload?.records) ? detailPayload.records : [];
    const sendingRecords = records.filter((r) => {
      const recordType = String(r?.record || "").toLowerCase();
      return recordType === "dkim" || recordType === "spf";
    });

    senderDomainSendVerified =
      sendingRecords.length > 0 &&
      sendingRecords.every((r) => String(r?.status || "").toLowerCase() === "verified");
  }

  if (senderDomainStatus !== "verified" && !senderDomainSendVerified) {
    return {
      ok: false,
      status: 400,
      safeError: `EMAIL_FROM domain is not fully verified (status: ${senderDomainStatus})`,
    };
  }

  return {
    ok: true,
    status: response.status,
    safeError: null,
  };
}

async function submitTestLead() {
  const { baseUrl } = await resolveBaseUrl();
  const testEmail = "zerocool.integration.test@zerocool-development.com";
  const response = await fetch(`${baseUrl}/api/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: baseUrl,
    },
    body: JSON.stringify({
      name: "ZeroCool Integration Test",
      email: testEmail,
      phone: "401-555-0110",
      preferredContactMethod: "email",
      projectType: "Integration Test",
      clientType: "business",
      urgency: "normal",
      budgetRange: "not_sure",
      timeline: "asap",
      formType: "integration_test",
      source: "integration_test_script",
      message:
        "ZeroCool Integration Test submission. Please ignore for normal lead workflow.",
      website: "",
      pageUrl: `${baseUrl}/integration-test`,
      utmSource: "integration-test",
      utmCampaign: "lead-pipeline-check",
    }),
  });

  const rawText = await response.text();
  const payload = tryParseJson(rawText);

  return {
    ok: response.ok,
    status: response.status,
    payload,
    rawPreview: payload ? null : rawText.slice(0, 240),
  };
}

async function resolveBaseUrl() {
  for (const candidate of baseUrlCandidates) {
    try {
      const health = await checkHealth(candidate);
      if (health.ok) {
        return { baseUrl: candidate, health };
      }
    } catch {
      // Try next candidate.
    }
  }

  throw new Error("No reachable API base URL found. Start app locally or set LEADS_TEST_BASE_URL.");
}

function printSection(title, value) {
  console.log(`\n=== ${title} ===`);
  console.log(JSON.stringify(value, null, 2));
}

async function main() {
  const envMatrix = readPresentEnv();
  const missingCriticalEnv = envMatrix.filter((item) => !item.present).map((item) => item.key);
  const resolved = await resolveBaseUrl();
  const baseUrl = resolved.baseUrl;

  printSection("Environment Check", {
    baseUrl,
    required: envMatrix,
  });

  const health = resolved.health;
  printSection("Health Check", health);

  const hubspot = await checkHubSpot();
  printSection("HubSpot Connectivity", hubspot);

  const email = await checkEmail();
  printSection("Email Connectivity", email);

  const submission = await submitTestLead();
  const submissionPayload = submission.payload || {};
  const submissionOk =
    Boolean(submission.ok) &&
    Boolean(submissionPayload.ok) &&
    Boolean(submissionPayload.submissionId);

  printSection("Lead Submission", {
    status: submission.status,
    responseOk: submission.ok,
    submissionOk,
    payload: submissionPayload,
    submissionId: submissionPayload.submissionId || null,
    hubspot: submissionPayload.hubspot || null,
    email: submissionPayload.email || null,
    message: submissionPayload.message || null,
    validationErrors: submissionPayload.validationErrors || [],
    rawPreview: submission.rawPreview || null,
  });

  const checks = {
    envConfigured: missingCriticalEnv.length === 0,
    health: health.ok,
    hubspot: hubspot.ok,
    email: email.ok,
    submission: submissionOk,
    submissionHubSpot: Boolean(submissionPayload?.hubspot?.ok),
    submissionEmail: Boolean(submissionPayload?.email?.ok),
  };

  printSection("Lead Pipeline Test Summary", checks);

  const failedChecks = Object.entries(checks)
    .filter(([, ok]) => !ok)
    .map(([key]) => key);

  if (failedChecks.length > 0) {
    console.error("\nLead pipeline checks failed", {
      failedChecks,
      note: "No secrets were printed. Fix missing config or provider failures and re-run.",
    });
    process.exit(1);
  }

  console.log("\nLead pipeline checks passed.");
}

main().catch((error) => {
  console.error("Lead pipeline test crashed", {
    safeError: error instanceof Error ? error.message : "Unknown error",
  });
  process.exit(1);
});
