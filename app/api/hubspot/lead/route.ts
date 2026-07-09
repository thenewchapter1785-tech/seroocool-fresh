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
import { upsertHubSpotLead } from "@/lib/hubspot";

type HubSpotLeadPayload = {
  name?: string;
  email?: string;
  company?: string;
};

const ROUTE_KEY = "api:hubspot-lead";

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
    limit: 10,
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

  let body: HubSpotLeadPayload;
  try {
    body = (await request.json()) as HubSpotLeadPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }

  const name = sanitizeText(body?.name, 100);
  const email = sanitizeText(body?.email, 160).toLowerCase();
  const company = sanitizeText(body?.company, 120);

  if (!name || !email) {
    return NextResponse.json(
      { error: "Missing required HubSpot lead fields" },
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

  try {
    const result = await upsertHubSpotLead({ name, email, company });

    return NextResponse.json(
      {
        ok: result.ok,
        action: result.ok && "action" in result ? result.action : null,
      },
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("HubSpot route error", error);
    return NextResponse.json(
      { error: "Failed to create or update HubSpot lead" },
      {
        status: 502,
        headers: corsHeaders,
      }
    );
  }
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
