import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-api-security";
import { sanitizeText } from "@/lib/api-security";
import { getGoogleErrorStatus } from "@/lib/google-api-response";
import { listReviews } from "@/lib/google-business-profile";
import { GoogleIntegrationError } from "@/lib/google-oauth";

export async function GET(request: Request) {
  const auth = requireAdminAccess(request, {
    routeKey: "api:admin:google-business:reviews",
  });

  if (!auth.ok) {
    return auth.response;
  }

  const requestUrl = new URL(request.url);
  const locationName = sanitizeText(requestUrl.searchParams.get("locationName"), 200);

  try {
    const data = await listReviews(locationName || undefined);

    return NextResponse.json({
      ok: true,
      reviews: data.reviews ?? [],
    });
  } catch (error) {
    const message =
      error instanceof GoogleIntegrationError
        ? error.message
        : "Unable to fetch Google Business reviews.";
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
