import { config as loadEnv } from "dotenv";

loadEnv();

const apiKey = process.env.RESEND_API_KEY;
const destination =
  process.env.CONTACT_EMAIL?.trim() || "zerocool.development.project@gmail.com";
const fromAddress =
  process.env.EMAIL_FROM?.trim() ||
  process.env.LEAD_FROM_EMAIL?.trim() ||
  "onboarding@resend.dev";

if (!apiKey) {
  console.error("RESEND_API_KEY is missing");
  process.exit(1);
}

function extractEmailAddress(input) {
  const angleMatch = input.match(/<([^>]+)>/);
  const raw = angleMatch?.[1] || input;
  return raw.trim().toLowerCase();
}

function emailDomain(address) {
  const parts = address.split("@");
  return parts.length === 2 ? parts[1] : "";
}

function parseJsonSafe(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function classifyResendFailure(params) {
  const status = params.status;
  const lower = JSON.stringify(params.body || {}).toLowerCase();

  if (status === 401) {
    return {
      category: "invalid_api_key",
      safeMessage: "Resend rejected API credentials.",
    };
  }

  if (lower.includes("verify") && lower.includes("domain")) {
    return {
      category: "unverified_domain",
      safeMessage: "Sender domain is not verified in Resend.",
    };
  }

  if (lower.includes("recipient") && lower.includes("test")) {
    return {
      category: "test_recipient_restriction",
      safeMessage: "Resend account restrictions allow sending only to test recipients.",
    };
  }

  if (lower.includes("from") && lower.includes("domain") && lower.includes("not")) {
    return {
      category: "domain_mismatch",
      safeMessage: "EMAIL_FROM domain does not match a verified Resend domain.",
    };
  }

  if (lower.includes("from") && (lower.includes("invalid") || lower.includes("sender"))) {
    return {
      category: "invalid_sender",
      safeMessage: "EMAIL_FROM sender address is invalid.",
    };
  }

  if (status === 403) {
    return {
      category: "unauthorized_or_policy_rejection",
      safeMessage: "Resend rejected this send due to account policy or sender authorization.",
    };
  }

  return {
    category: "provider_error",
    safeMessage: `Resend rejected request with status ${status}.`,
  };
}

async function main() {
  const keyFormatValid = apiKey.startsWith("re_");
  if (!keyFormatValid) {
    console.error("Email provider connectivity test failed", {
      provider: "resend",
      failureCategory: "invalid_api_key",
      safeError: "RESEND_API_KEY format is invalid for Resend.",
    });
    process.exit(1);
  }

  const senderEmail = extractEmailAddress(fromAddress);
  const senderDomain = emailDomain(senderEmail);

  if (!senderEmail || !senderDomain || senderEmail.endsWith("@gmail.com")) {
    console.error("Email provider connectivity test failed", {
      provider: "resend",
      from: fromAddress,
      failureCategory: "invalid_sender",
      safeError: "EMAIL_FROM must be a valid non-Gmail sender on a verified domain.",
    });
    process.exit(1);
  }

  const domainsResponse = await fetch("https://api.resend.com/domains", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  const domainsBody = parseJsonSafe(await domainsResponse.text());

  if (!domainsResponse.ok) {
    const classifiedDomains = classifyResendFailure({
      status: domainsResponse.status,
      body: domainsBody,
    });

    console.error("Email provider connectivity test failed", {
      provider: "resend",
      status: domainsResponse.status,
      failureCategory: classifiedDomains.category,
      safeError: classifiedDomains.safeMessage,
      from: fromAddress,
      destination,
    });
    process.exit(1);
  }

  const domains = Array.isArray(domainsBody?.data) ? domainsBody.data : [];
  const domainsWithStatus = domains.map((d) => ({
    id: String(d?.id || ""),
    name: String(d?.name || "").toLowerCase(),
    status: String(d?.status || "").toLowerCase(),
  }));

  const verifiedDomains = domainsWithStatus
    .filter((d) => d.status === "verified")
    .map((d) => String(d?.name || "").toLowerCase())
    .filter(Boolean);

  const senderDomainRecord = domainsWithStatus.find(
    (d) => senderDomain === d.name || senderDomain.endsWith(`.${d.name}`)
  );

  let senderDomainSendVerified = false;

  if (senderDomainRecord?.id) {
    const detailResponse = await fetch(`https://api.resend.com/domains/${senderDomainRecord.id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    const detailBody = parseJsonSafe(await detailResponse.text());
    const records = Array.isArray(detailBody?.records) ? detailBody.records : [];
    const sendingRecords = records.filter((r) => {
      const recordType = String(r?.record || "").toLowerCase();
      return recordType === "dkim" || recordType === "spf";
    });

    senderDomainSendVerified =
      sendingRecords.length > 0 &&
      sendingRecords.every((r) => String(r?.status || "").toLowerCase() === "verified");
  }

  if (senderDomainRecord && !senderDomainSendVerified && senderDomainRecord.status !== "verified") {
    console.error("Email provider connectivity test failed", {
      provider: "resend",
      status: 400,
      from: fromAddress,
      destination,
      failureCategory: "unverified_domain",
      safeError: `Sender domain exists in Resend but is not fully verified (status: ${senderDomainRecord.status}).`,
    });
    process.exit(1);
  }

  const senderDomainAllowed = verifiedDomains.some(
    (domain) => senderDomain === domain || senderDomain.endsWith(`.${domain}`)
  );

  if (!senderDomainAllowed) {
    console.error("Email provider connectivity test failed", {
      provider: "resend",
      status: 400,
      from: fromAddress,
      destination,
      failureCategory: verifiedDomains.length > 0 ? "domain_mismatch" : "unverified_domain",
      safeError:
        verifiedDomains.length > 0
          ? "EMAIL_FROM domain does not match any verified Resend domain."
          : "No verified Resend domain found for this account.",
    });
    process.exit(1);
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [destination],
      subject: "ZeroCool Development - Email Delivery Test",
      text: [
        "This is a test notification from ZeroCool Development lead pipeline.",
        `Timestamp: ${new Date().toISOString()}`,
        "No customer action is required.",
      ].join("\n"),
      html: [
        "<p>This is a test notification from ZeroCool Development lead pipeline.</p>",
        `<p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>`,
        "<p>No customer action is required.</p>",
      ].join("\n"),
    }),
  });

  const body = parseJsonSafe(await response.text());

  if (!response.ok) {
    const classified = classifyResendFailure({
      status: response.status,
      body,
    });

    console.error("Email provider connectivity test failed", {
      provider: "resend",
      status: response.status,
      from: fromAddress,
      destination,
      failureCategory: classified.category,
      safeError: classified.safeMessage,
    });
    process.exit(1);
  }

  console.log("Email provider connectivity test passed", {
    provider: "resend",
    status: response.status,
    accepted: true,
    messageId: body?.id ?? null,
    from: fromAddress,
    destination,
  });
}

main().catch((error) => {
  console.error("Email provider connectivity test crashed", error);
  process.exit(1);
});
