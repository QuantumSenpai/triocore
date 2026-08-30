import { NextRequest, NextResponse } from "next/server";
import { db, mockShowcaseProjects } from "@/lib/db";
import { showcaseProjects } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { verifyAdminSession } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ projects: mockShowcaseProjects });
    }

    const data = await db.select().from(showcaseProjects).orderBy(asc(showcaseProjects.order));
    if (data.length === 0) {
      return NextResponse.json({ projects: mockShowcaseProjects });
    }
    return NextResponse.json({ projects: data });
  } catch (error) {
    return NextResponse.json({ projects: mockShowcaseProjects, error: (error as Error).message });
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { title, description, imageUrl, liveUrl, tech, status, order } = body;

    if (!title || !description || !imageUrl) {
      return NextResponse.json({ error: "Title, description, and image URL are required" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ success: true, message: "Database not connected" });
    }

    const techArray = Array.isArray(tech)
      ? tech
      : typeof tech === "string"
      ? tech.split(",").map((t: string) => t.trim()).filter(Boolean)
      : [];

    const newProject = await db.insert(showcaseProjects).values({
      title,
      description,
      imageUrl,
      liveUrl: liveUrl || "",
      tech: techArray,
      status: status || "Completed",
      order: Number(order) || 0,
    }).returning();

    return NextResponse.json({ success: true, project: newProject[0] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { id, title, description, imageUrl, liveUrl, tech, status, order } = body;

    if (!id || !title || !description || !imageUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ success: true, message: "Database not connected" });
    }

    const techArray = Array.isArray(tech)
      ? tech
      : typeof tech === "string"
      ? tech.split(",").map((t: string) => t.trim()).filter(Boolean)
      : [];

    const updated = await db.update(showcaseProjects).set({
      title,
      description,
      imageUrl,
      liveUrl: liveUrl || "",
      tech: techArray,
      status: status || "Completed",
      order: Number(order) || 0,
    }).where(eq(showcaseProjects.id, id)).returning();

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

    if (!id) {
      return NextResponse.json({ error: "Missing project ID" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ success: true });
    }

    await db.delete(showcaseProjects).where(eq(showcaseProjects.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
