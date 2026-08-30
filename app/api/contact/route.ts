import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations/contact";
import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import { sendContactNotification } from "@/lib/email";

const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function isRateLimited(ip: string, limit: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.expiresAt) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + windowMs });
    return false;
  }

  if (entry.count >= limit) {
    return true;
  }

  entry.count += 1;
  return false;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute before submitting again." },
        { status: 429 }
      );
    }

    const body = await req.json();

    const parseResult = contactSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    if (data.companyHp && data.companyHp.length > 0) {
      return NextResponse.json({ success: true, message: "Message received" });
    }

    if (db) {
      try {
        await db.insert(contacts).values({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          service: data.service,
          budget: null,
          message: data.message,
        });
      } catch (dbErr) {
        console.error("Database insert error:", dbErr);
      }
    }

    await sendContactNotification(data);

    return NextResponse.json({
      success: true,
      message: "Thank you for reaching out! The TrioCore team will get back to you within 24 hours.",
    });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again or email us directly." },
      { status: 500 }
    );
  }
}
