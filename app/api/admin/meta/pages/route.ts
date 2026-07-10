import "dotenv/config";
import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-api-security";
import { getMetaErrorStatus } from "@/lib/meta-api-response";
import { listManagedPages, MetaIntegrationError } from "@/lib/meta-facebook";

export async function GET(request: Request) {
  const auth = requireAdminAccess(request, {
    routeKey: "api:admin:meta:pages",
  });

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const pages = await listManagedPages();

    return NextResponse.json({
      ok: true,
      pages,
    });
  } catch (error) {
    const status = getMetaErrorStatus(error);
    const message =
      error instanceof MetaIntegrationError
        ? error.message
        : "Unable to list managed Facebook pages.";

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
