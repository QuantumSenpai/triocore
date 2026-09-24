import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects, clients, milestones, payments, auditLogs, projectMembers, user } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyAdminSession } from "@/lib/auth-guard";
import { projectEditSchema } from "@/lib/validations/crm";

export async function GET(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    if (!db) return NextResponse.json({ projects: [] });

    const [allProjects, allClients, allMilestones, allPayments, allProjectMembers] = await Promise.all([
      db.select().from(projects).orderBy(desc(projects.createdAt)),
      db.select().from(clients),
      db.select().from(milestones),
      db.select().from(payments),
      db
        .select({
          id: projectMembers.id,
          projectId: projectMembers.projectId,
          userId: projectMembers.userId,
          role: projectMembers.role,
          userName: user.name,
          userEmail: user.email,
        })
        .from(projectMembers)
        .leftJoin(user, eq(projectMembers.userId, user.id))
        .catch(() => [] as {
          id: string;
          projectId: string;
          userId: string;
          role: string | null;
          userName: string | null;
          userEmail: string | null;
        }[]),
    ]);

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
        proj.status !== "delivered" &&
        proj.status !== "completed" &&
        Boolean(proj.deadline && new Date(proj.deadline).getTime() < now);

      const projMembers = allProjectMembers.filter((pm) => pm.projectId === proj.id);
      const assignees = projMembers.map((pm) => ({
        id: pm.userId,
        name: pm.userName || "Team Member",
        email: pm.userEmail || null,
        role: pm.role,
      }));
      const assignedMemberIds = projMembers.map((pm) => pm.userId);

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
        assignees,
        assignedMemberIds,
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
      assignedMemberIds,
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

    // Assign project members if provided
    if (assignedMemberIds && Array.isArray(assignedMemberIds) && assignedMemberIds.length > 0) {
      for (const memberId of assignedMemberIds) {
        try {
          await db.insert(projectMembers).values({
            projectId: newProject[0].id,
            userId: memberId,
            role: "developer",
          });
        } catch {}
      }
    }

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "CREATE_PROJECT",
        entityType: "projects",
        entityId: newProject[0].id,
        details: { name: title, quotedAmountPaise, category, assignedMemberIds },
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
    const parseResult = projectEditSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid project data" },
        { status: 400 }
      );
    }

    const {
      id,
      clientId,
      name,
      category,
      quotedAmountPaise,
      startDate,
      deadline,
      status,
      assignedMemberIds,
    } = parseResult.data;

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const existingRows = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    if (existingRows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const existing = existingRows[0];

    const existingReceived = existing.receivedPaise || 0;
    const newQuoted = Number(quotedAmountPaise);
    const newPending = Math.max(0, newQuoted - existingReceived);

    const updated = await db.update(projects).set({
      clientId,
      title: name,
      category,
      quotedAmountPaise: newQuoted,
      pendingPaise: newPending,
      startDate: startDate ? String(startDate) : existing.startDate,
      deadline: deadline ? String(deadline) : existing.deadline,
      status,
      updatedAt: new Date(),
    }).where(eq(projects.id, id)).returning();

    // Synchronize assignees in projectMembers
    if (assignedMemberIds !== undefined) {
      try {
        await db.delete(projectMembers).where(eq(projectMembers.projectId, id));
        if (Array.isArray(assignedMemberIds) && assignedMemberIds.length > 0) {
          for (const memberId of assignedMemberIds) {
            await db.insert(projectMembers).values({
              projectId: id,
              userId: memberId,
              role: "developer",
            });
          }
        }
      } catch {}
    }

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "UPDATE_PROJECT",
        entityType: "projects",
        entityId: id,
        details: {
          old: {
            title: existing.title,
            clientId: existing.clientId,
            category: existing.category,
            quotedAmountPaise: existing.quotedAmountPaise,
            status: existing.status,
            deadline: existing.deadline,
          },
          new: {
            title: name,
            clientId,
            category,
            quotedAmountPaise: newQuoted,
            status,
            deadline: deadline || null,
            assignedMemberIds,
          },
        },
      });
    } catch {}

    return NextResponse.json({ success: true, project: { ...updated[0], name: updated[0].title } });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  // Strict role check: Only owner or users with canViewFinance can delete projects
  if (authCheck.member?.role !== "owner" && !authCheck.member?.canViewFinance) {
    return NextResponse.json(
      { error: "Forbidden: Only owner or financial administrator can delete projects." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing project ID" }, { status: 400 });
    if (!db) return NextResponse.json({ success: true });

    // Block delete if project has payments
    const existingPayments = await db.select().from(payments).where(eq(payments.projectId, id));
    if (existingPayments.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete project with ${existingPayments.length} existing payment(s). Delete or reassign payments first, or set status to 'cancelled'.`,
        },
        { status: 400 }
      );
    }

    const existing = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ success: true });
    }

    // Explicitly delete child relations for database integrity
    await db.delete(projectMembers).where(eq(projectMembers.projectId, id));
    await db.delete(milestones).where(eq(milestones.projectId, id));
    await db.delete(projects).where(eq(projects.id, id));

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "DELETE_PROJECT",
        entityType: "projects",
        entityId: id,
        details: {
          title: existing[0].title,
          quotedAmountPaise: existing[0].quotedAmountPaise,
          category: existing[0].category,
        },
      });
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

