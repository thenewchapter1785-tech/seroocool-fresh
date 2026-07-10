import "server-only";

import { getGoogleAccessToken, getGoogleBusinessResourceDefaults, GoogleIntegrationError } from "@/lib/google-oauth";

const ACCOUNT_API_BASE = "https://mybusinessaccountmanagement.googleapis.com/v1";
const BUSINESS_INFO_API_BASE = "https://mybusinessbusinessinformation.googleapis.com/v1";
const LEGACY_BUSINESS_API_BASE = "https://mybusiness.googleapis.com/v4";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT";

type BusinessHoursPeriod = {
  openDay: string;
  openTime: string;
  closeDay: string;
  closeTime: string;
};

type GoogleLocationPatch = {
  description?: string;
  websiteUrl?: string;
  phoneNumber?: string;
  regularHours?: {
    periods: BusinessHoursPeriod[];
  };
};

type LocalPostPayload = {
  summary: string;
  languageCode?: string;
  callToAction?: {
    actionType: string;
    url: string;
  };
};

type PhotoPayload = {
  sourceUrl: string;
  description?: string;
};

function trimLeadingSlash(value: string) {
  return value.replace(/^\/+/, "");
}

function toPathSegment(path: string) {
  return trimLeadingSlash(path);
}

function buildLocationReadMask() {
  return [
    "name",
    "title",
    "profile",
    "websiteUri",
    "phoneNumbers",
    "regularHours",
    "primaryCategory",
    "storefrontAddress",
    "serviceArea",
    "serviceAreaBusiness",
  ].join(",");
}

async function googleRequest<TResponse>(method: HttpMethod, url: string, body?: unknown) {
  const { token } = await getGoogleAccessToken();

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    const statusMessage = `Google Business Profile API request failed (${response.status}).`;

    if (response.status === 403) {
      throw new GoogleIntegrationError(
        "GOOGLE_SCOPE_OR_PERMISSION_ERROR",
        `${statusMessage} Ensure OAuth scope business.manage is granted and the authenticated account has access to this business profile.`
      );
    }

    if (response.status === 404) {
      throw new GoogleIntegrationError(
        "GOOGLE_RESOURCE_NOT_FOUND",
        `${statusMessage} Business account or location was not found.`
      );
    }

    throw new GoogleIntegrationError(
      "GOOGLE_API_REQUEST_FAILED",
      `${statusMessage} ${errorText || "No additional details returned."}`
    );
  }

  if (response.status === 204) {
    return {} as TResponse;
  }

  return (await response.json()) as TResponse;
}

function getResolvedAccountName(accountName?: string) {
  if (accountName?.trim()) {
    return accountName.trim();
  }

  return getGoogleBusinessResourceDefaults().accountName;
}

function getResolvedLocationName(locationName?: string) {
  if (locationName?.trim()) {
    return locationName.trim();
  }

  return getGoogleBusinessResourceDefaults().locationName;
}

export async function listBusinessAccounts() {
  return googleRequest<{ accounts?: Array<Record<string, unknown>> }>(
    "GET",
    `${ACCOUNT_API_BASE}/accounts`
  );
}

export async function listLocations(accountName?: string) {
  const resolvedAccount = getResolvedAccountName(accountName);

  if (!resolvedAccount) {
    throw new GoogleIntegrationError(
      "GOOGLE_ACCOUNT_ID_MISSING",
      "No business account provided. Set GOOGLE_BUSINESS_ACCOUNT_ID or pass accountName in request."
    );
  }

  const readMask = encodeURIComponent(buildLocationReadMask());
  const path = `${ACCOUNT_API_BASE}/${toPathSegment(resolvedAccount)}/locations?readMask=${readMask}`;

  return googleRequest<{ locations?: Array<Record<string, unknown>> }>("GET", path);
}

export async function getLocation(locationName?: string) {
  const resolvedLocation = getResolvedLocationName(locationName);

  if (!resolvedLocation) {
    throw new GoogleIntegrationError(
      "GOOGLE_LOCATION_ID_MISSING",
      "No location provided. Set GOOGLE_BUSINESS_LOCATION_ID or pass locationName in request."
    );
  }

  const readMask = encodeURIComponent(buildLocationReadMask());
  const path = `${BUSINESS_INFO_API_BASE}/${toPathSegment(resolvedLocation)}?readMask=${readMask}`;

  return googleRequest<Record<string, unknown>>("GET", path);
}

export async function updateBusinessDescription(locationName: string, description: string) {
  const path = `${BUSINESS_INFO_API_BASE}/${toPathSegment(locationName)}?updateMask=profile.description`;
  return googleRequest<Record<string, unknown>>("PATCH", path, {
    profile: {
      description,
    },
  });
}

export async function updateBusinessHours(
  locationName: string,
  regularHours: { periods: BusinessHoursPeriod[] }
) {
  const path = `${BUSINESS_INFO_API_BASE}/${toPathSegment(locationName)}?updateMask=regularHours`;
  return googleRequest<Record<string, unknown>>("PATCH", path, {
    regularHours,
  });
}

