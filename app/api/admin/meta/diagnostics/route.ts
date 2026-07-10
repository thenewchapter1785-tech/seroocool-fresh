import "dotenv/config";
import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-api-security";
import { getMetaErrorStatus } from "@/lib/meta-api-response";
import { getMetaSafeDiagnostics } from "@/lib/meta-config";
import {
  getMetaIdentity,
  getMetaTokenDiagnostics,
  listManagedPagesDiagnostics,
  MetaIntegrationError,
} from "@/lib/meta-facebook";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = requireAdminAccess(request, {
    routeKey: "api:admin:meta:diagnostics:get",
  });

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const [token, config, identity, pages] = await Promise.all([
      getMetaTokenDiagnostics(),
      getMetaSafeDiagnostics(),
      getMetaIdentity(),
      listManagedPagesDiagnostics(),
    ]);

    const availableTasks = Array.from(
      new Set(
        pages.flatMap((page) => (Array.isArray(page.tasks) ? page.tasks : [])).filter((task) => Boolean(task))
      )
    ).sort();

    const metadataUpdatesAvailable =
      availableTasks.includes("MANAGE") ||
      availableTasks.includes("MODERATE") ||
      Boolean(Array.isArray(token.grantedScopes) && token.grantedScopes.includes("pages_manage_metadata"));

    const postPublishingAvailable =
      availableTasks.includes("CREATE_CONTENT") ||
      availableTasks.includes("MANAGE") ||
      Boolean(Array.isArray(token.grantedScopes) && token.grantedScopes.includes("pages_manage_posts"));

    const webhook = {
      verifyTokenConfigured: Boolean(config.verifyToken),
      appSecretConfigured: Boolean(config.appSecret),
      callbackRoute: "/api/meta/webhook",
    };

    return NextResponse.json({
      ok: true,
      config,
      token,
      identity: {
        id: identity.id,
        name: identity.name ?? "",
      },
      pages: pages.map((page) => ({
        id: page.id,
        name: page.name ?? "",
        category: page.category ?? "",
        tasks: Array.isArray(page.tasks) ? page.tasks : [],
      })),
      summary: {
        managedPagesCount: pages.length,
        availableTasks,
        metadataUpdatesAvailable,
        postPublishingAvailable,
      },
      webhook,
    });
  } catch (error) {
    const status = getMetaErrorStatus(error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof MetaIntegrationError ? error.message : "Unable to load Meta diagnostics.",
      },
      {
        status,
      }
    );
  }
}
