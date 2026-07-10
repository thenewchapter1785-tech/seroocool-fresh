import "dotenv/config";
import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-api-security";
import { sanitizeText } from "@/lib/api-security";
import { getMetaErrorStatus } from "@/lib/meta-api-response";
import { writeMetaAuditLog } from "@/lib/meta-audit-log";
import { createOrSchedulePost, deletePost, MetaIntegrationError } from "@/lib/meta-facebook";
import { isMetaWriteEnabled } from "@/lib/meta-config";

type PostBody = {
  message?: string;
  link?: string;
  scheduledPublishTime?: string;
};

type DeletePostBody = {
  postId?: string;
  confirmationText?: string;
};

export async function POST(request: Request) {
  if (!isMetaWriteEnabled()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Meta write mode is disabled. Set META_ADMIN_WRITE_ENABLED=true to allow publishing.",
      },
      { status: 403 }
    );
  }

  const auth = requireAdminAccess(request, {
    routeKey: "api:admin:meta:posts",
    limit: 15,
    requireWriteGuards: true,
  });

  if (!auth.ok) {
    return auth.response;
  }

  let body: PostBody;

  try {
    body = (await request.json()) as PostBody;
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

  const message = sanitizeText(body.message, 5000);
  const link = sanitizeText(body.link, 300);

  const scheduledUnix = body.scheduledPublishTime
    ? Math.floor(new Date(body.scheduledPublishTime).getTime() / 1000)
    : undefined;

  try {
    const result = await createOrSchedulePost({
      message,
      link,
      scheduledPublishTime: Number.isFinite(scheduledUnix) ? scheduledUnix : undefined,
    });

    await writeMetaAuditLog({
      timestamp: new Date().toISOString(),
      route: "api:admin:meta:posts:post",
      action: scheduledUnix ? "schedule-post" : "create-post",
      ip: auth.data.ip,
      targetId: result.id,
      details: "Post create/schedule request accepted.",
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    const status = getMetaErrorStatus(error);
    const messageText =
      error instanceof MetaIntegrationError
        ? error.message
        : "Unable to create or schedule Facebook post.";

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

export async function DELETE(request: Request) {
  if (!isMetaWriteEnabled()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Meta write mode is disabled. Set META_ADMIN_WRITE_ENABLED=true to allow deletes.",
      },
      { status: 403 }
    );
  }

  const auth = requireAdminAccess(request, {
    routeKey: "api:admin:meta:posts:delete",
    limit: 10,
    requireWriteGuards: true,
  });

  if (!auth.ok) {
    return auth.response;
  }

  let body: DeletePostBody;

  try {
    body = (await request.json()) as DeletePostBody;
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

  const postId = sanitizeText(body.postId, 120);
  const confirmationText = sanitizeText(body.confirmationText, 220);

  if (!postId) {
    return NextResponse.json(
      {
        ok: false,
        error: "postId is required.",
      },
      {
        status: 400,
      }
    );
  }

  const expected = `CONFIRM DELETE POST ${postId}`;
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

  try {
    const result = await deletePost(postId);

    await writeMetaAuditLog({
      timestamp: new Date().toISOString(),
      route: "api:admin:meta:posts:delete",
      action: "delete-post",
      ip: auth.data.ip,
      targetId: postId,
      details: "Post deletion executed after explicit confirmation.",
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    const status = getMetaErrorStatus(error);
    const messageText =
      error instanceof MetaIntegrationError ? error.message : "Unable to delete Facebook post.";

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
