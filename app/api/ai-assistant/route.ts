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
import { getContactEmail, getLeadSenderEmail, readOptionalEnv } from "@/lib/env";
import { upsertHubSpotLead } from "@/lib/hubspot";

type LeadDetails = {
  name?: string;
  email?: string;
  phone?: string;
  projectType?: string;
  preferredContactMethod?: string;
  audienceType?: string;
  urgency?: string;
  budgetRange?: string;
  timeline?: string;
  company?: string;
  problemDescription?: string;
  appointmentType?: string;
};

type ChatTurn = {
  role?: "user" | "assistant";
  content?: string;
};

type AiRequestPayload = {
  prompt?: string;
  history?: ChatTurn[];
  lead?: LeadDetails;
};

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const ROUTE_KEY = "api:ai-assistant";
const EXTERNAL_REQUEST_TIMEOUT_MS = 8000;

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

function normalizeLead(input?: LeadDetails) {
  const normalized = {
    name: sanitizeText(input?.name, 100),
    email: sanitizeText(input?.email, 160).toLowerCase(),
    phone: sanitizeText(input?.phone, 40),
    projectType: sanitizeText(input?.projectType, 120),
    preferredContactMethod: sanitizeText(input?.preferredContactMethod, 40),
    audienceType: sanitizeText(input?.audienceType, 40),
    urgency: sanitizeText(input?.urgency, 40),
    budgetRange: sanitizeText(input?.budgetRange, 80),
    timeline: sanitizeText(input?.timeline, 80),
    company: sanitizeText(input?.company, 120),
    problemDescription: sanitizeText(input?.problemDescription, 1500),
    appointmentType: sanitizeText(input?.appointmentType, 80),
  };

  return normalized;
}

function getMissingLeadFields(lead: ReturnType<typeof normalizeLead>) {
  const required = [
    ["name", lead.name],
    ["email", lead.email],
    ["phone", lead.phone],
    ["project type", lead.projectType],
    ["preferred contact method", lead.preferredContactMethod],
    ["audience type", lead.audienceType],
    ["urgency", lead.urgency],
    ["budget", lead.budgetRange],
    ["timeline", lead.timeline],
  ] as const;

  return required.filter((item) => !item[1]).map((item) => item[0]);
}