export async function updateWebsiteUrl(locationName: string, websiteUrl: string) {
  const path = `${BUSINESS_INFO_API_BASE}/${toPathSegment(locationName)}?updateMask=websiteUri`;
  return googleRequest<Record<string, unknown>>("PATCH", path, {
    websiteUri: websiteUrl,
  });
}

export async function updatePhoneNumber(locationName: string, phoneNumber: string) {
  const path = `${BUSINESS_INFO_API_BASE}/${toPathSegment(
    locationName
  )}?updateMask=phoneNumbers.primaryPhone`;
  return googleRequest<Record<string, unknown>>("PATCH", path, {
    phoneNumbers: {
      primaryPhone: phoneNumber,
    },
  });
}

export async function updateLocationProfile(locationName: string, payload: GoogleLocationPatch) {
  const updateMask: string[] = [];
  const body: Record<string, unknown> = {};

  if (typeof payload.description === "string") {
    updateMask.push("profile.description");
    body.profile = {
      description: payload.description,
    };
  }

  if (typeof payload.websiteUrl === "string") {
    updateMask.push("websiteUri");
    body.websiteUri = payload.websiteUrl;
  }

  if (typeof payload.phoneNumber === "string") {
    updateMask.push("phoneNumbers.primaryPhone");
    body.phoneNumbers = {
      primaryPhone: payload.phoneNumber,
    };
  }

  if (payload.regularHours?.periods) {
    updateMask.push("regularHours");
    body.regularHours = payload.regularHours;
  }

  if (!updateMask.length) {
    throw new GoogleIntegrationError(
      "GOOGLE_UPDATE_MASK_EMPTY",
      "No updatable location fields were provided."
    );
  }

  const path = `${BUSINESS_INFO_API_BASE}/${toPathSegment(
    locationName
  )}?updateMask=${encodeURIComponent(updateMask.join(","))}`;

  return googleRequest<Record<string, unknown>>("PATCH", path, body);
}

export async function listReviews(locationName?: string) {
  const resolvedLocation = getResolvedLocationName(locationName);

  if (!resolvedLocation) {
    throw new GoogleIntegrationError(
      "GOOGLE_LOCATION_ID_MISSING",
      "No location provided. Set GOOGLE_BUSINESS_LOCATION_ID or pass locationName in request."
    );
  }

  const path = `${LEGACY_BUSINESS_API_BASE}/${toPathSegment(resolvedLocation)}/reviews`;
  return googleRequest<{ reviews?: Array<Record<string, unknown>> }>("GET", path);
}

export async function replyToReview(params: {
  locationName?: string;
  reviewId: string;
  replyText: string;
}) {
  const resolvedLocation = getResolvedLocationName(params.locationName);

  if (!resolvedLocation) {
    throw new GoogleIntegrationError(
      "GOOGLE_LOCATION_ID_MISSING",
      "No location provided. Set GOOGLE_BUSINESS_LOCATION_ID or pass locationName in request."
    );
  }

  const path = `${LEGACY_BUSINESS_API_BASE}/${toPathSegment(
    resolvedLocation
  )}/reviews/${encodeURIComponent(params.reviewId)}/reply`;

  return googleRequest<Record<string, unknown>>("PUT", path, {
    comment: params.replyText,
  });
}

export async function createLocalPost(params: {
  locationName?: string;
  payload: LocalPostPayload;
}) {
  const resolvedLocation = getResolvedLocationName(params.locationName);

  if (!resolvedLocation) {
    throw new GoogleIntegrationError(
      "GOOGLE_LOCATION_ID_MISSING",
      "No location provided. Set GOOGLE_BUSINESS_LOCATION_ID or pass locationName in request."
    );
  }

  const path = `${LEGACY_BUSINESS_API_BASE}/${toPathSegment(resolvedLocation)}/localPosts`;

  try {
    return await googleRequest<Record<string, unknown>>("POST", path, params.payload);
  } catch (error) {
    if (error instanceof GoogleIntegrationError) {
      throw error;
    }

    throw new GoogleIntegrationError(
      "GOOGLE_LOCAL_POST_UNSUPPORTED",
      "Local posts are not available for this profile or API configuration."
    );
  }
}

export async function uploadPhoto(params: { locationName?: string; payload: PhotoPayload }) {
  const resolvedLocation = getResolvedLocationName(params.locationName);

  if (!resolvedLocation) {
    throw new GoogleIntegrationError(
      "GOOGLE_LOCATION_ID_MISSING",
      "No location provided. Set GOOGLE_BUSINESS_LOCATION_ID or pass locationName in request."
    );
  }

  const path = `${LEGACY_BUSINESS_API_BASE}/${toPathSegment(resolvedLocation)}/media`;

  try {
    return await googleRequest<Record<string, unknown>>("POST", path, {
      mediaFormat: "PHOTO",
      sourceUrl: params.payload.sourceUrl,
      description: params.payload.description,
    });
  } catch (error) {
    if (error instanceof GoogleIntegrationError) {
      throw error;
    }

    throw new GoogleIntegrationError(
      "GOOGLE_PHOTO_UPLOAD_UNSUPPORTED",
      "Photo uploads are not available for this profile or API configuration."
    );
  }
}
