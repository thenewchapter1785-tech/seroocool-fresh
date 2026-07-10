import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-api-security";
import { getGoogleErrorStatus } from "@/lib/google-api-response";
import { GoogleIntegrationError } from "@/lib/google-oauth";
import { listBusinessAccounts } from "@/lib/google-business-profile";

export async function GET(request: Request) {
  const auth = requireAdminAccess(request, {
    routeKey: "api:admin:google-business:accounts",
  });

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const data = await listBusinessAccounts();

    return NextResponse.json({
      ok: true,
      accounts: data.accounts ?? [],
    });
  } catch (error) {
    const message =
      error instanceof GoogleIntegrationError
        ? error.message
        : "Unable to fetch Google Business accounts.";
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
