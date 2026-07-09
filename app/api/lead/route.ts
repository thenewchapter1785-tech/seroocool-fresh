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

type LeadPayload = {
  name?: string;
  email?: string;
  company?: string;
  projectType?: string;
  budgetRange?: string;
  timeline?: string;
  website?: string;
  submittedAt?: number;
  source?: string;
  utmSource?: string;
  utmCampaign?: string;
  message?: string;
};

const EXTERNAL_REQUEST_TIMEOUT_MS = 8000;
const ROUTE_KEY = "api:lead";

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

function splitName(fullName: string) {
  const trimmed = fullName.trim();

  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const parts = trimmed.split(/\s+/);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ");

  return { firstName, lastName };
}

async function upsertHubSpotContact(body: LeadPayload) {
  const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN;

  if (!hubspotToken || !body.email || !body.name) {
    return;
  }

  const { firstName, lastName } = splitName(body.name);

  let searchResponse: Response;

  try {
    searchResponse = await fetchWithTimeout(
    "https://api.hubapi.com/crm/v3/objects/contacts/search",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hubspotToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              {
                propertyName: "email",
                operator: "EQ",
                value: body.email,
              },
            ],
          },
        ],
        properties: ["email", "firstname", "lastname"],
        limit: 1,
      }),
    }
    );
  } catch (error) {
    console.error("HubSpot search request failed", error);
    return;
  }

  if (!searchResponse.ok) {
    const searchError = await searchResponse.text();
    console.error("HubSpot search failure", searchError);
    return;
  }

  const searchJson = (await searchResponse.json()) as {
    results?: Array<{ id: string }>;
  };
  const contactId = searchJson.results?.[0]?.id;

  const hubspotPayload = {
    properties: {
      email: body.email,
      firstname: firstName,
      lastname: lastName,
      company: body.company ?? "",
      lifecyclestage: "lead",
    },
  };

  if (contactId) {
    let updateResponse: Response;

    try {
      updateResponse = await fetchWithTimeout(
      `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${hubspotToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(hubspotPayload),
      }
      );
    } catch (error) {
      console.error("HubSpot update request failed", error);
      return;
    }

    if (!updateResponse.ok) {
      const updateError = await updateResponse.text();
      console.error("HubSpot update failure", updateError);
    }

    return;
  }

  let createResponse: Response;

  try {
    createResponse = await fetchWithTimeout(
    "https://api.hubapi.com/crm/v3/objects/contacts",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hubspotToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(hubspotPayload),
    }
    );
  } catch (error) {
    console.error("HubSpot create request failed", error);
    return;
  }

  if (!createResponse.ok) {
    const createError = await createResponse.text();
    console.error("HubSpot create failure", createError);
  }
}

export async function POST(request: Request) {
  const allowedOrigins = getAllowedOrigins();
  const origin = getRequestOrigin(request);
  const corsHeaders = buildCorsHeaders(origin, allowedOrigins);

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

  let body: LeadPayload;

  try {
    body = (await request.json()) as LeadPayload;
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
    return NextResponse.json(
      { ok: true },
      {
        headers: corsHeaders,
      }
    );
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
  const company = sanitizeText(body?.company, 120);
  const projectType = sanitizeText(body?.projectType, 120);
  const budgetRange = sanitizeText(body?.budgetRange, 80);
  const timeline = sanitizeText(body?.timeline, 80);
  const message = sanitizeText(body?.message, 5000);
  const source = sanitizeText(body?.source, 80);
  const utmSource = sanitizeText(body?.utmSource, 80);
  const utmCampaign = sanitizeText(body?.utmCampaign, 120);

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Missing required lead fields" },
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

  const normalizedBody: LeadPayload = {
    name,
    email,
    company,
    projectType,
    budgetRange,
    timeline,
    message,
    source,
    utmSource,
    utmCampaign,
  };

  const toEmail =
    process.env.CONTACT_EMAIL ??
    process.env.LEAD_TO_EMAIL ??
    "zerocool.development.project@gmail.com";
  const fromEmail = process.env.LEAD_FROM_EMAIL ?? "onboarding@resend.dev";
  const resendApiKey = process.env.RESEND_API_KEY;

  console.info("New lead submitted", {
    name,
    email,
    company,
    projectType,
    budgetRange,
    timeline,
    source,
    utmSource,
    utmCampaign,
  });

  const hubspotTask = upsertHubSpotContact(normalizedBody).catch((error) => {
    console.error("HubSpot upsert task failed", error);
  });

  if (!resendApiKey) {
    return NextResponse.json(
      {
        ok: true,
        warning:
          "Lead captured but RESEND_API_KEY is missing, so no inbox email was sent.",
      },
      {
        headers: corsHeaders,
      }
    );
  }

  const emailText = [
    "New website lead received",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Company: ${company}`,
    `Project Type: ${projectType}`,
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
          "Lead captured but email delivery timed out. Please verify RESEND_API_KEY and sender domain.",
      },
      {
        headers: corsHeaders,
      }
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
          "Lead captured but failed to send inbox email. Check RESEND_API_KEY and LEAD_FROM_EMAIL sender configuration.",
      },
      {
        headers: corsHeaders,
      }
    );
  }

  await hubspotTask;

  return NextResponse.json(
    { ok: true },
    {
      headers: corsHeaders,
    }
  );
}

export async function OPTIONS(request: Request) {
  const allowedOrigins = getAllowedOrigins();
  const origin = getRequestOrigin(request);
  const corsHeaders = buildCorsHeaders(origin, allowedOrigins);

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
