import { NextResponse } from "next/server";
import {
  buildCorsHeaders,
  getAllowedOrigins,
  getClientIp,
  getRequestOrigin,
  isAllowedOrigin,
  sanitizeText,
} from "@/lib/api-security";
import { processLeadSubmission } from "@/lib/lead-pipeline";

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
  source?: string;
  utmSource?: string;
  utmCampaign?: string;
  message?: string;
  pageUrl?: string;
};

const ROUTE_KEY = "api:contact";

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

  const projectType = sanitizeText(body.projectType, 140);
  const message = sanitizeText(body.message, 5000);

  const result = await processLeadSubmission({
    routeKey: ROUTE_KEY,
    clientIp: getClientIp(request),
    source: sanitizeText(body.source, 80) || "website",
    formType: sanitizeText(body.formType, 80) || "contact_form",
    pageUrl: sanitizeText(body.pageUrl, 300),
    honeypot: sanitizeText(body.website, 200),
    name: body.name,
    email: body.email,
    phone: body.phone,
    preferredContactMethod: body.preferredContactMethod,
    service: projectType,
    message,
    urgency: body.urgency,
    personalOrBusiness: body.audienceType ?? body.clientType,
    budget: body.budgetRange,
    timeline: body.timeline,
    company: body.company,
    websiteUrl: body.websiteUrl,
    utmSource: body.utmSource,
    utmCampaign: body.utmCampaign,
    metadata: {
      audienceType: sanitizeText(body.audienceType, 40),
      clientType: sanitizeText(body.clientType, 40),
    },
  });

  if (result.ok) {
    return NextResponse.json(result, { headers: corsHeaders });
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
