import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { feedbackReports, auditLogs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyAdminSession } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    if (!db) return NextResponse.json({ reports: [], unreadCount: 0 });

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");
    const typeFilter = searchParams.get("type");

    const allReports = await db.select().from(feedbackReports).orderBy(desc(feedbackReports.createdAt));

    const unreadCount = allReports.filter((r) => r.status === "unread").length;

    let filtered = allReports;
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }
    if (typeFilter && typeFilter !== "all") {
      filtered = filtered.filter((r) => r.type === typeFilter);
    }

    return NextResponse.json({ reports: filtered, unreadCount });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { id, status, internalNotes } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing report ID" }, { status: 400 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const updated = await db.update(feedbackReports).set({
      status: status !== undefined ? status : undefined,
      internalNotes: internalNotes !== undefined ? internalNotes : undefined,
    }).where(eq(feedbackReports.id, id)).returning();

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "UPDATE_FEEDBACK_REPORT",
        entityType: "feedback_reports",
        entityId: id,
        details: { status, internalNotes },
      });
    } catch {}

    return NextResponse.json({ success: true, report: updated[0] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing report ID" }, { status: 400 });
    if (!db) return NextResponse.json({ success: true });

    await db.delete(feedbackReports).where(eq(feedbackReports.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
