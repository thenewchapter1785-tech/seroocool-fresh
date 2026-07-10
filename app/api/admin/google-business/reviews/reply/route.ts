import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-api-security";
import { sanitizeText } from "@/lib/api-security";
import { generateReviewReplyDraft } from "@/lib/admin-ai";
import { getGoogleErrorStatus } from "@/lib/google-api-response";
import { replyToReview } from "@/lib/google-business-profile";
import { GoogleIntegrationError } from "@/lib/google-oauth";

type ReviewReplyBody = {
  action?: "generate" | "publish";
  locationName?: string;
  reviewId?: string;
  reviewerName?: string;
  reviewText?: string;
  rating?: number;
  replyText?: string;
};

export async function POST(request: Request) {
  const auth = requireAdminAccess(request, {
    routeKey: "api:admin:google-business:reviews:reply",
    limit: 20,
  });

  if (!auth.ok) {
    return auth.response;
  }

  let body: ReviewReplyBody;

  try {
    body = (await request.json()) as ReviewReplyBody;
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

  const action = body.action === "publish" ? "publish" : "generate";
  const locationName = sanitizeText(body.locationName, 200);
  const reviewId = sanitizeText(body.reviewId, 120);
  const reviewerName = sanitizeText(body.reviewerName, 120);
  const reviewText = sanitizeText(body.reviewText, 1200);
  const replyText = sanitizeText(body.replyText, 1200);
  const rating = Number.isFinite(body.rating) ? Number(body.rating) : 5;

  if (action === "generate") {
    const draft = await generateReviewReplyDraft({
      reviewerName,
      rating,
      reviewText,
    });

    return NextResponse.json({
      ok: true,
      draft,
      generatedBy: "manual-or-openai",
    });
  }

  if (!reviewId || !replyText) {
    return NextResponse.json(
      {
        ok: false,
        error: "reviewId and replyText are required to publish a reply.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const response = await replyToReview({
      locationName,
      reviewId,
      replyText,
    });

    return NextResponse.json({
      ok: true,
      response,
    });
  } catch (error) {
    const message =
      error instanceof GoogleIntegrationError
        ? error.message
        : "Unable to publish Google review reply.";
    const status = getGoogleErrorStatus(error);

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
