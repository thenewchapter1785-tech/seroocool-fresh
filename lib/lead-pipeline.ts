import "server-only";

import { randomUUID } from "node:crypto";
import {
  consumeRateLimit,
  isValidEmail,
  sanitizeText,
} from "@/lib/api-security";
import {
  sendLeadNotification,
  type LeadNotificationInput,
} from "@/lib/email-notifications";
import {
  addSubmissionNote,
  createOrUpdateContact,
  type HubSpotErrorCode,
} from "@/lib/hubspot";
import { logLeadEvent } from "@/lib/lead-pipeline-logger";
import {
  saveLeadSubmission,
  type StoredLeadSubmission,
} from "@/lib/lead-pipeline-store";

export type ProcessLeadSubmissionInput = {
  routeKey: string;
  clientIp: string;
  source: string;
  formType: string;
  pageUrl?: string;
  honeypot?: string;
  name?: string;
  email?: string;
  phone?: string;
  preferredContactMethod?: string;
  service?: string;
  message?: string;
  urgency?: string;
  personalOrBusiness?: string;
  budget?: string;
  timeline?: string;
  company?: string;
  websiteUrl?: string;
  utmSource?: string;
  utmCampaign?: string;
  metadata?: Record<string, string>;
};

export type ProcessLeadSubmissionResult = {
  ok: boolean;
  submissionId: string;
  message: string;
  hubspot: {
    ok: boolean;
    contactId: string | null;
    errorCode?: HubSpotErrorCode | "NOT_CONFIGURED" | "UNKNOWN";
  };
  email: {
    ok: boolean;
    provider: string;
    messageId: string | null;
    errorCode?: string;
  };
  validationErrors?: string[];
};

function normalizeLeadInput(input: ProcessLeadSubmissionInput) {
  return {
    source: sanitizeText(input.source, 80) || "organic",
    formType: sanitizeText(input.formType, 80) || "contact_form",
    pageUrl: sanitizeText(input.pageUrl, 300),
    honeypot: sanitizeText(input.honeypot, 200),
    name: sanitizeText(input.name, 100),
    email: sanitizeText(input.email, 160).toLowerCase(),
    phone: sanitizeText(input.phone, 40),
    preferredContactMethod: sanitizeText(input.preferredContactMethod, 40),
    service: sanitizeText(input.service, 140),
    message: sanitizeText(input.message, 5000),
    urgency: sanitizeText(input.urgency, 40),
    personalOrBusiness: sanitizeText(input.personalOrBusiness, 40),
    budget: sanitizeText(input.budget, 80),
    timeline: sanitizeText(input.timeline, 80),
    company: sanitizeText(input.company, 120),
    websiteUrl: sanitizeText(input.websiteUrl, 240),
    utmSource: sanitizeText(input.utmSource, 80),
    utmCampaign: sanitizeText(input.utmCampaign, 120),
    metadata: input.metadata ?? {},
  };
}

function getValidationErrors(normalized: ReturnType<typeof normalizeLeadInput>) {
  const errors: string[] = [];

  if (!normalized.name) {
    errors.push("name is required");
  }

  if (!normalized.email) {
    errors.push("email is required");
  } else if (!isValidEmail(normalized.email)) {
    errors.push("email is invalid");
  }

  if (!normalized.message || normalized.message.length < 10) {
    errors.push("message must be at least 10 characters");
  }

  return errors;
}

async function persistSubmission(record: StoredLeadSubmission) {
  await saveLeadSubmission(record);
}

function buildSubmissionRecord(params: {
  submissionId: string;
  nowIso: string;
  normalized: ReturnType<typeof normalizeLeadInput>;
  status: StoredLeadSubmission["status"];
  hubspot: StoredLeadSubmission["hubspot"];
  emailDelivery: StoredLeadSubmission["emailDelivery"];
}): StoredLeadSubmission {
  const retryStatus =
    params.status === "partial_failure" || params.status === "failed" ? "needed" : "none";

  return {
    submissionId: params.submissionId,
    createdAt: params.nowIso,
    updatedAt: params.nowIso,
    status: params.status,
    formType: params.normalized.formType,
    source: params.normalized.source,
    pageUrl: params.normalized.pageUrl,
    name: params.normalized.name,
    email: params.normalized.email,
    hubspot: params.hubspot,
    emailDelivery: params.emailDelivery,
    retryStatus,
  };
}

