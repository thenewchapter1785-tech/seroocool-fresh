import { getContactEmail, getLeadSenderEmail, readOptionalEnv } from "@/lib/env";

const RESEND_URL = "https://api.resend.com/emails";
const EXTERNAL_REQUEST_TIMEOUT_MS = 8000;

type NotificationParams = {
  leadName: string;
  leadEmail: string;
  leadPhone?: string;
  subject: string;
  body: string;
};

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

async function sendNotification(params: NotificationParams) {
  const resendApiKey = readOptionalEnv("RESEND_API_KEY");

  if (!resendApiKey) {
    return { ok: false as const, reason: "missing-resend-api-key" as const };
  }

  const response = await fetchWithTimeout(RESEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getLeadSenderEmail(),
      to: [getContactEmail()],
      reply_to: params.leadEmail || undefined,
      subject: params.subject,
      text: [
        `Lead Name: ${params.leadName}`,
        `Lead Email: ${params.leadEmail}`,
        `Lead Phone: ${params.leadPhone || "not provided"}`,
        "",
        params.body,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend send failed: ${errorText}`);
  }

  return { ok: true as const };
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
    body: [
      "Type: Guide download notification",
      `Guide: ${params.guideTitle}`,
    ].join("\n"),
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
