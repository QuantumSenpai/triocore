import { NextRequest, NextResponse } from "next/server";
import { db, mockTeamMembers } from "@/lib/db";
import { teamMembers } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { verifyAdminSession } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ team: mockTeamMembers, members: mockTeamMembers });
    }

    const data = await db.select().from(teamMembers).orderBy(asc(teamMembers.order));
    if (data.length === 0) {
      return NextResponse.json({ team: mockTeamMembers, members: mockTeamMembers });
    }
    return NextResponse.json({ team: data, members: data });
  } catch (error) {
    return NextResponse.json({ team: mockTeamMembers, members: mockTeamMembers, error: (error as Error).message });
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { name, role, avatarUrl, skills, projects, githubUrl, linkedinUrl, order } = body;

    if (!name || !role || !avatarUrl) {
      return NextResponse.json({ error: "Name, role, and avatar URL are required" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ success: true, message: "Database not connected" });
    }

    const skillsArray = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
      ? skills.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

    const projectsArray = Array.isArray(projects)
      ? projects
      : typeof projects === "string"
      ? projects.split(",").map((p: string) => ({ title: p.trim() })).filter(Boolean)
      : [];

    const newMember = await db.insert(teamMembers).values({
      name,
      role,
      avatarUrl,
      skills: skillsArray,
      projects: projectsArray,
      githubUrl: githubUrl || "",
      linkedinUrl: linkedinUrl || "",
      order: Number(order) || 0,
    }).returning();

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
    const { id, name, role, avatarUrl, skills, projects, githubUrl, linkedinUrl, order } = body;

    if (!id || !name || !role || !avatarUrl) {
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

    const projectsArray = Array.isArray(projects)
      ? projects
      : typeof projects === "string"
      ? projects.split(",").map((p: string) => ({ title: p.trim() })).filter(Boolean)
      : [];

    const updated = await db.update(teamMembers).set({
      name,
      role,
      avatarUrl,
      skills: skillsArray,
      projects: projectsArray,
      githubUrl: githubUrl || "",
      linkedinUrl: linkedinUrl || "",
      order: Number(order) || 0,
    }).where(eq(teamMembers.id, id)).returning();

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
      return NextResponse.json({ error: "Missing team member ID" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ success: true });
    }

    await db.delete(teamMembers).where(eq(teamMembers.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
