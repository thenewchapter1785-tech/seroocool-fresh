import "dotenv/config";
import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-api-security";
import { sanitizeText } from "@/lib/api-security";
import { getMetaErrorStatus } from "@/lib/meta-api-response";
import { writeMetaAuditLog } from "@/lib/meta-audit-log";
import { getPageDetails, listRecentPosts, MetaIntegrationError, updatePageProfile } from "@/lib/meta-facebook";
import { consumeMetaProfileReview, createMetaProfileReview } from "@/lib/meta-profile-review-store";
import { isMetaWriteEnabled } from "@/lib/meta-config";

type UpdatePageBody = {
  about?: string;
  website?: string;
  email?: string;
  phone?: string;
  username?: string;
  applyConfirmed?: boolean;
  reviewToken?: string;
};

export async function GET(request: Request) {
  const auth = requireAdminAccess(request, {
    routeKey: "api:admin:meta:page:get",
  });

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const [page, recentPosts] = await Promise.all([getPageDetails(), listRecentPosts()]);

    return NextResponse.json({
      ok: true,
      page,
      recentPosts,
    });
  } catch (error) {
    const status = getMetaErrorStatus(error);
    const message =
      error instanceof MetaIntegrationError
        ? error.message
        : "Unable to load active Facebook Page details.";

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

export async function PATCH(request: Request) {
  if (!isMetaWriteEnabled()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Meta write mode is disabled. Set META_ADMIN_WRITE_ENABLED=true to allow page updates.",
      },
      { status: 403 }
    );
  }

  const auth = requireAdminAccess(request, {
    routeKey: "api:admin:meta:page:patch",
    limit: 20,
    requireWriteGuards: true,
  });

  if (!auth.ok) {
    return auth.response;
  }

  let body: UpdatePageBody;

  try {
    body = (await request.json()) as UpdatePageBody;
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
    const proposed = {
      about: sanitizeText(body.about, 2000),
      website: sanitizeText(body.website, 240),
      email: sanitizeText(body.email, 160),
      phone: sanitizeText(body.phone, 40),
      username: sanitizeText(body.username, 80),
    };

    const applyConfirmed = Boolean(body.applyConfirmed);

    if (!applyConfirmed) {
      const current = await getPageDetails();

      const review = await createMetaProfileReview({
        pageId: current.id,
        current: {
          about: current.about,
          website: current.website,
          email: current.emails?.[0],
          phone: current.phone,
          username: current.username,
        },
        proposed,
      });

      return NextResponse.json({
        ok: true,
        reviewOnly: true,
        review: {
          token: review.token,
          changes: review.changes,
          expiresAt: review.expiresAt,
        },
      });
    }

    const reviewToken = sanitizeText(body.reviewToken, 120);
    if (!reviewToken) {
      return NextResponse.json(
        {
          ok: false,
          error: "reviewToken is required when applyConfirmed=true.",
        },
        {
          status: 400,
        }
      );
    }

    const review = await consumeMetaProfileReview(reviewToken);
    if (!review) {
      return NextResponse.json(
        {
          ok: false,
          error: "Review token is invalid or expired. Generate a fresh review before applying.",
        },
        {
          status: 400,
        }
      );
    }

    await updatePageProfile(review.proposed, review.pageId);

    await writeMetaAuditLog({
      timestamp: new Date().toISOString(),
      route: "api:admin:meta:page:patch",
      action: "update-page-profile-apply",
      ip: auth.data.ip,
      targetId: review.pageId,
      details: `Applied profile review token ${reviewToken}.`,
    });

    const [page, recentPosts] = await Promise.all([getPageDetails(), listRecentPosts()]);

    return NextResponse.json({
      ok: true,
      page,
      recentPosts,
    });
  } catch (error) {
    const status = getMetaErrorStatus(error);
    const message =
      error instanceof MetaIntegrationError
        ? error.message
        : "Unable to update Facebook Page profile.";

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
