import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { milestones, projects, auditLogs } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { verifyAdminSession } from "@/lib/auth-guard";
import { milestoneEditSchema } from "@/lib/validations/crm";

async function syncProjectMilestoneProgress(projectId: string) {
  if (!db) return 0;
  try {
    const projectMilestones = await db.select().from(milestones).where(eq(milestones.projectId, projectId));
    const completedCount = projectMilestones.filter((m) => m.status === "completed").length;
    const progressPercent =
      projectMilestones.length > 0 ? Math.round((completedCount / projectMilestones.length) * 100) : 0;
    await db
      .update(projects)
      .set({ progress: progressPercent, updatedAt: new Date() })
      .where(eq(projects.id, projectId));
    return progressPercent;
  } catch {
    return 0;
  }
}

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

    await syncProjectMilestoneProgress(projectId);

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "CREATE_MILESTONE",
        entityType: "milestones",
        entityId: newMilestone[0].id,
        details: { projectId, title, status },
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
    const parseResult = milestoneEditSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid milestone data" },
        { status: 400 }
      );
    }

    const { id, title, description, status, order, dueDate } = parseResult.data;

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const existingRows = await db.select().from(milestones).where(eq(milestones.id, id)).limit(1);
    if (existingRows.length === 0) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }
    const existing = existingRows[0];

    const updated = await db.update(milestones).set({
      title: title !== undefined ? title : existing.title,
      description: description !== undefined ? description : existing.description,
      status: status !== undefined ? status : existing.status,
      order: order !== undefined ? Number(order) : existing.order,
      dueDate: dueDate !== undefined ? (dueDate ? String(dueDate) : null) : existing.dueDate,
      completedAt: status === "completed" ? new Date() : (status ? null : existing.completedAt),
    }).where(eq(milestones.id, id)).returning();

    const progress = await syncProjectMilestoneProgress(existing.projectId);

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "UPDATE_MILESTONE",
        entityType: "milestones",
        entityId: id,
        details: {
          projectId: existing.projectId,
          old: { title: existing.title, status: existing.status },
          new: { title, status },
          progress,
        },
      });
    } catch {}

    return NextResponse.json({ success: true, milestone: updated[0], progress });
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

    const existing = await db.select().from(milestones).where(eq(milestones.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ success: true });
    }

    const projectId = existing[0].projectId;
    await db.delete(milestones).where(eq(milestones.id, id));

    const progress = await syncProjectMilestoneProgress(projectId);

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "DELETE_MILESTONE",
        entityType: "milestones",
        entityId: id,
        details: { projectId, title: existing[0].title, progress },
      });
    } catch {}

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

