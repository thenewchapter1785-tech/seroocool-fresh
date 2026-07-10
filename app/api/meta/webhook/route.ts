import "dotenv/config";
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getMetaConfig } from "@/lib/meta-config";
import { writeMetaAuditLog } from "@/lib/meta-audit-log";

export const runtime = "nodejs";

type MetaWebhookEntry = {
  id?: string;
  time?: number;
  changes?: Array<{ field?: string; value?: unknown }>;
};

type MetaWebhookPayload = {
  object?: string;
  entry?: MetaWebhookEntry[];
};

function verifySignature(rawBody: string, signatureHeader: string | null, appSecret: string) {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) {
    return false;
  }

  const providedSignature = signatureHeader.slice("sha256=".length);
  const expectedSignature = createHmac("sha256", appSecret).update(rawBody).digest("hex");

  const providedBuffer = Buffer.from(providedSignature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode") ?? "";
  const challenge = url.searchParams.get("hub.challenge") ?? "";
  const verifyToken = url.searchParams.get("hub.verify_token") ?? "";
  const expectedToken = getMetaConfig(true).verifyToken;

  if (mode === "subscribe" && expectedToken && verifyToken === expectedToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json(
    {
      ok: false,
      error: "Webhook verification failed.",
    },
    {
      status: 403,
    }
  );
}

export async function POST(request: Request) {
  const appSecret = getMetaConfig(true).appSecret;
  const signatureHeader = request.headers.get("x-hub-signature-256");
  const rawBody = await request.text();

  if (!appSecret) {
    return NextResponse.json(
      {
        ok: false,
        error: "META_APP_SECRET is required for webhook verification.",
      },
      {
        status: 500,
      }
    );
  }

  if (!verifySignature(rawBody, signatureHeader, appSecret)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid webhook signature.",
      },
      {
        status: 403,
      }
    );
  }

  const payload = (JSON.parse(rawBody) as MetaWebhookPayload) ?? {};

  const changeCount = payload.entry?.reduce((count, entry) => count + (entry.changes?.length ?? 0), 0) ?? 0;

  await writeMetaAuditLog({
    timestamp: new Date().toISOString(),
    route: "api:meta:webhook:post",
    action: "webhook-event",
    ip: request.headers.get("x-forwarded-for") || "unknown",
    details: `object=${payload.object || "unknown"} entries=${payload.entry?.length ?? 0} changes=${changeCount}`,
  });

  return NextResponse.json({
    ok: true,
    received: true,
  });
}
