import { getContactEmail, getLeadSenderEmail, readOptionalEnv } from "@/lib/env";

const RESEND_URL = "https://api.resend.com/emails";
const RESEND_DOMAINS_URL = "https://api.resend.com/domains";
const EXTERNAL_REQUEST_TIMEOUT_MS = 8000;

type NotificationParams = {
  leadName: string;
  leadEmail: string;
  leadPhone?: string;
  subject: string;
  body: string;
};

export type LeadNotificationInput = {
  submissionId: string;
  name: string;
  email: string;
  phone?: string;
  preferredContactMethod?: string;
  formType: string;
  service?: string;
  message: string;
  urgency?: string;
  personalOrBusiness?: string;
  budget?: string;
  timeline?: string;
  pageUrl?: string;
  submittedAt: string;
  hubspotContactId?: string | null;
  source?: string;
  utmSource?: string;
  utmCampaign?: string;
  metadata?: Record<string, string>;
};

export type EmailProviderResult = {
  ok: boolean;
  provider: "resend";
  messageId: string | null;
  statusCode?: number;
  errorCode?:
    | "EMAIL_PROVIDER_NOT_CONFIGURED"
    | "EMAIL_BAD_REQUEST"
    | "EMAIL_INVALID_API_KEY"
    | "EMAIL_INVALID_SENDER"
    | "EMAIL_DOMAIN_MISMATCH"
    | "EMAIL_UNVERIFIED_DOMAIN"
    | "EMAIL_TEST_RECIPIENT_RESTRICTED"
    | "EMAIL_UNAUTHORIZED"
    | "EMAIL_RATE_LIMITED"
    | "EMAIL_PROVIDER_ERROR"
    | "EMAIL_NETWORK_ERROR";
  safeMessage?: string;
};

export type EmailConnectionResult = {
  ok: boolean;
  provider: "resend";
  statusCode?: number;
  safeMessage?: string;
  errorCode?: EmailProviderResult["errorCode"];
};

function getSenderAddress() {
  return readOptionalEnv("EMAIL_FROM", getLeadSenderEmail()).trim();
}

