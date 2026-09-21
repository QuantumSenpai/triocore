import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { faqs, auditLogs, contentRevisions } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { verifyAdminSession } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    if (!db) return NextResponse.json({ faqs: [] });
    const data = await db.select().from(faqs).orderBy(asc(faqs.order));
    return NextResponse.json({ faqs: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { question, answer, category, isHome, order } = body;

    if (!question || !answer) {
      return NextResponse.json({ error: "Question and answer are required" }, { status: 400 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const newFaq = await db.insert(faqs).values({
      question,
      answer,
      category: category || "General",
      isHome: isHome !== undefined ? Boolean(isHome) : true,
      order: Number(order) || 0,
    }).returning();

    const now = new Date();
    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "CREATE_FAQ",
        entityType: "faqs",
        entityId: newFaq[0].id,
        details: { question, category },
        createdAt: now,
      });
      await db.insert(contentRevisions).values({
        section: "faqs",
        data: newFaq[0],
        createdBy: authCheck.user?.email || "admin",
        createdAt: now,
      });
    } catch {}

    revalidatePath("/", "layout");
    revalidatePath("/(marketing)", "layout");

    return NextResponse.json({ success: true, faq: newFaq[0] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { id, question, answer, category, isHome, order } = body;

    if (!id || !question || !answer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const updated = await db.update(faqs).set({
      question,
      answer,
      category: category || "General",
      isHome: isHome !== undefined ? Boolean(isHome) : true,
      order: Number(order) || 0,
    }).where(eq(faqs.id, id)).returning();

    const now = new Date();
    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "UPDATE_FAQ",
        entityType: "faqs",
        entityId: id,
        details: { question, category, order },
        createdAt: now,
      });
      await db.insert(contentRevisions).values({
        section: "faqs",
        data: updated[0],
        createdBy: authCheck.user?.email || "admin",
        createdAt: now,
      });
    } catch {}

    revalidatePath("/", "layout");
    revalidatePath("/(marketing)", "layout");

    return NextResponse.json({ success: true, faq: updated[0] });
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

    if (!id) return NextResponse.json({ error: "Missing FAQ ID" }, { status: 400 });
    if (!db) return NextResponse.json({ success: true });

    await db.delete(faqs).where(eq(faqs.id, id));

    const now = new Date();
    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "DELETE_FAQ",
        entityType: "faqs",
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
