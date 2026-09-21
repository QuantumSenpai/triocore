import { NextRequest, NextResponse } from "next/server";
import { db, mockServices } from "@/lib/db";
import { services, auditLogs, contentRevisions } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { verifyAdminSession } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    if (!db) {
      return NextResponse.json({ services: mockServices });
    }

    const data = await db.select().from(services).orderBy(asc(services.order));
    if (data.length === 0) {
      return NextResponse.json({ services: mockServices });
    }
    return NextResponse.json({ services: data });
  } catch (error) {
    return NextResponse.json({ services: mockServices, error: (error as Error).message });
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { title, desc, badge, colSpan, features, accent, iconName, order } = body;

    if (!title || !desc || !badge) {
      return NextResponse.json({ error: "Title, description, and badge are required" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ success: true, message: "Database not connected" });
    }

    const featuresArray = Array.isArray(features)
      ? features
      : typeof features === "string"
      ? features.split(",").map((f: string) => f.trim()).filter(Boolean)
      : [];

    const newService = await db.insert(services).values({
      title,
      desc,
      badge,
      colSpan: colSpan || "lg:col-span-1",
      features: featuresArray,
      accent: accent || "from-[#374BFF] to-[#14141A]",
      iconName: iconName || "Globe",
      order: Number(order) || 0,
    }).returning();

    const now = new Date();
    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "CREATE_SERVICE",
        entityType: "services",
        entityId: newService[0].id,
        details: { title },
        createdAt: now,
      });
      await db.insert(contentRevisions).values({
        section: "services",
        data: newService[0],
        createdBy: authCheck.user?.email || "admin",
        createdAt: now,
      });
    } catch {}

    revalidatePath("/", "layout");
    revalidatePath("/(marketing)", "layout");

    return NextResponse.json({ success: true, service: newService[0] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { id, title, desc, badge, colSpan, features, accent, iconName, order } = body;

    if (!id || !title || !desc || !badge) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ success: true, message: "Database not connected" });
    }

    const featuresArray = Array.isArray(features)
      ? features
      : typeof features === "string"
      ? features.split(",").map((f: string) => f.trim()).filter(Boolean)
      : [];

    const updated = await db.update(services).set({
      title,
      desc,
      badge,
      colSpan: colSpan || "lg:col-span-1",
      features: featuresArray,
      accent: accent || "from-[#374BFF] to-[#14141A]",
      iconName: iconName || "Globe",
      order: Number(order) || 0,
    }).where(eq(services.id, id)).returning();

    const now = new Date();
    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "UPDATE_SERVICE",
        entityType: "services",
        entityId: id,
        details: { title },
        createdAt: now,
      });
      await db.insert(contentRevisions).values({
        section: "services",
        data: updated[0],
        createdBy: authCheck.user?.email || "admin",
        createdAt: now,
      });
    } catch {}

    revalidatePath("/", "layout");
    revalidatePath("/(marketing)", "layout");

    return NextResponse.json({ success: true, service: updated[0] });
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
      return NextResponse.json({ error: "Missing service ID" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ success: true });
    }

    await db.delete(services).where(eq(services.id, id));

    const now = new Date();
    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "DELETE_SERVICE",
        entityType: "services",
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
