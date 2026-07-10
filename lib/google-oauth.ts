import "server-only";

import { google } from "googleapis";
import { readOptionalEnv } from "@/lib/env";

const GOOGLE_BUSINESS_SCOPE = "https://www.googleapis.com/auth/business.manage";

export class GoogleIntegrationError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

function readGoogleConfig() {
  const clientId = readOptionalEnv("GOOGLE_CLIENT_ID").trim();
  const clientSecret = readOptionalEnv("GOOGLE_CLIENT_SECRET").trim();
  const redirectUri = readOptionalEnv("GOOGLE_REDIRECT_URI").trim();
  const refreshToken = readOptionalEnv("GOOGLE_REFRESH_TOKEN").trim();

  if (!clientId || !clientSecret || !redirectUri) {
    throw new GoogleIntegrationError(
      "GOOGLE_CONFIG_MISSING",
      "Google OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI."
    );
  }

  if (!refreshToken) {
    throw new GoogleIntegrationError(
      "GOOGLE_REFRESH_TOKEN_MISSING",
      "Google refresh token is missing. Set GOOGLE_REFRESH_TOKEN before calling Google Business Profile APIs."
    );
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
    refreshToken,
  };
}

export function createGoogleOAuthClient() {
  const config = readGoogleConfig();

  const oauthClient = new google.auth.OAuth2({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    redirectUri: config.redirectUri,
  });

  oauthClient.setCredentials({
    refresh_token: config.refreshToken,
  });

  return oauthClient;
}

function normalizeScopes(scopeValue: string | undefined) {
  return (scopeValue ?? "")
    .split(" ")
    .map((value) => value.trim())
    .filter(Boolean);
}

export async function getGoogleAccessToken() {
  const oauthClient = createGoogleOAuthClient();

  try {
    const tokenResponse = await oauthClient.getAccessToken();
    const token = tokenResponse.token?.trim();

    if (!token) {
      throw new GoogleIntegrationError(
        "GOOGLE_ACCESS_TOKEN_MISSING",
        "Google OAuth did not return an access token. Recreate your refresh token and verify OAuth consent settings."
      );
    }

    const oauth2 = google.oauth2("v2");
    const tokenInfo = await oauth2.tokeninfo({
      access_token: token,
    });

    const scopes = normalizeScopes(tokenInfo.data.scope ?? undefined);

    if (!scopes.includes(GOOGLE_BUSINESS_SCOPE)) {
      throw new GoogleIntegrationError(
        "GOOGLE_SCOPE_MISSING",
        `Google OAuth token is missing required scope: ${GOOGLE_BUSINESS_SCOPE}`
      );
    }

    return {
      token,
      scopes,
    };
  } catch (error) {
    const details =
      error instanceof Error ? error.message : "Unknown Google OAuth token refresh error";

    if (error instanceof GoogleIntegrationError) {
      throw error;
    }

    throw new GoogleIntegrationError(
      "GOOGLE_TOKEN_REFRESH_FAILED",
      `Failed to refresh Google OAuth access token: ${details}`
    );
  }
}

export function getGoogleBusinessResourceDefaults() {
  const accountId = readOptionalEnv("GOOGLE_BUSINESS_ACCOUNT_ID").trim();
  const locationId = readOptionalEnv("GOOGLE_BUSINESS_LOCATION_ID").trim();

  const accountName = accountId
    ? accountId.startsWith("accounts/")
      ? accountId
      : `accounts/${accountId}`
    : "";

  const locationName = locationId
    ? locationId.startsWith("accounts/")
      ? locationId
      : locationId.startsWith("locations/")
      ? `${accountName}/${locationId}`.replace("accounts//", "")
      : accountName
        ? `${accountName}/locations/${locationId}`
        : `locations/${locationId}`
    : "";

  return {
    accountName,
    locationName,
  };
}