async function sendQualifiedLeadEmail(params: {
  lead: ReturnType<typeof normalizeLead>;
  prompt: string;
}) {
  const resendApiKey = readOptionalEnv("RESEND_API_KEY");
  if (!resendApiKey) {
    return;
  }

  const emailText = [
    "New AI Assistant Qualified Lead",
    "",
    `Name: ${params.lead.name}`,
    `Email: ${params.lead.email}`,
    `Phone: ${params.lead.phone}`,
    `Company: ${params.lead.company}`,
    `Project Type: ${params.lead.projectType}`,
    `Preferred Contact Method: ${params.lead.preferredContactMethod}`,
    `Audience Type: ${params.lead.audienceType}`,
    `Urgency: ${params.lead.urgency}`,
    `Budget: ${params.lead.budgetRange}`,
    `Timeline: ${params.lead.timeline}`,
    `Problem Description: ${params.lead.problemDescription}`,
    `Preferred Appointment Type: ${params.lead.appointmentType}`,
    "",
    "User question:",
    params.prompt,
  ].join("\n");

  await fetchWithTimeout("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getLeadSenderEmail(),
      to: [getContactEmail()],
      reply_to: params.lead.email,
      subject: `AI Qualified Lead: ${params.lead.projectType || "Consultation"}`,
      text: emailText,
    }),
  });
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
    limit: 10,
    windowMs: 60_000,
  });

  if (!rate.ok) {
    return NextResponse.json(
      { error: "Too many AI requests. Please try again in a minute." },
      {
        status: 429,
        headers: {
          ...corsHeaders,
          "Retry-After": Math.ceil((rate.resetAt - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  const openaiApiKey = readOptionalEnv("OPENAI_API_KEY");

  if (!openaiApiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured" },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }

  let payload: AiRequestPayload;

  try {
    payload = (await request.json()) as AiRequestPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  const prompt = sanitizeText(payload.prompt, 2500);

  if (!prompt || prompt.length < 2) {
    return NextResponse.json(
      { error: "Prompt is required" },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  const lead = normalizeLead(payload.lead);
  const missingFields = getMissingLeadFields(lead);

  if (lead.email && !isValidEmail(lead.email)) {
    return NextResponse.json(
      { error: "Lead email appears invalid" },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  let upstreamResponse: Response;

  const leadSummary = [
    `Name: ${lead.name || "missing"}`,
    `Email: ${lead.email || "missing"}`,
    `Phone: ${lead.phone || "missing"}`,
    `Project Type: ${lead.projectType || "missing"}`,
    `Preferred Contact Method: ${lead.preferredContactMethod || "missing"}`,
    `Audience Type: ${lead.audienceType || "missing"}`,
    `Urgency: ${lead.urgency || "missing"}`,
    `Budget: ${lead.budgetRange || "missing"}`,
    `Timeline: ${lead.timeline || "missing"}`,
    `Company: ${lead.company || "not provided"}`,
    `Problem Description: ${lead.problemDescription || "not provided"}`,
    `Preferred Appointment Type: ${lead.appointmentType || "not provided"}`,
  ].join("\n");

  const conversationSummary = (payload.history ?? [])
    .slice(-8)
    .map((turn) => {
      const role = turn.role === "assistant" ? "Assistant" : "User";
      const content = sanitizeText(turn.content, 500);
      return `${role}: ${content || "(empty)"}`;
    })
    .join("\n");

  const systemPrompt = [
    "You are ZeroCool Development's AI lead assistant.",
    "Answer questions for both individuals and small businesses.",
    "Common user questions include: 'my computer is slow', 'my laptop will not turn on', 'I think I have a virus', 'my phone keeps freezing', 'I need a website', 'how do I show up on Google', and 'how can AI automate my business'.",
    "Cover services like repair, troubleshooting, website development, mobile apps, AI automation, business automation, HubSpot CRM integration, Cloudflare security, and DigitalOcean hosting.",
    "Keep responses concise, practical, beginner-friendly, and jargon-free.",
    "Ask one question at a time when details are missing.",
    "Never claim certainty when diagnosing. Use phrases like likely, possible, or based on what you shared.",
    "Recommend professional inspection when symptoms could have multiple causes.",
    "Estimate urgency as low, medium, or high based on user symptoms and business impact.",
    "Recommend matching services and offer booking options: Phone Call, Video Call, Remote Support, Computer Repair Drop-Off, Website Consultation, AI Automation Consultation, Business Tech Review, or Emergency Support.",
    "Always recommend booking a free estimate as next step.",
    "If lead details are missing, explicitly request only the missing fields.",
    "Required lead fields are: name, email, phone, project type, preferred contact method, audience type, urgency, budget, timeline.",
  ].join(" ");

  try {
    upstreamResponse = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Lead detail snapshot:\n${leadSummary}\n\nMissing fields: ${
              missingFields.length ? missingFields.join(", ") : "none"
            }\n\nRecent conversation:\n${conversationSummary || "No prior conversation."}\n\nUser question: ${prompt}`,
          },
        ],
        max_output_tokens: 500,
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to contact OpenAI" },
      {
        status: 502,
        headers: corsHeaders,
      }
    );
  }

  if (!upstreamResponse.ok) {
    const upstreamError = await upstreamResponse.text();
    console.error("OpenAI upstream error", upstreamError);

    return NextResponse.json(
      { error: "OpenAI request failed" },
      {
        status: 502,
        headers: corsHeaders,
      }
    );
  }

  const upstreamJson = (await upstreamResponse.json()) as {
    output_text?: string;
  };

  const isQualified = missingFields.length === 0;

  if (isQualified) {
    try {
      await upsertHubSpotLead({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        projectType: lead.projectType,
        budgetRange: lead.budgetRange,
        timeline: lead.timeline,
        notes: [
          `AI assistant question: ${prompt}`,
          `Conversation Summary: ${conversationSummary || "No prior conversation"}`,
          `Preferred Contact Method: ${lead.preferredContactMethod || "not provided"}`,
          `Audience Type: ${lead.audienceType || "not provided"}`,
          `Urgency: ${lead.urgency || "not provided"}`,
          `Problem Description: ${lead.problemDescription || "not provided"}`,
          `Preferred Appointment Type: ${lead.appointmentType || "not provided"}`,
        ].join("\n"),
        formType: "ai_assistant",
      });

      await sendQualifiedLeadEmail({ lead, prompt });
    } catch (error) {
      console.error("Failed to process qualified AI lead", error);
    }
  }

  return NextResponse.json(
    {
      ok: true,
      answer: upstreamJson.output_text ?? "",
      missingLeadFields: missingFields,
      qualifiedLeadCaptured: isQualified,
    },
    {
      headers: corsHeaders,
    }
  );
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
