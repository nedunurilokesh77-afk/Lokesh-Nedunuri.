import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const payloadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(10).max(4000),
});

/** Naive in-memory rate limit: 5 submissions per IP per 10 minutes */
const RATE_LIMIT_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "local";

    if (rateLimited(ip)) {
      return NextResponse.json(
        { ok: false, error: "Channel saturated — please wait a few minutes." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = payloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid transmission payload." },
        { status: 400 }
      );
    }

    const saved = await db.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        message: parsed.data.message,
      },
    });

    return NextResponse.json({ ok: true, id: saved.id }, { status: 201 });
  } catch (err) {
    console.error("POST /api/contact failed:", err);
    return NextResponse.json(
      { ok: false, error: "Ground station fault — please retry." },
      { status: 500 }
    );
  }
}
