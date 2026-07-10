import { MetaIntegrationError } from "@/lib/meta-facebook";

export function getMetaErrorStatus(error: unknown) {
  if (!(error instanceof MetaIntegrationError)) {
    return 502;
  }

  if (error.code === "META_PERMISSION_MISSING") {
    return 403;
  }

  if (error.code === "META_PAGE_NOT_FOUND") {
    return 404;
  }

  if (error.code === "META_VALIDATION_ERROR") {
    return 400;
  }

  if (error.code === "META_RATE_LIMITED") {
    return 429;
  }

  if (error.code === "META_CONFIG_MISSING" || error.code === "META_TOKEN_INVALID") {
    return 500;
  }

  return 502;
}
