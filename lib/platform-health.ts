import "server-only";

import { readOptionalEnv } from "@/lib/env";

export type IntegrationState =
  | "working"
  | "configured but unverified"
  | "incomplete"
  | "blocked by missing credentials"
  | "blocked by permissions"
  | "manual setup required";

export type IntegrationStatus = {
  name: string;
  status: IntegrationState;
  detail: string;
};

function hasAll(keys: string[]) {
  return keys.every((key) => Boolean(readOptionalEnv(key).trim()));
}

function hasAny(keys: string[]) {
  return keys.some((key) => Boolean(readOptionalEnv(key).trim()));
}

export function getMissingEnvironmentVariables() {
  const required: string[] = [
    "NEXT_PUBLIC_SITE_URL",
    "CONTACT_EMAIL",
    "LEAD_FROM_EMAIL",
    "RESEND_API_KEY",
    "HUBSPOT_ACCESS_TOKEN",
    "NEXT_PUBLIC_HUBSPOT_PORTAL_ID",
    "OPENAI_API_KEY",
    "ADMIN_ACCESS_CODE",
  ];

  return required.filter((name) => !readOptionalEnv(name).trim());
}

export function getIntegrationStatuses(): IntegrationStatus[] {
  const metaReadOnly = readOptionalEnv("META_ADMIN_WRITE_ENABLED").trim().toLowerCase() !== "true";
  const googleConfigured = hasAll([
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REDIRECT_URI",
    "GOOGLE_REFRESH_TOKEN",
  ]);

  return [
    {
      name: "OpenAI",
      status: readOptionalEnv("OPENAI_API_KEY").trim()
        ? "configured but unverified"
        : "blocked by missing credentials",
      detail: readOptionalEnv("OPENAI_API_KEY").trim()
        ? "API key is configured. Run live prompt checks to verify runtime connectivity."
        : "Set OPENAI_API_KEY.",
    },
    {
      name: "HubSpot",
      status: hasAll(["HUBSPOT_ACCESS_TOKEN", "NEXT_PUBLIC_HUBSPOT_PORTAL_ID"])
        ? "configured but unverified"
        : "blocked by missing credentials",
      detail: hasAll(["HUBSPOT_ACCESS_TOKEN", "NEXT_PUBLIC_HUBSPOT_PORTAL_ID"])
        ? "Contact + deal upsert is configured. Verify by submitting a production lead."
        : "Set HUBSPOT_ACCESS_TOKEN and NEXT_PUBLIC_HUBSPOT_PORTAL_ID.",
    },
    {
      name: "Google Business Profile",
      status: googleConfigured
        ? "configured but unverified"
        : hasAny(["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_REDIRECT_URI"])
          ? "incomplete"
          : "blocked by missing credentials",
      detail: googleConfigured
        ? "OAuth credentials are present. Business scope and account/location access still require manual verification."
        : "Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, and GOOGLE_REFRESH_TOKEN.",
    },
    {
      name: "Meta/Facebook",
      status: hasAll(["META_APP_ID", "META_APP_SECRET", "META_USER_ACCESS_TOKEN", "META_PAGE_ID"])
        ? "configured but unverified"
        : hasAny(["META_APP_ID", "META_USER_ACCESS_TOKEN", "META_PAGE_ID"])
          ? "incomplete"
          : "blocked by missing credentials",
      detail: hasAll(["META_APP_ID", "META_APP_SECRET", "META_USER_ACCESS_TOKEN", "META_PAGE_ID"])
        ? `Core credentials are configured. Write mode is ${metaReadOnly ? "read-only" : "enabled"}.`
        : "Set META_APP_ID, META_APP_SECRET, META_USER_ACCESS_TOKEN, and META_PAGE_ID.",
    },
    {
      name: "Google Analytics",
      status: readOptionalEnv("NEXT_PUBLIC_GA_ID").trim()
        ? "configured but unverified"
        : "manual setup required",
      detail: readOptionalEnv("NEXT_PUBLIC_GA_ID").trim()
        ? "Tracking ID is configured in client script."
        : "Set NEXT_PUBLIC_GA_ID and verify events in GA.",
    },
    {
      name: "Microsoft Clarity",
      status: readOptionalEnv("NEXT_PUBLIC_CLARITY_ID").trim()
        ? "configured but unverified"
        : "manual setup required",
      detail: readOptionalEnv("NEXT_PUBLIC_CLARITY_ID").trim()
        ? "Clarity project ID is configured in client script."
        : "Set NEXT_PUBLIC_CLARITY_ID.",
    },
    {
      name: "Cloudflare",
      status: "manual setup required",
      detail: "Domain/CDN/WAF status must be validated in Cloudflare dashboard.",
    },
    {
      name: "DigitalOcean",
      status: "manual setup required",
      detail: "App status, deploy health, and env sync must be validated in App Platform.",
    },
  ];
}
