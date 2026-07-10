import { NextResponse } from "next/server";
import { consumeRateLimit, getClientIp, sanitizeText } from "@/lib/api-security";
import { readOptionalEnv } from "@/lib/env";

type AdminAuthOptions = {
  routeKey: string;
  limit?: number;
  windowMs?: number;
  requireWriteGuards?: boolean;
};

type AdminAuthSuccess = {
  ip: string;
};

type AdminAuthResult =
  | {
      ok: true;
      data: AdminAuthSuccess;
    }
  | {
      ok: false;
      response: NextResponse;
    };

function getAdminCodeFromRequest(request: Request) {
  const fromHeader = sanitizeText(request.headers.get("x-admin-code"), 120);

  if (fromHeader) {
    return fromHeader;
  }

  const requestUrl = new URL(request.url);
  return sanitizeText(requestUrl.searchParams.get("code"), 120);
}

function isHttpsRequest(request: Request) {
  const protoHeader = request.headers.get("x-forwarded-proto")?.toLowerCase();
  if (protoHeader) {
    return protoHeader === "https";
  }

  return request.url.startsWith("https://");
}

function isSameOriginRequest(request: Request) {
  const origin = sanitizeText(request.headers.get("origin"), 240);
  if (!origin) {
    return true;
  }

  const url = new URL(request.url);
  return origin === `${url.protocol}//${url.host}`;
}

function hasValidCsrfHeader(request: Request) {
  const csrfHeader = sanitizeText(request.headers.get("x-admin-csrf"), 120);
  const adminCode = sanitizeText(request.headers.get("x-admin-code"), 120);

  if (!csrfHeader || !adminCode) {
    return false;
  }

  return csrfHeader === adminCode;
}

export function requireAdminAccess(
  request: Request,
  options: AdminAuthOptions
): AdminAuthResult {
  const requiredCode = readOptionalEnv("ADMIN_ACCESS_CODE").trim();
  const providedCode = getAdminCodeFromRequest(request).trim();

  if (!requiredCode) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "ADMIN_ACCESS_CODE is not configured.",
        },
        {
          status: 500,
        }
      ),
    };
  }

  if (!providedCode || providedCode !== requiredCode) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Unauthorized admin request.",
        },
        {
          status: 401,
        }
      ),
    };
  }

  const method = request.method.toUpperCase();
  const needsWriteGuard = options.requireWriteGuards ?? !["GET", "HEAD", "OPTIONS"].includes(method);

  if (needsWriteGuard) {
    if (!isSameOriginRequest(request)) {
      return {
        ok: false,
        response: NextResponse.json(
          {
            error: "Cross-origin admin write requests are blocked.",
          },
          {
            status: 403,
          }
        ),
      };
    }

    if (readOptionalEnv("NODE_ENV") === "production" && !isHttpsRequest(request)) {
      return {
        ok: false,
        response: NextResponse.json(
          {
            error: "Admin write requests require HTTPS in production.",
          },
          {
            status: 403,
          }
        ),
      };
    }

    if (!hasValidCsrfHeader(request)) {
      return {
        ok: false,
        response: NextResponse.json(
          {
            error: "Missing or invalid admin CSRF header.",
          },
          {
            status: 403,
          }
        ),
      };
    }
  }

  const ip = getClientIp(request);
  const rate = consumeRateLimit({
    key: `${options.routeKey}:${ip}`,
    limit: options.limit ?? 30,
    windowMs: options.windowMs ?? 60_000,
  });

  if (!rate.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Too many admin requests. Please try again shortly.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rate.resetAt - Date.now()) / 1000).toString(),
          },
        }
      ),
    };
  }

  return {
    ok: true,
    data: {
      ip,
    },
  };
}
