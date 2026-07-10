import "dotenv/config";
import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-api-security";
import { sanitizeText } from "@/lib/api-security";
import { writeMetaAuditLog } from "@/lib/meta-audit-log";
import { getMetaErrorStatus } from "@/lib/meta-api-response";
import {
  deleteComment,
  listRecentComments,
  MetaIntegrationError,
  replyToComment,
  setCommentHidden,
} from "@/lib/meta-facebook";
import { isMetaWriteEnabled } from "@/lib/meta-config";

type Body = {
  action?: "reply" | "hide" | "unhide" | "delete";
  commentId?: string;
  message?: string;
  confirmationText?: string;
};

function buildExpectedConfirmation(action: string, commentId: string) {
  return `CONFIRM ${action.toUpperCase()} ${commentId}`;
}

export async function POST(request: Request) {
  if (!isMetaWriteEnabled()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Meta write mode is disabled. Set META_ADMIN_WRITE_ENABLED=true to allow comment actions.",
      },
      { status: 403 }
    );
  }

  const auth = requireAdminAccess(request, {
    routeKey: "api:admin:meta:engagement:post",
    limit: 20,
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

  const action = sanitizeText(body.action, 20).toLowerCase();
  const commentId = sanitizeText(body.commentId, 120);
  const message = sanitizeText(body.message, 800);
  const confirmationText = sanitizeText(body.confirmationText, 220);

  if (!commentId || !["reply", "hide", "unhide", "delete"].includes(action)) {
    return NextResponse.json(
      {
        ok: false,
        error: "action and commentId are required.",
      },
      {
        status: 400,
      }
    );
  }

  const expected = buildExpectedConfirmation(action, commentId);

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

  if (action === "reply" && !message) {
    return NextResponse.json(
      {
        ok: false,
        error: "message is required for reply action.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    let result: unknown;

    if (action === "reply") {
      result = await replyToComment(commentId, message);
    } else if (action === "hide") {
      result = await setCommentHidden(commentId, true);
    } else if (action === "unhide") {
      result = await setCommentHidden(commentId, false);
    } else {
      result = await deleteComment(commentId);
    }

    await writeMetaAuditLog({
      timestamp: new Date().toISOString(),
      route: "api:admin:meta:engagement:post",
      action,
      ip: auth.data.ip,
      targetId: commentId,
      details: action === "reply" ? "Reply executed." : "Moderation action executed.",
    });

    return NextResponse.json({
      ok: true,
      action,
      commentId,
      executed: true,
      result,
    });
  } catch (error) {
    const status = getMetaErrorStatus(error);
    const messageText =
      error instanceof MetaIntegrationError ? error.message : "Unable to execute engagement action.";

    return NextResponse.json(
      {
        ok: false,
        error: messageText,
      },
      {
        status,
      }
    );
  }
}

export async function GET(request: Request) {
  const auth = requireAdminAccess(request, {
    routeKey: "api:admin:meta:engagement:get",
  });

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const comments = await listRecentComments();
    return NextResponse.json({
      ok: true,
      comments,
    });
  } catch (error) {
    const status = getMetaErrorStatus(error);
    const messageText =
      error instanceof MetaIntegrationError ? error.message : "Unable to fetch recent engagement.";

    return NextResponse.json(
      {
        ok: false,
        error: messageText,
      },
      {
        status,
      }
    );
  }
}
