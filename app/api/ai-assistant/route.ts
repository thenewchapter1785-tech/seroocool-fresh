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

type AiRequestPayload = {
  prompt?: string;
};

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
const ROUTE_KEY = "api:ai-assistant";

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

  const openaiApiKey = process.env.OPENAI_API_KEY;

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

  let upstreamResponse: Response;

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
            content:
              "You are the ZeroCool Development assistant. Keep responses concise, technical, and useful for business owners.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_output_tokens: 350,
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

  return NextResponse.json(
    {
      ok: true,
      answer: upstreamJson.output_text ?? "",
    },
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
