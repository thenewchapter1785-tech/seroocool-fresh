import "dotenv/config";
import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-api-security";
import { sanitizeText } from "@/lib/api-security";
import { deleteMetaPostDraft, listMetaPostDrafts, upsertMetaPostDraft } from "@/lib/meta-draft-store";

type Body = {
  id?: string;
  title?: string;
  message?: string;
  link?: string;
  scheduleAt?: string;
};

export async function GET(request: Request) {
  const auth = requireAdminAccess(request, {
    routeKey: "api:admin:meta:drafts:get",
  });

  if (!auth.ok) {
    return auth.response;
  }

  const drafts = await listMetaPostDrafts();
  return NextResponse.json({
    ok: true,
    drafts,
  });
}

export async function PUT(request: Request) {
  const auth = requireAdminAccess(request, {
    routeKey: "api:admin:meta:drafts:put",
    limit: 25,
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

  try {
    const draft = await upsertMetaPostDraft({
      id: sanitizeText(body.id, 40),
      title: sanitizeText(body.title, 120),
      message: sanitizeText(body.message, 5000),
      link: sanitizeText(body.link, 300),
      scheduleAt: sanitizeText(body.scheduleAt, 60),
    });

    return NextResponse.json({
      ok: true,
      draft,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to save draft.",
      },
      {
        status: 400,
      }
    );
  }
}

export async function DELETE(request: Request) {
  const auth = requireAdminAccess(request, {
    routeKey: "api:admin:meta:drafts:delete",
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

  const id = sanitizeText(body.id, 40);
  if (!id) {
    return NextResponse.json(
      {
        ok: false,
        error: "Draft id is required.",
      },
      {
        status: 400,
      }
    );
  }

  const removed = await deleteMetaPostDraft(id);

  return NextResponse.json({
    ok: true,
    removed,
  });
}
