import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";

const DOTENV_PATH = path.resolve(process.cwd(), ".env");
const DIAGNOSTICS_PATH = "/api/admin/meta/diagnostics";
const DEFAULT_TIMEOUT_MS = 8000;

const dotenvResult = dotenv.config({
  path: DOTENV_PATH,
  override: true,
  quiet: true,
});

function isPresent(name) {
  return Boolean(process.env[name] && process.env[name].trim());
}

function firstPresent(names) {
  return names.find((name) => isPresent(name)) || "";
}

function resolveBaseUrl() {
  const explicit = (process.env.META_TEST_BASE_URL || "").trim();
  if (explicit) {
    return explicit;
  }

  const port = (process.env.META_TEST_PORT || process.env.PORT || "3000").trim();
  return `http://127.0.0.1:${port}`;
}

function safeParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return {
      raw: text.slice(0, 2000),
    };
  }
}

function sanitizeBody(value) {
  if (!value || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeBody(item));
  }

  const redactedKeys = /token|secret|authorization|admin[_-]?code|access[_-]?key/i;
  const result = {};

  for (const [key, raw] of Object.entries(value)) {
    if (redactedKeys.test(key)) {
      result[key] = "[REDACTED]";
      continue;
    }

    result[key] = sanitizeBody(raw);
  }

  return result;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  let timer = null;

  try {
    timer = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    const text = await response.text();

    return {
      ok: response.ok,
      status: response.status,
      body: safeParseJson(text),
    };
  } finally {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }
}

function reportValidationFailure(message, missingVariables) {
  console.error("meta:test environment validation failed");
  console.error(`reason=${message}`);

  if (missingVariables.length) {
    console.error("missingVariables:");
    for (const name of missingVariables) {
      console.error(`- ${name}`);
    }
  }

  console.error("hint=Update .env in workspace root, then re-run npm run meta:test");
  process.exitCode = 1;
}

async function main() {
  const userTokenAliases = [
    "META_USER_ACCESS_TOKEN",
    "META_GRAPH_TOKEN",
    "GRAPH_API_TOKEN",
    "FACEBOOK_ACCESS_TOKEN",
  ];

  if (!fs.existsSync(DOTENV_PATH)) {
    reportValidationFailure(".env file not found", [DOTENV_PATH]);
    return;
  }

  if (dotenvResult.error) {
    reportValidationFailure("Unable to load .env file", [DOTENV_PATH]);
    return;
  }

  const missingVariables = [];

  if (!isPresent("ADMIN_ACCESS_CODE")) {
    missingVariables.push("ADMIN_ACCESS_CODE");
  }

  if (!firstPresent(userTokenAliases)) {
    missingVariables.push(`one of: ${userTokenAliases.join(", ")}`);
  }

  if (missingVariables.length) {
    reportValidationFailure("Required Meta test variables are missing", missingVariables);
    return;
  }

  const baseUrl = resolveBaseUrl();
  const diagnosticsUrl = new URL(DIAGNOSTICS_PATH, baseUrl).toString();
  const headers = {
    "x-admin-code": process.env.ADMIN_ACCESS_CODE,
  };

  console.log("routeInventory:");
  console.log(`- baseUrl=${baseUrl}`);
  console.log(`- diagnosticsPath=${DIAGNOSTICS_PATH}`);
  console.log(`- requestUrl=${diagnosticsUrl}`);

  const healthUrl = new URL("/", baseUrl).toString();
  try {
    await fetchWithTimeout(healthUrl, { method: "GET" }, 4000);
  } catch (error) {
    console.error("meta:test failed: local app is not reachable");
    console.error(`baseUrl=${baseUrl}`);
    console.error("hint=Run npm run dev (or npm run start) and keep it running, then retry");
    if (error instanceof Error) {
      console.error(`error=${error.message}`);
    }
    process.exitCode = 1;
    return;
  }

  let diagnosticsResult;

  try {
    diagnosticsResult = await fetchWithTimeout(
      diagnosticsUrl,
      {
        method: "GET",
        headers,
      },
      DEFAULT_TIMEOUT_MS
    );
  } catch (error) {
    console.error("meta:test failed: diagnostics request did not complete");
    if (error instanceof Error) {
      console.error(`error=${error.message}`);
    }
    process.exitCode = 1;
    return;
  }

  const safeBody = sanitizeBody(diagnosticsResult.body);

  console.log(`diagnosticsStatus=${diagnosticsResult.status}`);
  console.log("diagnosticsBody=");
  console.log(JSON.stringify(safeBody, null, 2));

  if (diagnosticsResult.status === 404) {
    console.error("meta:test failed: diagnostics route not found");
    console.error(`expectedRoute=${DIAGNOSTICS_PATH}`);
    process.exitCode = 1;
    return;
  }

  if (!diagnosticsResult.ok) {
    console.error("meta:test failed: unable to load diagnostics endpoint");
    console.error(`status=${diagnosticsResult.status}`);
    process.exitCode = 1;
    return;
  }

  const token = diagnosticsResult.body?.token ?? {};
  const pages = Array.isArray(diagnosticsResult.body?.pages) ? diagnosticsResult.body.pages : [];
  const summary = diagnosticsResult.body?.summary ?? {};
  const webhook = diagnosticsResult.body?.webhook ?? {};

  const grantedScopes = Array.isArray(token.grantedScopes)
    ? token.grantedScopes
    : Array.isArray(token.diagnostics)
      ? token.diagnostics
          .filter((entry) => entry?.state === "granted")
          .map((entry) => entry?.name)
          .filter(Boolean)
      : [];

  const missingScopes = Array.isArray(token.missingScopes)
    ? token.missingScopes
    : Array.isArray(token.diagnostics)
      ? token.diagnostics
          .filter((entry) => entry?.state !== "granted")
          .map((entry) => entry?.name)
          .filter(Boolean)
      : [];

  const report = {
    mode: "read-only",
    tokenValidation: token.tokenValid ?? null,
    tokenType: token.tokenType || "unknown",
    tokenExpiration: token.expiresAt || null,
    grantedScopes,
    missingScopes,
    accessibleFacebookPages: pages.length,
    pages: pages.map((page) => ({
      id: page.id,
      name: page.name || "",
      category: page.category || "",
      tasks: Array.isArray(page.tasks) ? page.tasks : [],
    })),
    availablePageTasks: Array.isArray(summary.availableTasks) ? summary.availableTasks : [],
    metadataUpdatesAvailable: Boolean(summary.metadataUpdatesAvailable),
    postPublishingAvailable: Boolean(summary.postPublishingAvailable),
    webhookConfigurationStatus: {
      verifyTokenConfigured: Boolean(webhook.verifyTokenConfigured),
      appSecretConfigured: Boolean(webhook.appSecretConfigured),
      callbackRoute: webhook.callbackRoute || "/api/meta/webhook",
      configured: Boolean(webhook.verifyTokenConfigured) && Boolean(webhook.appSecretConfigured),
    },
  };

  console.log("metaDiagnosticsReport=");
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error("meta:test failed unexpectedly");
  if (error instanceof Error) {
    console.error(`error=${error.message}`);
  }
  process.exitCode = 1;
});
