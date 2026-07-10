import "dotenv/config";
import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-api-security";
import { sanitizeText } from "@/lib/api-security";
import { getMetaErrorStatus } from "@/lib/meta-api-response";
import { writeMetaAuditLog } from "@/lib/meta-audit-log";
import { MetaIntegrationError, unpublishPage } from "@/lib/meta-facebook";
import { isMetaWriteEnabled } from "@/lib/meta-config";

type ConfirmActionBody = {
  action?: "merge" | "unpublish" | "delete";
  pageId?: string;
  confirmationText?: string;
  execute?: boolean;
};

function buildExpectedConfirmation(action: string, pageId: string) {
  return `CONFIRM ${action.toUpperCase()} ${pageId}`;
}

export async function POST(request: Request) {
  if (!isMetaWriteEnabled()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Meta write mode is disabled. Set META_ADMIN_WRITE_ENABLED=true to allow confirm actions.",
      },
      { status: 403 }
    );
  }

  const auth = requireAdminAccess(request, {
    routeKey: "api:admin:meta:confirm-action",
    limit: 8,
    requireWriteGuards: true,
  });

  if (!auth.ok) {
    return auth.response;
  }

  let body: ConfirmActionBody;

  try {
    body = (await request.json()) as ConfirmActionBody;
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

  const action = sanitizeText(body.action, 20).toLowerCase();
  const pageId = sanitizeText(body.pageId, 60);
  const confirmationText = sanitizeText(body.confirmationText, 200);
  const execute = Boolean(body.execute);

  if (!["merge", "unpublish", "delete"].includes(action) || !pageId) {
    return NextResponse.json(
      {
        ok: false,
        error: "action and pageId are required. action must be merge, unpublish, or delete.",
      },
      {
        status: 400,
      }
    );
  }

  const expected = buildExpectedConfirmation(action, pageId);
  if (confirmationText !== expected) {
    return NextResponse.json(
      {
        ok: false,
        error: "Manual confirmation text mismatch.",
        expectedConfirmationText: expected,
      },
      {
        status: 400,
      }
    );
  }

  if (!execute) {
    await writeMetaAuditLog({
      timestamp: new Date().toISOString(),
      route: "api:admin:meta:confirm-action:post",
      action: `confirm-${action}-dry-run`,
      ip: auth.data.ip,
      targetId: pageId,
      details: "Manual confirmation accepted in dry-run mode.",
    });

    return NextResponse.json({
      ok: true,
      dryRun: true,
      action,
      pageId,
      message:
        "Confirmation accepted. Re-send with execute=true to run the action. Destructive actions are never automatic.",
    });
  }

  if (action === "merge") {
    await writeMetaAuditLog({
      timestamp: new Date().toISOString(),
      route: "api:admin:meta:confirm-action:post",
      action: "merge-manual-required",
      ip: auth.data.ip,
      targetId: pageId,
      details: "Merge requested but intentionally not auto-executed.",
    });

    return NextResponse.json({
      ok: true,
      action,
      pageId,
      executed: false,
      message:
        "Merge must be completed manually in Meta Business Manager. API execution is not available here.",
    });
  }

  if (action === "delete") {
    await writeMetaAuditLog({
      timestamp: new Date().toISOString(),
      route: "api:admin:meta:confirm-action:post",
      action: "delete-blocked",
      ip: auth.data.ip,
      targetId: pageId,
      details: "Delete intentionally blocked by safety policy.",
    });

    return NextResponse.json({
      ok: true,
      action,
      pageId,
      executed: false,
      message:
        "Delete is intentionally disabled in this integration for safety. Handle deletion manually in Meta Business Manager.",
    });
  }

  try {
    const result = await unpublishPage(pageId);

    await writeMetaAuditLog({
      timestamp: new Date().toISOString(),
      route: "api:admin:meta:confirm-action:post",
      action: "unpublish-executed",
      ip: auth.data.ip,
      targetId: pageId,
      details: "Unpublish executed after explicit confirmation.",
    });

    return NextResponse.json({
      ok: true,
      action,
      pageId,
      executed: true,
      result,
    });
  } catch (error) {
    const status = getMetaErrorStatus(error);
    const message =
      error instanceof MetaIntegrationError ? error.message : "Unable to execute Meta action.";

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
