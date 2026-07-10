import "dotenv/config";
import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-api-security";
import { listManagedPages, listRecentPosts, getPageDetails, MetaIntegrationError } from "@/lib/meta-facebook";
import { getMetaErrorStatus } from "@/lib/meta-api-response";
import { writeMetaAuditLog } from "@/lib/meta-audit-log";
import { getMetaSyncCache, setMetaSyncCache } from "@/lib/meta-sync-cache";

const CACHE_TTL_MS = 1000 * 60 * 5;

export async function POST(request: Request) {
  const auth = requireAdminAccess(request, {
    routeKey: "api:admin:meta:sync:post",
    limit: 12,
    requireWriteGuards: true,
  });

  if (!auth.ok) {
    return auth.response;
  }

  const cacheKey = "meta-sync";
  const fromCache = await getMetaSyncCache(cacheKey, CACHE_TTL_MS);
  if (fromCache) {
    return NextResponse.json({
      ok: true,
      cached: true,
      data: fromCache,
    });
  }

  try {
    const [pages, page, posts] = await Promise.all([listManagedPages(), getPageDetails(), listRecentPosts()]);

    const payload = {
      syncedAt: new Date().toISOString(),
      pagesCount: pages.length,
      activePageId: page.id,
      recentPostCount: posts.length,
      schedulerEnabled: false,
      schedulerReason:
        "Scheduled background sync is intentionally disabled by default. Trigger sync manually through this endpoint.",
    };

    await setMetaSyncCache(cacheKey, payload);

    await writeMetaAuditLog({
      timestamp: new Date().toISOString(),
      route: "api:admin:meta:sync:post",
      action: "sync-now",
      ip: auth.data.ip,
      targetId: page.id,
      details: `pages=${pages.length}; posts=${posts.length}`,
    });

    return NextResponse.json({
      ok: true,
      cached: false,
      data: payload,
    });
  } catch (error) {
    const status = getMetaErrorStatus(error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof MetaIntegrationError ? error.message : "Unable to run Meta sync.",
      },
      {
        status,
      }
    );
  }
}
