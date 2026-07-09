import { NextResponse } from "next/server";
import {
  buildCorsHeaders,
  consumeRateLimit,
  getAllowedOrigins,
  getClientIp,
  getRequestOrigin,
  isAllowedOrigin,
  isValidEmail,
  sanitizeText,
} from "@/lib/api-security";
import {
  bookingConfirmation as sendBookingConfirmation,
  emergencyRequestNotification as sendEmergencyRequestNotification,
  estimateRequestNotification as sendEstimateRequestNotification,
  guideDownloadNotification as sendGuideDownloadNotification,
  newLeadNotification as sendNewLeadNotification,
} from "@/lib/email-notifications";
import { getContactEmail, getLeadSenderEmail, readOptionalEnv } from "@/lib/env";
import { upsertHubSpotLead } from "@/lib/hubspot";

type ContactPayload = {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  websiteUrl?: string;
  formType?: string;
  projectType?: string;
  preferredContactMethod?: string;
  clientType?: string;
  audienceType?: string;
  urgency?: string;
  budgetRange?: string;
  timeline?: string;
  website?: string;
  submittedAt?: number;
  source?: string;
  utmSource?: string;
  utmCampaign?: string;
  message?: string;
};

const ROUTE_KEY = "api:contact";
const EXTERNAL_REQUEST_TIMEOUT_MS = 8000;

