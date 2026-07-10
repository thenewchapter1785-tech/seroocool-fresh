import "dotenv/config";
import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-api-security";
import { getMetaErrorStatus } from "@/lib/meta-api-response";
import { auditPagesAndRecommendations, MetaIntegrationError } from "@/lib/meta-facebook";

export async function GET(request: Request) {
  const auth = requireAdminAccess(request, {
    routeKey: "api:admin:meta:recommendations",
  });

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const data = await auditPagesAndRecommendations();

    return NextResponse.json({
      ok: true,
      recommendations: data.recommendations,
      audit: data.audit,
    });
  } catch (error) {
    const status = getMetaErrorStatus(error);
    const message =
      error instanceof MetaIntegrationError
        ? error.message
        : "Unable to generate Facebook page recommendations.";

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
