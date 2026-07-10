import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-api-security";
import { sanitizeText } from "@/lib/api-security";
import { getGoogleErrorStatus } from "@/lib/google-api-response";
import { GoogleIntegrationError } from "@/lib/google-oauth";
import {
  getLocation,
  updateBusinessDescription,
  updateBusinessHours,
  updatePhoneNumber,
  updateWebsiteUrl,
} from "@/lib/google-business-profile";

type HoursPeriodInput = {
  openDay?: string;
  openTime?: string;
  closeDay?: string;
  closeTime?: string;
};

type UpdateLocationBody = {
  locationName?: string;
  description?: string;
  websiteUrl?: string;
  phoneNumber?: string;
  businessHours?: HoursPeriodInput[];
  servicesTextSuggestions?: string;
};

function sanitizePeriod(period: HoursPeriodInput) {
  return {
    openDay: sanitizeText(period.openDay, 12),
    openTime: sanitizeText(period.openTime, 4),
    closeDay: sanitizeText(period.closeDay, 12),
    closeTime: sanitizeText(period.closeTime, 4),
  };
}

function isValidTime(value: string) {
  return /^([01]\d|2[0-3])[0-5]\d$/.test(value);
}

function isValidDay(value: string) {
  return [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ].includes(value);
}

export async function GET(request: Request) {
  const auth = requireAdminAccess(request, {
    routeKey: "api:admin:google-business:location:get",
  });

  if (!auth.ok) {
    return auth.response;
  }

  const requestUrl = new URL(request.url);
  const locationName = sanitizeText(requestUrl.searchParams.get("locationName"), 200);

  try {
    const location = await getLocation(locationName || undefined);

    return NextResponse.json({
      ok: true,
      location,
    });
  } catch (error) {
    const message =
      error instanceof GoogleIntegrationError
        ? error.message
        : "Unable to fetch Google Business location details.";
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

export async function PATCH(request: Request) {
  const auth = requireAdminAccess(request, {
    routeKey: "api:admin:google-business:location:patch",
    limit: 20,
  });

  if (!auth.ok) {
    return auth.response;
  }

  let body: UpdateLocationBody;

  try {
    body = (await request.json()) as UpdateLocationBody;
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

  if (!locationName) {
    return NextResponse.json(
      {
        ok: false,
        error: "locationName is required.",
      },
      {
        status: 400,
      }
    );
  }

  const description = sanitizeText(body.description, 750);
  const servicesTextSuggestions = sanitizeText(body.servicesTextSuggestions, 400);
  const websiteUrl = sanitizeText(body.websiteUrl, 220);
  const phoneNumber = sanitizeText(body.phoneNumber, 30);

  if (websiteUrl && !/^https?:\/\//.test(websiteUrl)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Website URL must start with http:// or https://",
      },
      {
        status: 400,
      }
    );
  }

  const normalizedHours = (body.businessHours ?? [])
    .map(sanitizePeriod)
    .filter((period) => period.openDay || period.closeDay || period.openTime || period.closeTime);

  for (const period of normalizedHours) {
    if (
      !isValidDay(period.openDay) ||
      !isValidDay(period.closeDay) ||
      !isValidTime(period.openTime) ||
      !isValidTime(period.closeTime)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Business hours must use valid day names and 24h HHMM times.",
        },
        {
          status: 400,
        }
      );
    }
  }

  const updateTasks: Promise<unknown>[] = [];

  if (description || servicesTextSuggestions) {
    const finalDescription = [description, servicesTextSuggestions].filter(Boolean).join("\n\n");
    updateTasks.push(updateBusinessDescription(locationName, finalDescription));
  }

  if (websiteUrl) {
    updateTasks.push(updateWebsiteUrl(locationName, websiteUrl));
  }

  if (phoneNumber) {
    updateTasks.push(updatePhoneNumber(locationName, phoneNumber));
  }

  if (normalizedHours.length > 0) {
    updateTasks.push(
      updateBusinessHours(locationName, {
        periods: normalizedHours,
      })
    );
  }

  if (!updateTasks.length) {
    return NextResponse.json(
      {
        ok: false,
        error: "No valid update fields were provided.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    await Promise.all(updateTasks);
    const updatedLocation = await getLocation(locationName);

    return NextResponse.json({
      ok: true,
      location: updatedLocation,
    });
  } catch (error) {
    const message =
      error instanceof GoogleIntegrationError
        ? error.message
        : "Unable to update Google Business location.";
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
