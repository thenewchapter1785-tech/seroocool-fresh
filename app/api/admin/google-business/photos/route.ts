import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-api-security";
import { sanitizeText } from "@/lib/api-security";
import { getGoogleErrorStatus } from "@/lib/google-api-response";
import { uploadPhoto } from "@/lib/google-business-profile";
import { GoogleIntegrationError } from "@/lib/google-oauth";

type PhotoBody = {
  locationName?: string;
  sourceUrl?: string;
  description?: string;
};

export async function POST(request: Request) {
  const auth = requireAdminAccess(request, {
    routeKey: "api:admin:google-business:photos",
    limit: 12,
  });

  if (!auth.ok) {
    return auth.response;
  }

  let body: PhotoBody;

  try {
    body = (await request.json()) as PhotoBody;
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

  const locationName = sanitizeText(body.locationName, 200);
  const sourceUrl = sanitizeText(body.sourceUrl, 400);
  const description = sanitizeText(body.description, 300);

  if (!sourceUrl || !/^https?:\/\//.test(sourceUrl)) {
    return NextResponse.json(
      {
        ok: false,
        error: "A valid sourceUrl is required.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const response = await uploadPhoto({
      locationName,
      payload: {
        sourceUrl,
        description,
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
        : "Unable to upload Google Business photo.";
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
