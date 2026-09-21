import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { employees, auditLogs, contentRevisions } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { verifyAdminSession } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    if (!db) return NextResponse.json({ employees: [] });
    const data = await db.select().from(employees).orderBy(asc(employees.order));
    return NextResponse.json({ employees: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { name, role, email, phone, avatarUrl, skills, order } = body;

    if (!name || !role) {
      return NextResponse.json({ error: "Name and role are required" }, { status: 400 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const skillsArray = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
      ? skills.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

    const newEmp = await db.insert(employees).values({
      name,
      role,
      avatarUrl: avatarUrl || "",
      skills: skillsArray,
      projects: [],
      order: Number(order) || 0,
    }).returning();

    const now = new Date();
    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "CREATE_EMPLOYEE",
        entityType: "employees",
        entityId: newEmp[0].id,
        details: { name, role },
        createdAt: now,
      });
      await db.insert(contentRevisions).values({
        section: "employees",
        data: newEmp[0],
        createdBy: authCheck.user?.email || "admin",
        createdAt: now,
      });
    } catch {}

    revalidatePath("/", "layout");
    revalidatePath("/(marketing)", "layout");

    return NextResponse.json({ success: true, employee: newEmp[0] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { id, name, role, avatarUrl, skills, order } = body;

    if (!id || !name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const skillsArray = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
      ? skills.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

    const updated = await db.update(employees).set({
      name,
      role,
      avatarUrl: avatarUrl || "",
      skills: skillsArray,
      order: Number(order) || 0,
    }).where(eq(employees.id, id)).returning();

    const now = new Date();
    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "UPDATE_EMPLOYEE",
        entityType: "employees",
        entityId: id,
        details: { name, role, order },
        createdAt: now,
      });
      await db.insert(contentRevisions).values({
        section: "employees",
        data: updated[0],
        createdBy: authCheck.user?.email || "admin",
        createdAt: now,
      });
    } catch {}

    revalidatePath("/", "layout");
    revalidatePath("/(marketing)", "layout");

    return NextResponse.json({ success: true, employee: updated[0] });
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

    if (!id) return NextResponse.json({ error: "Missing employee ID" }, { status: 400 });
    if (!db) return NextResponse.json({ success: true });

    await db.delete(employees).where(eq(employees.id, id));

    const now = new Date();
    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "DELETE_EMPLOYEE",
        entityType: "employees",
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
