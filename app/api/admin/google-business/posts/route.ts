import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-api-security";
import { sanitizeText } from "@/lib/api-security";
import { generateLocalPostDraft } from "@/lib/admin-ai";
import { getGoogleErrorStatus } from "@/lib/google-api-response";
import { createLocalPost } from "@/lib/google-business-profile";
import { GoogleIntegrationError } from "@/lib/google-oauth";

type PostBody = {
  action?: "generate" | "publish";
  locationName?: string;
  topic?: string;
  callToAction?: string;
  content?: string;
  ctaUrl?: string;
};

export async function POST(request: Request) {
  const auth = requireAdminAccess(request, {
    routeKey: "api:admin:google-business:posts",
    limit: 20,
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

  const action = body.action === "publish" ? "publish" : "generate";
  const locationName = sanitizeText(body.locationName, 200);
  const topic = sanitizeText(body.topic, 120);
  const callToAction = sanitizeText(body.callToAction, 180) ||
    "Get your free estimate at https://zerocool-development.com/free-consultation";

  if (!topic) {
    return NextResponse.json(
      {
        ok: false,
        error: "topic is required.",
      },
      {
        status: 400,
      }
    );
  }

  if (action === "generate") {
    const draft = await generateLocalPostDraft({
      topic,
      callToAction,
    });

    return NextResponse.json({
      ok: true,
      draft,
    });
  }

  const content = sanitizeText(body.content, 1400);
  if (!content) {
    return NextResponse.json(
      {
        ok: false,
        error: "content is required to publish a post.",
      },
      {
        status: 400,
      }
    );
  }

  const ctaUrl = sanitizeText(body.ctaUrl, 240) || "https://zerocool-development.com/free-consultation";

  try {
    const response = await createLocalPost({
      locationName,
      payload: {
        summary: content,
        languageCode: "en",
        callToAction: {
          actionType: "LEARN_MORE",
          url: ctaUrl,
        },
      },
    });

    return NextResponse.json({
      ok: true,
      response,
    });
  } catch (error) {
    const message =
      error instanceof GoogleIntegrationError
        ? error.message
        : "Unable to publish Google Business post.";
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
