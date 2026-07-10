import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "ZeroCool Development",
    environment: process.env.NODE_ENV === "production" ? "production" : "development",
    timestamp: new Date().toISOString(),
  });
}
