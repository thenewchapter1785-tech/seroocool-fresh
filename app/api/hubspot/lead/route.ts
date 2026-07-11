import { NextResponse } from "next/server";
import {
  buildCorsHeaders,
  consumeRateLimit,
  getAllowedOrigins,
  getClientIp,
  getRequestOrigin,
  isAllowedOrigin,
  sanitizeText,
} from "@/lib/api-security";
import { processLeadSubmission } from "@/lib/lead-pipeline";

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

  const result = await processLeadSubmission({
    routeKey: ROUTE_KEY,
    clientIp: ip,
    source: "hubspot_api",
    formType: "hubspot_direct_lead",
    name,
    email,
    company,
    message: "Direct HubSpot lead endpoint submission",
  });

  if (result.ok) {
    return NextResponse.json(result, {
      headers: corsHeaders,
    });
  }

  if (result.validationErrors && result.validationErrors.length > 0) {
    return NextResponse.json(result, {
      status: 400,
      headers: corsHeaders,
    });
  }

  return NextResponse.json(result, {
    status: 502,
    headers: corsHeaders,
  });
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
