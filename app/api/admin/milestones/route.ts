import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { milestones, auditLogs } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { verifyAdminSession } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    if (!db) return NextResponse.json({ milestones: [] });
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (projectId) {
      const data = await db
        .select()
        .from(milestones)
        .where(eq(milestones.projectId, projectId))
        .orderBy(asc(milestones.order));
      return NextResponse.json({ milestones: data });
    }

    const data = await db.select().from(milestones).orderBy(asc(milestones.order));
    return NextResponse.json({ milestones: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { projectId, title, description, status = "pending", order = 0, dueDate } = body;

    if (!projectId || !title) {
      return NextResponse.json({ error: "ProjectId and title are required" }, { status: 400 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const newMilestone = await db.insert(milestones).values({
      projectId,
      title,
      description: description || null,
      status,
      order: Number(order) || 0,
      dueDate: dueDate ? String(dueDate) : null,
    }).returning();

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "CREATE_MILESTONE",
        entityType: "milestones",
        entityId: newMilestone[0].id,
        details: { projectId, title },
      });
    } catch {}

    return NextResponse.json({ success: true, milestone: newMilestone[0] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { id, title, description, status, order, dueDate } = body;

    if (!id) {
      return NextResponse.json({ error: "Milestone ID is required" }, { status: 400 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const updated = await db.update(milestones).set({
      title: title !== undefined ? title : undefined,
      description: description !== undefined ? description : undefined,
      status: status !== undefined ? status : undefined,
      order: order !== undefined ? Number(order) : undefined,
      dueDate: dueDate ? String(dueDate) : undefined,
      completedAt: status === "completed" ? new Date() : undefined,
    }).where(eq(milestones.id, id)).returning();

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "UPDATE_MILESTONE",
        entityType: "milestones",
        entityId: id,
        details: { status },
      });
    } catch {}

    return NextResponse.json({ success: true, milestone: updated[0] });
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

    if (!id) return NextResponse.json({ error: "Missing milestone ID" }, { status: 400 });
    if (!db) return NextResponse.json({ success: true });

    await db.delete(milestones).where(eq(milestones.id, id));

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "DELETE_MILESTONE",
        entityType: "milestones",
        entityId: id,
        details: { id },
      });
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