export async function processLeadSubmission(
  input: ProcessLeadSubmissionInput
): Promise<ProcessLeadSubmissionResult> {
  const submissionId = randomUUID();
  const nowIso = new Date().toISOString();
  const normalized = normalizeLeadInput(input);

  logLeadEvent({
    event: "submission_received",
    submissionId,
    formType: normalized.formType,
    status: "pending",
  });

  if (normalized.honeypot) {
    const spamRecord = buildSubmissionRecord({
      submissionId,
      nowIso,
      normalized,
      status: "failed",
      hubspot: { ok: false, errorCode: "SPAM_REJECTED" },
      emailDelivery: { ok: false, errorCode: "SPAM_REJECTED" },
    });

    await persistSubmission(spamRecord);
    logLeadEvent({
      event: "spam_rejected",
      submissionId,
      formType: normalized.formType,
      status: "failed",
      errorCode: "SPAM_REJECTED",
    });

    return {
      ok: false,
      submissionId,
      message: "Submission rejected.",
      hubspot: { ok: false, contactId: null, errorCode: "UNKNOWN" },
      email: { ok: false, provider: "resend", messageId: null, errorCode: "UNKNOWN" },
    };
  }

  const rate = consumeRateLimit({
    key: `${input.routeKey}:${input.clientIp}`,
    limit: 5,
    windowMs: 60_000,
  });

  if (!rate.ok) {
    return {
      ok: false,
      submissionId,
      message: "Too many requests. Please try again in a minute.",
      hubspot: { ok: false, contactId: null, errorCode: "UNKNOWN" },
      email: { ok: false, provider: "resend", messageId: null, errorCode: "UNKNOWN" },
    };
  }

  const validationErrors = getValidationErrors(normalized);
  if (validationErrors.length > 0) {
    const invalidRecord = buildSubmissionRecord({
      submissionId,
      nowIso,
      normalized,
      status: "failed",
      hubspot: { ok: false, errorCode: "VALIDATION_FAILED" },
      emailDelivery: { ok: false, errorCode: "VALIDATION_FAILED" },
    });

    await persistSubmission(invalidRecord);
    logLeadEvent({
      event: "validation_failed",
      submissionId,
      formType: normalized.formType,
      status: "failed",
      errorCode: "VALIDATION_FAILED",
    });

    return {
      ok: false,
      submissionId,
      message: "Please correct the highlighted fields and try again.",
      hubspot: { ok: false, contactId: null, errorCode: "UNKNOWN" },
      email: { ok: false, provider: "resend", messageId: null, errorCode: "UNKNOWN" },
      validationErrors,
    };
  }

  const detailsLines = [
    `Lead source: ${normalized.source || "not provided"}`,
    `Form name: ${normalized.formType}`,
    `Page submitted from: ${normalized.pageUrl || "not provided"}`,
    `Service requested: ${normalized.service || "not provided"}`,
    `Urgency: ${normalized.urgency || "not provided"}`,
    `Preferred contact method: ${normalized.preferredContactMethod || "not provided"}`,
    `Personal or business: ${normalized.personalOrBusiness || "not provided"}`,
    `Budget: ${normalized.budget || "not provided"}`,
    `Timeline: ${normalized.timeline || "not provided"}`,
    `UTM source: ${normalized.utmSource || "not provided"}`,
    `UTM campaign: ${normalized.utmCampaign || "not provided"}`,
    `Submission timestamp: ${nowIso}`,
    "",
    "Message:",
    normalized.message,
  ];

  const metadataEntries = Object.entries(normalized.metadata)
    .map(([key, value]) => `${sanitizeText(key, 60)}: ${sanitizeText(value, 500)}`)
    .filter((entry) => !entry.endsWith(":"));

  if (metadataEntries.length > 0) {
    detailsLines.push("", "Metadata:", ...metadataEntries);
  }

  const details = detailsLines.join("\n");

  const hubspotResult = await createOrUpdateContact({
    name: normalized.name,
    email: normalized.email,
    phone: normalized.phone,
    company: normalized.company,
    websiteUrl: normalized.websiteUrl,
  });

  let hubspotContactId: string | null = null;
  let hubspotOk = false;
  let hubspotErrorCode: HubSpotErrorCode | "NOT_CONFIGURED" | "UNKNOWN" | undefined;

  if (hubspotResult.ok) {
    hubspotContactId = hubspotResult.contactId;
    hubspotOk = true;

    await addSubmissionNote({
      email: normalized.email,
      contactId: hubspotResult.contactId,
      note: details,
    }).catch(() => {
      // Keep processing even if note association fails.
    });

    logLeadEvent({
      event: "hubspot_success",
      submissionId,
      formType: normalized.formType,
      status: "ok",
    });
  } else {
    hubspotErrorCode = hubspotResult.errorCode ?? "UNKNOWN";
    logLeadEvent({
      event: "hubspot_failed",
      submissionId,
      formType: normalized.formType,
      status: "failed",
      providerStatusCode: hubspotResult.statusCode,
      errorCode: hubspotErrorCode,
    });
  }

  const notificationPayload: LeadNotificationInput = {
    submissionId,
    name: normalized.name,
    email: normalized.email,
    phone: normalized.phone,
    preferredContactMethod: normalized.preferredContactMethod,
    formType: normalized.formType,
    service: normalized.service,
    message: normalized.message,
    urgency: normalized.urgency,
    personalOrBusiness: normalized.personalOrBusiness,
    budget: normalized.budget,
    timeline: normalized.timeline,
    pageUrl: normalized.pageUrl,
    submittedAt: nowIso,
    hubspotContactId,
    source: normalized.source,
    utmSource: normalized.utmSource,
    utmCampaign: normalized.utmCampaign,
    metadata: normalized.metadata,
  };

  const emailResult = await sendLeadNotification(notificationPayload);

  if (emailResult.ok) {
    logLeadEvent({
      event: "email_success",
      submissionId,
      formType: normalized.formType,
      status: "ok",
    });
  } else {
    logLeadEvent({
      event: "email_failed",
      submissionId,
      formType: normalized.formType,
      status: "failed",
      providerStatusCode: emailResult.statusCode,
      errorCode: emailResult.errorCode,
    });
  }

  const ok = hubspotOk && emailResult.ok;
  const status: StoredLeadSubmission["status"] = ok
    ? "delivered"
    : hubspotOk || emailResult.ok
      ? "partial_failure"
      : "failed";

  const record = buildSubmissionRecord({
    submissionId,
    nowIso,
    normalized,
    status,
    hubspot: {
      ok: hubspotOk,
      errorCode: hubspotErrorCode,
      contactId: hubspotContactId,
      statusCode: hubspotResult.statusCode,
    },
    emailDelivery: {
      ok: emailResult.ok,
      errorCode: emailResult.errorCode,
      messageId: emailResult.messageId,
      statusCode: emailResult.statusCode,
    },
  });

  await persistSubmission(record);

  if (ok) {
    logLeadEvent({
      event: "submission_completed",
      submissionId,
      formType: normalized.formType,
      status: "delivered",
    });

    return {
      ok: true,
      submissionId,
      message: "Your request was received successfully.",
      hubspot: {
        ok: true,
        contactId: hubspotContactId,
      },
      email: {
        ok: true,
        provider: emailResult.provider,
        messageId: emailResult.messageId,
      },
    };
  }

  const partialMessage =
    status === "partial_failure"
      ? "We received your request, but one delivery step needs attention."
      : "We received your request, but delivery could not be completed right now.";

  logLeadEvent({
    event: "submission_partial_failure",
    submissionId,
    formType: normalized.formType,
    status,
  });

  return {
    ok: false,
    submissionId,
    message: partialMessage,
    hubspot: {
      ok: hubspotOk,
      contactId: hubspotContactId,
      errorCode: hubspotErrorCode,
    },
    email: {
      ok: emailResult.ok,
      provider: emailResult.provider,
      messageId: emailResult.messageId,
      errorCode: emailResult.errorCode,
    },
  };
}
