export type LeadSubmitPayload = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  websiteUrl?: string;
  formType: string;
  projectType?: string;
  preferredContactMethod?: string;
  clientType?: string;
  audienceType?: string;
  urgency?: string;
  budgetRange?: string;
  timeline?: string;
  website?: string;
  source?: string;
  utmSource?: string;
  utmCampaign?: string;
  message: string;
  pageUrl?: string;
};

export type LeadSubmitResult = {
  ok: boolean;
  submissionId?: string;
  message?: string;
  validationErrors?: string[];
  hubspot?: {
    ok: boolean;
    contactId: string | null;
    errorCode?: string;
  };
  email?: {
    ok: boolean;
    provider: string;
    messageId: string | null;
    errorCode?: string;
  };
};

function detectSource(utmSource: string | null) {
  const source = (utmSource ?? "").toLowerCase();

  if (source.includes("facebook") || source === "fb") {
    return "facebook";
  }

  if (source.includes("instagram") || source === "ig") {
    return "instagram";
  }

  return "organic";
}

function collectTrackingData() {
  if (typeof window === "undefined") {
    return {
      pageUrl: "",
      utmSource: "",
      utmCampaign: "",
      source: "organic",
    };
  }

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source") ?? "";
  const utmCampaign = params.get("utm_campaign") ?? "";

  return {
    pageUrl: window.location.href,
    utmSource,
    utmCampaign,
    source: detectSource(utmSource),
  };
}

export async function submitLeadForm(
  endpoint: string,
  payload: LeadSubmitPayload
): Promise<LeadSubmitResult> {
  const tracking = collectTrackingData();

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      pageUrl: payload.pageUrl || tracking.pageUrl,
      source: payload.source || tracking.source,
      utmSource: payload.utmSource || tracking.utmSource,
      utmCampaign: payload.utmCampaign || tracking.utmCampaign,
    }),
  });

  const data = (await response.json().catch(() => null)) as LeadSubmitResult | null;

  if (!response.ok || !data) {
    return {
      ok: false,
      message: data?.message || "Unable to submit your request right now.",
      validationErrors: data?.validationErrors,
      hubspot: data?.hubspot,
      email: data?.email,
      submissionId: data?.submissionId,
    };
  }

  return data;
}
