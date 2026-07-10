import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-api-security";
import { sanitizeText } from "@/lib/api-security";
import { getGoogleErrorStatus } from "@/lib/google-api-response";
import { GoogleIntegrationError } from "@/lib/google-oauth";
import { listLocations } from "@/lib/google-business-profile";

export async function GET(request: Request) {
  const auth = requireAdminAccess(request, {
    routeKey: "api:admin:google-business:locations",
  });

  if (!auth.ok) {
    return auth.response;
  }

  const requestUrl = new URL(request.url);
  const accountName = sanitizeText(requestUrl.searchParams.get("accountName"), 200);

  try {
    const data = await listLocations(accountName || undefined);

    return NextResponse.json({
      ok: true,
      locations: data.locations ?? [],
    });
  } catch (error) {
    const message =
      error instanceof GoogleIntegrationError
        ? error.message
        : "Unable to fetch Google Business locations.";
    const status = getGoogleErrorStatus(error);

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      {
        status,
      }
    );
  }
}
