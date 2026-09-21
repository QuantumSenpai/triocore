import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminMembers, user, auditLogs, session } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdminRole } from "@/lib/dal/auth";

export async function GET(req: NextRequest) {
  const authCheck = await requireAdminRole("owner", req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    if (!db) return NextResponse.json({ members: [] });

    const members = await db
      .select({
        id: adminMembers.id,
        userId: adminMembers.userId,
        role: adminMembers.role,
        canViewFinance: adminMembers.canViewFinance,
        status: adminMembers.status,
        email: user.email,
        name: user.name,
        createdAt: adminMembers.createdAt,
      })
      .from(adminMembers)
      .leftJoin(user, eq(adminMembers.userId, user.id));

    return NextResponse.json({ members });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authCheck = await requireAdminRole("owner", req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { userId, role, canViewFinance, status } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const updated = await db.update(adminMembers).set({
      role: role !== undefined ? role : undefined,
      canViewFinance: canViewFinance !== undefined ? Boolean(canViewFinance) : undefined,
      status: status !== undefined ? status : undefined,
      updatedAt: new Date(),
    }).where(eq(adminMembers.userId, userId)).returning();

    if (status === "disabled") {
      await db.delete(session).where(eq(session.userId, userId));
    }

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "UPDATE_TEAM_ACCESS",
        entityType: "admin_members",
        entityId: userId,
        details: { role, canViewFinance, status },
      });
    } catch {}

    return NextResponse.json({ success: true, member: updated[0] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export const PATCH = PUT;
