import { GoogleIntegrationError } from "@/lib/google-oauth";

export function getGoogleErrorStatus(error: unknown) {
  if (!(error instanceof GoogleIntegrationError)) {
    return 502;
  }

  if (error.code === "GOOGLE_SCOPE_MISSING" || error.code === "GOOGLE_SCOPE_OR_PERMISSION_ERROR") {
    return 403;
  }

  if (error.code === "GOOGLE_RESOURCE_NOT_FOUND") {
    return 404;
  }

  if (
    error.code === "GOOGLE_ACCOUNT_ID_MISSING" ||
    error.code === "GOOGLE_LOCATION_ID_MISSING" ||
    error.code === "GOOGLE_UPDATE_MASK_EMPTY"
  ) {
    return 400;
  }

  if (
    error.code === "GOOGLE_CONFIG_MISSING" ||
    error.code === "GOOGLE_REFRESH_TOKEN_MISSING" ||
    error.code === "GOOGLE_ACCESS_TOKEN_MISSING" ||
    error.code === "GOOGLE_TOKEN_REFRESH_FAILED"
  ) {
    return 500;
  }

  return 502;
}