function buildLeadNurtureKickoffEmail(params: {
  name: string;
  projectType: string;
}) {
  return [
    `Hi ${params.name || "there"},`,
    "",
    "Thanks for contacting ZeroCool Development.",
    "",
    "Here is what happens next:",
    "1) Welcome: We review your request and respond with a tailored action plan.",
    "2) Helpful Tips: We send practical guidance related to your issue.",
    "3) Free Consultation Reminder: We follow up with booking options.",
    "4) Testimonials: We share relevant outcome examples.",
    "5) Service Offers: We provide right-fit service options and next steps.",
    "",
    `Current request focus: ${params.projectType || "General technology support"}`,
    "",
    "If this is urgent, reply directly to this email and include URGENT in the subject.",
    "",
    "ZeroCool Development",
  ].join("\n");
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

function withCors(request: Request) {
  const allowedOrigins = getAllowedOrigins();
  const origin = getRequestOrigin(request);
  const corsHeaders = buildCorsHeaders(origin, allowedOrigins);

  return {
    allowedOrigins,
    origin,
    corsHeaders,
  };
}

export async function POST(request: Request) {
  const { allowedOrigins, origin, corsHeaders } = withCors(request);

  if (!isAllowedOrigin(origin, allowedOrigins)) {
    return NextResponse.json(
      { error: "Origin not allowed" },
      {
        status: 403,
        headers: corsHeaders,
      }
    );
  }

  const ip = getClientIp(request);
  const rate = consumeRateLimit({
    key: `${ROUTE_KEY}:${ip}`,
    limit: 5,
    windowMs: 60_000,
  });

  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Retry-After": Math.ceil((rate.resetAt - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  let body: ContactPayload;

  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  if (body.website && body.website.trim().length > 0) {
    return NextResponse.json({ ok: true }, { headers: corsHeaders });
  }

  if (typeof body.submittedAt === "number") {
    const elapsedMs = Date.now() - body.submittedAt;
    if (elapsedMs >= 0 && elapsedMs < 1200) {
      return NextResponse.json(
        { error: "Submission failed spam checks" },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }
  }

  const name = sanitizeText(body?.name, 100);
  const email = sanitizeText(body?.email, 160).toLowerCase();
  const phone = sanitizeText(body?.phone, 40);
  const company = sanitizeText(body?.company, 120);
  const websiteUrl = sanitizeText(body?.websiteUrl, 240);
  const formType = sanitizeText(body?.formType, 80) || "contact_form";
  const projectType = sanitizeText(body?.projectType, 120);
  const preferredContactMethod = sanitizeText(body?.preferredContactMethod, 40);
  const audienceType = sanitizeText(body?.audienceType ?? body?.clientType, 40);
  const urgency = sanitizeText(body?.urgency, 40);
  const budgetRange = sanitizeText(body?.budgetRange, 80);
  const timeline = sanitizeText(body?.timeline, 80);
  const message = sanitizeText(body?.message, 5000);
  const source = sanitizeText(body?.source, 80);
  const utmSource = sanitizeText(body?.utmSource, 80);
  const utmCampaign = sanitizeText(body?.utmCampaign, 120);

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Missing required contact fields" },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Please provide a valid email address" },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  if (message.length < 10) {
    return NextResponse.json(
      { error: "Please add a few more details about your request" },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  const hubspotTask = upsertHubSpotLead({
    name,
    email,
    phone,
    company,
    projectType,
    budgetRange,
    timeline,
    notes: [
      `Message: ${message}`,
      `Preferred Contact Method: ${preferredContactMethod || "not provided"}`,
      `Audience Type: ${audienceType || "not provided"}`,
      `Urgency: ${urgency || "not provided"}`,
      `Source: ${source || "not provided"}`,
      `UTM Source: ${utmSource || "not provided"}`,
      `UTM Campaign: ${utmCampaign || "not provided"}`,
    ].join("\n"),
    formType,
    websiteUrl,
  }).catch((error) => {
    console.error("HubSpot upsert failed", error);
  });

  const resendApiKey = readOptionalEnv("RESEND_API_KEY");

  if (!resendApiKey) {
    await hubspotTask;
    return NextResponse.json(
      {
        ok: true,
        warning:
          "Contact captured but RESEND_API_KEY is missing, so no inbox email was sent.",
      },
      { headers: corsHeaders }
    );
  }

  const toEmail = getContactEmail();
  const fromEmail = getLeadSenderEmail();
  const emailText = [
    "New website contact form submission",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Company: ${company}`,
    `Form Type: ${formType}`,
    `Website URL: ${websiteUrl}`,
    `Project Type: ${projectType}`,
    `Preferred Contact Method: ${preferredContactMethod}`,
    `Audience Type: ${audienceType}`,
    `Urgency: ${urgency}`,
    `Budget Range: ${budgetRange}`,
    `Timeline: ${timeline}`,
    `Source: ${source}`,
    `UTM Source: ${utmSource}`,
    `UTM Campaign: ${utmCampaign}`,
    "",
    "Project Details:",
    message,
  ].join("\n");

  let sendResponse: Response;
  try {
    sendResponse = await fetchWithTimeout("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject: `New Lead: ${projectType || "Project Inquiry"}`,
        text: emailText,
      }),
    });
  } catch (error) {
    await hubspotTask;
    console.error("Resend request failed", error);

    return NextResponse.json(
      {
        ok: true,
        warning:
          "Contact captured but email delivery timed out. Verify RESEND_API_KEY and sender domain.",
      },
      { headers: corsHeaders }
    );
  }

  if (!sendResponse.ok) {
    await hubspotTask;
    const sendError = await sendResponse.text();
    console.error("Resend send failure", sendError);

    return NextResponse.json(
      {
        ok: true,
        warning:
          "Contact captured but failed to send inbox email. Check RESEND_API_KEY and LEAD_FROM_EMAIL configuration.",
      },
      { headers: corsHeaders }
    );
  }

  try {
    await fetchWithTimeout("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: "Welcome to ZeroCool Development - Next Steps",
        text: buildLeadNurtureKickoffEmail({
          name,
          projectType,
        }),
      }),
    });
  } catch (error) {
    console.error("Lead nurture kickoff email failed", error);
  }

  try {
    if (formType === "live_estimate") {
      await sendEstimateRequestNotification({
        leadName: name,
        leadEmail: email,
        leadPhone: phone,
        serviceType: projectType || "Technology estimate",
        estimateRange: budgetRange || "not provided",
        details: message,
      });
    } else if (formType === "appointment_booking") {
      await sendBookingConfirmation({
        leadName: name,
        leadEmail: email,
        leadPhone: phone,
        appointmentType: projectType || "Consultation",
        preferredDateTime: timeline || "not provided",
        urgency: urgency || "normal",
        details: message,
      });
    } else if (formType === "lead_magnet_download") {
      await sendGuideDownloadNotification({
        leadName: name,
        leadEmail: email,
        guideTitle: projectType || "Guide download",
      });
    } else if (formType === "emergency_support") {
      await sendEmergencyRequestNotification({
        leadName: name,
        leadEmail: email,
        leadPhone: phone,
        emergencyType: projectType || "Emergency support",
        details: message,
      });
    } else {
      await sendNewLeadNotification({
        leadName: name,
        leadEmail: email,
        leadPhone: phone,
        projectType,
        message,
      });
    }
  } catch (error) {
    console.error("Form-type notification helper failed", error);
  }

  await hubspotTask;
  return NextResponse.json({ ok: true }, { headers: corsHeaders });
}

export async function OPTIONS(request: Request) {
  const { allowedOrigins, origin, corsHeaders } = withCors(request);

  if (!isAllowedOrigin(origin, allowedOrigins)) {
    return new NextResponse(null, {
      status: 403,
      headers: corsHeaders,
    });
  }

  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
