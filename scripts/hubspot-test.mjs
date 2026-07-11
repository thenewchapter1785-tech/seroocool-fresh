import { config as loadEnv } from "dotenv";

loadEnv();

const token = process.env.HUBSPOT_ACCESS_TOKEN;

if (!token) {
  console.error("HUBSPOT_ACCESS_TOKEN is missing");
  process.exit(1);
}

const requiredCapabilities = [
  "crm.objects.contacts.read",
  "crm.objects.contacts.write",
];

function parseJsonSafe(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function detectTokenType(value) {
  const trimmed = (value || "").trim();

  if (!trimmed) {
    return "missing";
  }

  if (trimmed.startsWith("pat-")) {
    return "hubspot_private_app_token";
  }

  if (trimmed.startsWith("pk-")) {
    return "api_key_like_value_invalid_for_bearer";
  }

  if (trimmed.startsWith("hapi") || trimmed.startsWith("hapikey")) {
    return "legacy_api_key_like_value_invalid_for_bearer";
  }

  if (trimmed.split(".").length === 3) {
    return "jwt_or_oauth_token_like_value";
  }

  return "unknown_format";
}

function classifyHubSpotError(status, body) {
  const lower = JSON.stringify(body || {}).toLowerCase();

  if (status === 401) {
    return {
      category: "invalid_or_expired_token",
      safeMessage: "HubSpot rejected the token. It may be invalid, expired, or not a private app bearer token.",
    };
  }

  if (status === 403) {
    const missingScope =
      lower.includes("scope") || lower.includes("permission") || lower.includes("forbidden");

    return {
      category: missingScope ? "missing_scope" : "forbidden",
      safeMessage: missingScope
        ? "HubSpot token is authenticated but missing required CRM scopes."
        : "HubSpot denied access to this endpoint.",
    };
  }

  if (status === 429) {
    return {
      category: "rate_limited",
      safeMessage: "HubSpot API rate limit was reached.",
    };
  }

  if (status >= 500) {
    return {
      category: "hubspot_server_error",
      safeMessage: "HubSpot returned a server error.",
    };
  }

  return {
    category: "request_failed",
    safeMessage: "HubSpot request failed.",
  };
}

async function getHubSpotAuthStatus() {
  const response = await fetch("https://api.hubapi.com/integrations/v1/me", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const body = await response.text();
  return { response, body };
}

async function getContactReadCapability() {
  const response = await fetch("https://api.hubapi.com/crm/v3/properties/contacts?limit=1", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const body = await response.text();
  return { response, body };
}

async function main() {
  const tokenType = detectTokenType(token);

  if (tokenType === "api_key_like_value_invalid_for_bearer") {
    console.error("HubSpot connectivity test failed", {
      safeError: "HUBSPOT_ACCESS_TOKEN appears to be an API-key style value. Use a private app bearer token.",
    });
    process.exit(1);
  }

  const auth = await getHubSpotAuthStatus();
  const authBody = parseJsonSafe(auth.body);

  if (!auth.response.ok) {
    const classified = classifyHubSpotError(auth.response.status, authBody);

    console.error("HubSpot connectivity test failed", {
      status: auth.response.status,
      errorCategory: classified.category,
      safeError: classified.safeMessage,
      bearerAuthUsed: true,
      tokenType,
      requiredScopes: requiredCapabilities,
    });
    process.exit(1);
  }

  const readCapability = await getContactReadCapability();
  const readBody = parseJsonSafe(readCapability.body);

  const readOk = readCapability.response.ok;

  const readError = !readOk
    ? classifyHubSpotError(readCapability.response.status, readBody)
    : null;

  if (!readOk) {
    console.error("HubSpot connectivity test failed", {
      authStatus: auth.response.status,
      contactReadStatus: readCapability.response.status,
      bearerAuthUsed: true,
      tokenType,
      requiredScopes: requiredCapabilities,
      checks: {
        contactRead: readOk ? "ok" : "failed",
        contactWrite: "required_but_not_verified_in_read_only_mode",
      },
      readFailureCategory: readError?.category ?? null,
      writeFailureCategory: null,
      safeError: readError?.safeMessage || "Missing required HubSpot capability.",
    });
    process.exit(1);
  }

  console.log("HubSpot connectivity test passed", {
    authStatus: auth.response.status,
    contactReadStatus: readCapability.response.status,
    bearerAuthUsed: true,
    tokenType,
    capabilities: {
      required: requiredCapabilities,
      contactRead: readOk ? "ok" : "failed",
      contactWrite: "required_but_not_verified_in_read_only_mode",
    },
    notes: [
      "Read-only auth endpoint passed.",
      "No write operation is executed in this test.",
    ],
  });
}

main().catch((error) => {
  console.error("HubSpot connectivity test crashed", error);
  process.exit(1);
});