function isValidReplyTo(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs = EXTERNAL_REQUEST_TIMEOUT_MS
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function mapEmailStatusCode(statusCode: number): EmailProviderResult["errorCode"] {
  if (statusCode === 400) {
    return "EMAIL_BAD_REQUEST";
  }
  if (statusCode === 401 || statusCode === 403) {
    return "EMAIL_UNAUTHORIZED";
  }
  if (statusCode === 429) {
    return "EMAIL_RATE_LIMITED";
  }

  return "EMAIL_PROVIDER_ERROR";
}

function toSafeLowerText(value: unknown) {
  return typeof value === "string" ? value.toLowerCase() : "";
}

function classifyResendFailure(params: {
  statusCode: number;
  errorText: string;
}): {
  errorCode: EmailProviderResult["errorCode"];
  safeMessage: string;
} {
  const text = toSafeLowerText(params.errorText);

  if (params.statusCode === 401) {
    return {
      errorCode: "EMAIL_INVALID_API_KEY",
      safeMessage: "Email provider rejected API credentials.",
    };
  }

  if (text.includes("verify") && text.includes("domain")) {
    return {
      errorCode: "EMAIL_UNVERIFIED_DOMAIN",
      safeMessage: "Sender domain is not verified with the email provider.",
    };
  }

  if (text.includes("from") && text.includes("domain") && text.includes("not")) {
    return {
      errorCode: "EMAIL_DOMAIN_MISMATCH",
      safeMessage: "Sender domain does not match a verified provider domain.",
    };
  }

  if (
    text.includes("only send") ||
    text.includes("test") ||
    text.includes("recipient")
  ) {
    return {
      errorCode: "EMAIL_TEST_RECIPIENT_RESTRICTED",
      safeMessage: "Provider test-recipient restriction blocked this send.",
    };
  }

  if (text.includes("from") && (text.includes("invalid") || text.includes("sender"))) {
    return {
      errorCode: "EMAIL_INVALID_SENDER",
      safeMessage: "Sender address is invalid for this provider account.",
    };
  }

  return {
    errorCode: mapEmailStatusCode(params.statusCode),
    safeMessage: `Email provider rejected request with status ${params.statusCode}.`,
  };
}

function buildLeadNotificationBody(lead: LeadNotificationInput) {
  const metadataLines = Object.entries(lead.metadata ?? {}).map(
    ([key, value]) => `<li><strong>${key}</strong>: ${value}</li>`
  );

  const textLines = [
    `Submission ID: ${lead.submissionId}`,
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone || "not provided"}`,
    `Preferred contact method: ${lead.preferredContactMethod || "not provided"}`,
    `Form submitted: ${lead.formType}`,
    `Service requested: ${lead.service || "not provided"}`,
    `Problem or message: ${lead.message}`,
    `Urgency: ${lead.urgency || "not provided"}`,
    `Personal or business: ${lead.personalOrBusiness || "not provided"}`,
    `Budget: ${lead.budget || "not provided"}`,
    `Timeline: ${lead.timeline || "not provided"}`,
    `Source page: ${lead.pageUrl || "not provided"}`,
    `Lead source: ${lead.source || "not provided"}`,
    `UTM source: ${lead.utmSource || "not provided"}`,
    `UTM campaign: ${lead.utmCampaign || "not provided"}`,
    `Submission time: ${lead.submittedAt}`,
    `HubSpot contact ID: ${lead.hubspotContactId || "not available"}`,
  ];

  if (metadataLines.length > 0) {
    textLines.push("Metadata:");
    Object.entries(lead.metadata ?? {}).forEach(([key, value]) => {
      textLines.push(`- ${key}: ${value}`);
    });
  }

  return {
    subject: `New ZeroCool Development Lead - ${lead.service || lead.formType}`,
    text: textLines.join("\n"),
    html: [
      "<h1>New ZeroCool Development Lead</h1>",
      `<p><strong>Submission ID:</strong> ${lead.submissionId}</p>`,
      "<ul>",
      `<li><strong>Name:</strong> ${lead.name}</li>`,
      `<li><strong>Email:</strong> ${lead.email}</li>`,
      `<li><strong>Phone:</strong> ${lead.phone || "not provided"}</li>`,
      `<li><strong>Preferred contact method:</strong> ${lead.preferredContactMethod || "not provided"}</li>`,
      `<li><strong>Form submitted:</strong> ${lead.formType}</li>`,
      `<li><strong>Service requested:</strong> ${lead.service || "not provided"}</li>`,
      `<li><strong>Urgency:</strong> ${lead.urgency || "not provided"}</li>`,
      `<li><strong>Personal or business:</strong> ${lead.personalOrBusiness || "not provided"}</li>`,
      `<li><strong>Budget:</strong> ${lead.budget || "not provided"}</li>`,
      `<li><strong>Timeline:</strong> ${lead.timeline || "not provided"}</li>`,
      `<li><strong>Source page:</strong> ${lead.pageUrl || "not provided"}</li>`,
      `<li><strong>Submission time:</strong> ${lead.submittedAt}</li>`,
      `<li><strong>HubSpot contact ID:</strong> ${lead.hubspotContactId || "not available"}</li>`,
      "</ul>",
      `<p><strong>Problem or message:</strong><br/>${lead.message.replace(/\n/g, "<br/>")}</p>`,
      metadataLines.length > 0 ? `<h2>Metadata</h2><ul>${metadataLines.join("")}</ul>` : "",
    ].join("\n"),
  };
}

async function sendViaResend(params: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}): Promise<EmailProviderResult> {
  const resendApiKey = readOptionalEnv("RESEND_API_KEY").trim();

  if (!resendApiKey) {
    return {
      ok: false,
      provider: "resend",
      messageId: null,
      errorCode: "EMAIL_PROVIDER_NOT_CONFIGURED",
      safeMessage: "RESEND_API_KEY is missing.",
    };
  }

  try {
    const response = await fetchWithTimeout(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getSenderAddress(),
        to: [params.to],
        reply_to: params.replyTo,
        subject: params.subject,
        text: params.text,
        html: params.html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      const classified = classifyResendFailure({
        statusCode: response.status,
        errorText,
      });

      return {
        ok: false,
        provider: "resend",
        messageId: null,
        statusCode: response.status,
        errorCode: classified.errorCode,
        safeMessage: classified.safeMessage,
      };
    }

    const payload = (await response.json()) as { id?: string };

    return {
      ok: true,
      provider: "resend",
      messageId: payload.id ?? null,
      statusCode: response.status,
    };
  } catch {
    return {
      ok: false,
      provider: "resend",
      messageId: null,
      errorCode: "EMAIL_NETWORK_ERROR",
      safeMessage: "Unable to reach email provider.",
    };
  }
}

export async function checkEmailProviderConnection(): Promise<EmailConnectionResult> {
  const resendApiKey = readOptionalEnv("RESEND_API_KEY").trim();

  if (!resendApiKey) {
    return {
      ok: false,
      provider: "resend",
      errorCode: "EMAIL_PROVIDER_NOT_CONFIGURED",
      safeMessage: "RESEND_API_KEY is missing.",
    };
  }

  try {
    const response = await fetchWithTimeout(RESEND_DOMAINS_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
      },
    });

    if (!response.ok) {
      await response.text().catch(() => "");
      return {
        ok: false,
        provider: "resend",
        statusCode: response.status,
        errorCode: mapEmailStatusCode(response.status),
        safeMessage: `Email provider diagnostics failed with status ${response.status}.`,
      };
    }

    return {
      ok: true,
      provider: "resend",
      statusCode: response.status,
      safeMessage: "Email provider credentials accepted.",
    };
  } catch {
    return {
      ok: false,
      provider: "resend",
      errorCode: "EMAIL_NETWORK_ERROR",
      safeMessage: "Unable to connect to email provider diagnostics endpoint.",
    };
  }
}

export async function sendLeadNotification(lead: LeadNotificationInput): Promise<EmailProviderResult> {
  const body = buildLeadNotificationBody(lead);

  return sendViaResend({
    to: getContactEmail(),
    subject: body.subject,
    text: body.text,
    html: body.html,
    replyTo: isValidReplyTo(lead.email) ? lead.email : undefined,
  });
}

export async function sendEmailDeliveryTest() {
  return sendViaResend({
    to: getContactEmail(),
    subject: "ZeroCool Development - Email Delivery Test",
    text: [
      "This is a test notification from ZeroCool Development lead pipeline.",
      `Timestamp: ${new Date().toISOString()}`,
      "No customer action is required.",
    ].join("\n"),
    html: [
      "<p>This is a test notification from ZeroCool Development lead pipeline.</p>",
      `<p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>`,
      "<p>No customer action is required.</p>",
    ].join("\n"),
  });
}

async function sendNotification(params: NotificationParams) {
  return sendViaResend({
    to: getContactEmail(),
    subject: params.subject,
    text: [
      `Lead Name: ${params.leadName}`,
      `Lead Email: ${params.leadEmail}`,
      `Lead Phone: ${params.leadPhone || "not provided"}`,
      "",
      params.body,
    ].join("\n"),
    replyTo: isValidReplyTo(params.leadEmail) ? params.leadEmail : undefined,
  });
}

export async function newLeadNotification(params: {
  leadName: string;
  leadEmail: string;
  leadPhone?: string;
  projectType?: string;
  message: string;
}) {
  return sendNotification({
    leadName: params.leadName,
    leadEmail: params.leadEmail,
    leadPhone: params.leadPhone,
    subject: `New Lead: ${params.projectType || "General Inquiry"}`,
    body: [
      "Type: New lead notification",
      `Project Type: ${params.projectType || "not provided"}`,
      "",
      "Message:",
      params.message,
    ].join("\n"),
  });
}

export async function estimateRequestNotification(params: {
  leadName: string;
  leadEmail: string;
  leadPhone?: string;
  serviceType: string;
  estimateRange: string;
  details: string;
}) {
  return sendNotification({
    leadName: params.leadName,
    leadEmail: params.leadEmail,
    leadPhone: params.leadPhone,
    subject: `Estimate Request: ${params.serviceType}`,
    body: [
      "Type: Estimate request notification",
      `Service Type: ${params.serviceType}`,
      `Estimate Range: ${params.estimateRange}`,
      "",
      "Details:",
      params.details,
    ].join("\n"),
  });
}

export async function bookingConfirmation(params: {
  leadName: string;
  leadEmail: string;
  leadPhone?: string;
  appointmentType: string;
  preferredDateTime: string;
  urgency: string;
  details: string;
}) {
  return sendNotification({
    leadName: params.leadName,
    leadEmail: params.leadEmail,
    leadPhone: params.leadPhone,
    subject: `Booking Request: ${params.appointmentType}`,
    body: [
      "Type: Booking confirmation notification",
      `Appointment Type: ${params.appointmentType}`,
      `Preferred Date/Time: ${params.preferredDateTime}`,
      `Urgency: ${params.urgency}`,
      "",
      "Details:",
      params.details,
    ].join("\n"),
  });
}

export async function guideDownloadNotification(params: {
  leadName: string;
  leadEmail: string;
  guideTitle: string;
}) {
  return sendNotification({
    leadName: params.leadName,
    leadEmail: params.leadEmail,
    subject: `Guide Download: ${params.guideTitle}`,
    body: ["Type: Guide download notification", `Guide: ${params.guideTitle}`].join("\n"),
  });
}

export async function emergencyRequestNotification(params: {
  leadName: string;
  leadEmail: string;
  leadPhone?: string;
  emergencyType: string;
  details: string;
}) {
  return sendNotification({
    leadName: params.leadName,
    leadEmail: params.leadEmail,
    leadPhone: params.leadPhone,
    subject: `Emergency Request: ${params.emergencyType}`,
    body: [
      "Type: Emergency request notification",
      `Emergency Type: ${params.emergencyType}`,
      "",
      "Details:",
      params.details,
    ].join("\n"),
  });
}
