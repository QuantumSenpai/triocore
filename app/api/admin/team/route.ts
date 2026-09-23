import { NextRequest, NextResponse } from "next/server";
import { db, mockTeamMembers } from "@/lib/db";
import { teamMembers, auditLogs, contentRevisions, user } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { verifyAdminSession } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    if (!db) {
      return NextResponse.json({ members: mockTeamMembers, team: mockTeamMembers });
    }

    const data = await db.select().from(teamMembers).orderBy(asc(teamMembers.order));
    if (data.length === 0) {
      return NextResponse.json({ members: mockTeamMembers, team: mockTeamMembers });
    }

    const allUsers = await db.select({ id: user.id, name: user.name, email: user.email }).from(user);
    const enriched = data.map((tm) => {
      const firstName = tm.name.trim().split(" ")[0];
      const matched = allUsers.find(
        (u) => u.name && u.name.toLowerCase().includes(firstName.toLowerCase())
      );
      return {
        ...tm,
        userId: matched?.id || tm.id,
      };
    });

    return NextResponse.json({ members: enriched, team: enriched });
  } catch (error) {
    return NextResponse.json({ members: mockTeamMembers, team: mockTeamMembers, error: (error as Error).message });
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { name, role, avatarUrl, skills, projects, githubUrl, linkedinUrl, isPlaceholder, order } = body;

    if (!name || !role) {
      return NextResponse.json({ error: "Name and role are required" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ success: true, message: "Database not connected" });
    }

    const skillsArray = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
      ? skills.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

    const newMember = await db.insert(teamMembers).values({
      name,
      role,
      avatarUrl: avatarUrl || "",
      skills: skillsArray,
      projects: projects || [],
      githubUrl: githubUrl || null,
      linkedinUrl: linkedinUrl || null,
      order: Number(order) || 0,
    }).returning();

    const now = new Date();
    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "CREATE_TEAM_MEMBER",
        entityType: "team_members",
        entityId: newMember[0].id,
        details: { name, role },
        createdAt: now,
      });
      await db.insert(contentRevisions).values({
        section: "team",
        data: newMember[0],
        createdBy: authCheck.user?.email || "admin",
        createdAt: now,
      });
    } catch {}

    revalidatePath("/", "layout");
    revalidatePath("/(marketing)", "layout");

    return NextResponse.json({ success: true, member: newMember[0] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { id, name, role, avatarUrl, skills, projects, githubUrl, linkedinUrl, isPlaceholder, order } = body;

    if (!id || !name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ success: true, message: "Database not connected" });
    }

    const skillsArray = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
      ? skills.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

    const updated = await db.update(teamMembers).set({
      name,
      role,
      avatarUrl: avatarUrl || "",
      skills: skillsArray,
      projects: projects || [],
      githubUrl: githubUrl || null,
      linkedinUrl: linkedinUrl || null,
      order: Number(order) || 0,
    }).where(eq(teamMembers.id, id)).returning();

    const now = new Date();
    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "UPDATE_TEAM_MEMBER",
        entityType: "team_members",
        entityId: id,
        details: { name, role, order },
        createdAt: now,
      });
      await db.insert(contentRevisions).values({
        section: "team",
        data: updated[0],
        createdBy: authCheck.user?.email || "admin",
        createdAt: now,
      });
    } catch {}

    revalidatePath("/", "layout");
    revalidatePath("/(marketing)", "layout");

    return NextResponse.json({ success: true, member: updated[0] });
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

    if (!id) {
      return NextResponse.json({ error: "Missing member ID" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ success: true });
    }

    await db.delete(teamMembers).where(eq(teamMembers.id, id));

    const now = new Date();
    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "DELETE_TEAM_MEMBER",
        entityType: "team_members",
        entityId: id,
        details: { id },
        createdAt: now,
      });
    } catch {}

    revalidatePath("/", "layout");
    revalidatePath("/(marketing)", "layout");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
