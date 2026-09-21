import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects, clients, milestones, payments, auditLogs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyAdminSession } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    if (!db) return NextResponse.json({ projects: [] });

    const allProjects = await db.select().from(projects).orderBy(desc(projects.createdAt));
    const allClients = await db.select().from(clients);
    const allMilestones = await db.select().from(milestones);
    const allPayments = await db.select().from(payments);

    const now = Date.now();

    const enriched = allProjects.map((proj) => {
      const client = allClients.find((c) => c.id === proj.clientId);
      const projMilestones = allMilestones.filter((m) => m.projectId === proj.id);
      const completedMilestones = projMilestones.filter((m) => m.status === "completed").length;
      const milestoneProgressPercent =
        projMilestones.length > 0 ? Math.round((completedMilestones / projMilestones.length) * 100) : 0;

      const projPayments = allPayments.filter((p) => p.projectId === proj.id && p.status === "received");
      const earnedPaise = projPayments.reduce((sum, p) => sum + p.amountPaise, 0);
      const pendingPaise = Math.max(0, proj.quotedAmountPaise - earnedPaise);

      const isOverdue =
        proj.status !== "completed" &&
        Boolean(proj.deadline && new Date(proj.deadline).getTime() < now);

      return {
        ...proj,
        name: proj.title,
        clientName: client?.name || "Unassigned Client",
        clientCompany: client?.businessName || null,
        milestones: projMilestones,
        milestoneProgressPercent,
        earnedPaise,
        pendingPaise,
        isOverdue,
      };
    });

    return NextResponse.json({ projects: enriched });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const {
      clientId,
      name,
      title: inputTitle,
      category = "Apps",
      quotedAmountPaise,
      startDate,
      deadline,
      status = "planning",
    } = body;

    const title = inputTitle || name;

    if (!title || quotedAmountPaise === undefined) {
      return NextResponse.json(
        { error: "Project name and quotedAmountPaise are required" },
        { status: 400 }
      );
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    let targetClientId = clientId;
    if (!targetClientId) {
      const firstClient = await db.select().from(clients).limit(1);
      if (firstClient.length > 0) {
        targetClientId = firstClient[0].id;
      } else {
        const createdClient = await db
          .insert(clients)
          .values({ name: "Direct Client" })
          .returning();
        targetClientId = createdClient[0].id;
      }
    }

    const newProject = await db.insert(projects).values({
      clientId: targetClientId,
      title,
      category,
      quotedAmountPaise: Number(quotedAmountPaise),
      receivedPaise: 0,
      pendingPaise: Number(quotedAmountPaise),
      startDate: startDate ? String(startDate) : new Date().toISOString(),
      deadline: deadline ? String(deadline) : null,
      status,
    }).returning();

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "CREATE_PROJECT",
        entityType: "projects",
        entityId: newProject[0].id,
        details: { name: title, quotedAmountPaise, category },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      project: { ...newProject[0], name: newProject[0].title },
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const {
      id,
      clientId,
      name,
      title: inputTitle,
      category,
      quotedAmountPaise,
      startDate,
      deadline,
      status,
    } = body;

    const title = inputTitle || name;

    if (!id || !title) {
      return NextResponse.json({ error: "Project ID and name are required" }, { status: 400 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    // Recompute pending paise if quotedAmountPaise updated
    const existing = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    const existingReceived = existing[0]?.receivedPaise || 0;
    const newQuoted = quotedAmountPaise !== undefined ? Number(quotedAmountPaise) : existing[0]?.quotedAmountPaise || 0;
    const newPending = Math.max(0, newQuoted - existingReceived);

    const updated = await db.update(projects).set({
      clientId: clientId !== undefined ? clientId : existing[0]?.clientId,
      title,
      category: category !== undefined ? category : existing[0]?.category,
      quotedAmountPaise: newQuoted,
      pendingPaise: newPending,
      startDate: startDate ? String(startDate) : existing[0]?.startDate,
      deadline: deadline ? String(deadline) : existing[0]?.deadline,
      status: status !== undefined ? status : existing[0]?.status,
      updatedAt: new Date(),
    }).where(eq(projects.id, id)).returning();

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "UPDATE_PROJECT",
        entityType: "projects",
        entityId: id,
        details: { name, status },
      });
    } catch {}

    return NextResponse.json({ success: true, project: updated[0] });
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

    if (!id) return NextResponse.json({ error: "Missing project ID" }, { status: 400 });
    if (!db) return NextResponse.json({ success: true });

    await db.delete(projects).where(eq(projects.id, id));

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "DELETE_PROJECT",
        entityType: "projects",
        entityId: id,
        details: { id },
      });
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
