import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { feedbackReports } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, message, email, consent } = body;

    if (!message || typeof message !== "string" || message.trim().length < 5) {
      return NextResponse.json(
        { error: "Please enter a valid message (at least 5 characters)." },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: "Database not connected" },
        { status: 500 }
      );
    }

    // 1. Saved to feedback_reports DB FIRST
    const inserted = await db
      .insert(feedbackReports)
      .values({
        id: crypto.randomUUID(),
        type: type || "feedback",
        message: message.trim(),
        email: email ? String(email).trim() : null,
        status: "unread",
        consentAt: consent ? new Date() : new Date(),
        forwardedToFormspree: false,
      })
      .returning();

    const reportId = inserted[0].id;

    // 2. Forward to Formspree server-side (resilient if it fails)
    const formspreeEndpoint =
      req.headers.get("x-mock-endpoint") || process.env.FORMSPREE_ENDPOINT?.trim();
    if (formspreeEndpoint) {
      try {
        const res = await fetch(formspreeEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            subject: `New Feedback/Issue Report (${type || "feedback"})`,
            type: type || "feedback",
            message: message.trim(),
            email: email || "Anonymous",
            reportId,
          }),
        });

        if (res.ok) {
          await db
            .update(feedbackReports)
            .set({ forwardedToFormspree: true })
            .where(eq(feedbackReports.id, reportId));
        }
      } catch (err) {
        // Formspree failed - DB row still exists safely
        console.warn("Formspree forward warning (row preserved):", (err as Error).message);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for your feedback! Your report has been recorded.",
      id: reportId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
