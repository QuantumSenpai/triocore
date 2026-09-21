import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notes, auditLogs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyAdminSession } from "@/lib/auth-guard";

/**
 * Strips dangerous <script> tags and javascript: protocol from text
 */
function sanitizeMarkdown(input: string): string {
  if (!input) return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<script[^>]*>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/\s*on\w+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\s*on\w+\s*=\s*[^>\s]+/gi, "");
}

export async function GET(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    if (!db) return NextResponse.json({ notes: [] });

    const allNotes = await db.select().from(notes).orderBy(desc(notes.isPinned), desc(notes.updatedAt));
    return NextResponse.json({ notes: allNotes });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { title, content, isPinned = false, category = "general" } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const cleanTitle = sanitizeMarkdown(String(title).trim());
    const cleanContent = sanitizeMarkdown(String(content).trim());

    const newNote = await db.insert(notes).values({
      title: cleanTitle,
      content: cleanContent,
      isPinned: Boolean(isPinned),
      category: String(category),
      createdById: authCheck.user?.id || null,
    }).returning();

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "CREATE_NOTE",
        entityType: "notes",
        entityId: newNote[0].id,
        details: { title: cleanTitle, isPinned },
      });
    } catch {}

    return NextResponse.json({ success: true, note: newNote[0] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { id, title, content, isPinned, category } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing note ID" }, { status: 400 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const cleanTitle = title !== undefined ? sanitizeMarkdown(String(title).trim()) : undefined;
    const cleanContent = content !== undefined ? sanitizeMarkdown(String(content).trim()) : undefined;

    const updated = await db.update(notes).set({
      title: cleanTitle,
      content: cleanContent,
      isPinned: isPinned !== undefined ? Boolean(isPinned) : undefined,
      category: category !== undefined ? String(category) : undefined,
      updatedAt: new Date(),
    }).where(eq(notes.id, id)).returning();

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "UPDATE_NOTE",
        entityType: "notes",
        entityId: id,
        details: { isPinned },
      });
    } catch {}

    return NextResponse.json({ success: true, note: updated[0] });
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

    if (!id) return NextResponse.json({ error: "Missing note ID" }, { status: 400 });
    if (!db) return NextResponse.json({ success: true });

    await db.delete(notes).where(eq(notes.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
