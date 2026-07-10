import "dotenv/config";
import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-api-security";
import { sanitizeText } from "@/lib/api-security";
import { setActiveMetaPageId, getActiveMetaPageId } from "@/lib/meta-active-page";
import { writeMetaAuditLog } from "@/lib/meta-audit-log";

type Body = {
  pageId?: string;
};

export async function GET(request: Request) {
  const auth = requireAdminAccess(request, {
    routeKey: "api:admin:meta:active-page:get",
  });

  if (!auth.ok) {
    return auth.response;
  }

  const pageId = await getActiveMetaPageId();

  return NextResponse.json({
    ok: true,
    pageId,
  });
}

export async function PUT(request: Request) {
  const auth = requireAdminAccess(request, {
    routeKey: "api:admin:meta:active-page:put",
    limit: 15,
    requireWriteGuards: true,
  });

  if (!auth.ok) {
    return auth.response;
  }

  let body: Body;

  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid JSON payload.",
      },
      {
        status: 400,
      }
    );
  }

  const pageId = sanitizeText(body.pageId, 120);

  if (!pageId) {
    return NextResponse.json(
      {
        ok: false,
        error: "pageId is required.",
      },
      {
        status: 400,
      }
    );
  }

  const result = await setActiveMetaPageId(pageId);

  await writeMetaAuditLog({
    timestamp: new Date().toISOString(),
    route: "api:admin:meta:active-page:put",
    action: "set-active-page",
    ip: auth.data.ip,
    targetId: pageId,
    details: "Active page updated by admin endpoint.",
  });

  return NextResponse.json({
    ok: true,
    pageId: result.pageId,
    updatedAt: result.updatedAt,
  });
}
