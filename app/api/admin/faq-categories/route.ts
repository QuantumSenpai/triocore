import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { faqCategories, faqs, auditLogs } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { verifyAdminSession } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    if (!db) return NextResponse.json({ categories: [] });
    const categories = await db.select().from(faqCategories).orderBy(asc(faqCategories.order));
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { name, slug, order } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const cleanSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const newCategory = await db
      .insert(faqCategories)
      .values({
        name: name.trim(),
        slug: cleanSlug,
        order: Number(order) || 0,
      })
      .returning();

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "CREATE_FAQ_CATEGORY",
        entityType: "faq_categories",
        entityId: newCategory[0].id,
        details: { name: name.trim(), slug: cleanSlug },
        createdAt: new Date(),
      });
    } catch {}

    revalidatePath("/faq");
    revalidatePath("/");

    return NextResponse.json({ success: true, category: newCategory[0] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { id, name, slug, order } = body;

    if (!id || !name) {
      return NextResponse.json({ error: "ID and category name are required" }, { status: 400 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const cleanSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const updated = await db
      .update(faqCategories)
      .set({
        name: name.trim(),
        slug: cleanSlug,
        order: Number(order) || 0,
      })
      .where(eq(faqCategories.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "UPDATE_FAQ_CATEGORY",
        entityType: "faq_categories",
        entityId: id,
        details: { name: name.trim(), slug: cleanSlug },
        createdAt: new Date(),
      });
    } catch {}

    revalidatePath("/faq");
    revalidatePath("/");

    return NextResponse.json({ success: true, category: updated[0] });
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
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    // Set matching FAQs categoryId to null before deleting (or handled by ON DELETE SET NULL)
    await db.update(faqs).set({ categoryId: null }).where(eq(faqs.categoryId, id));

    const deleted = await db.delete(faqCategories).where(eq(faqCategories.id, id)).returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "DELETE_FAQ_CATEGORY",
        entityType: "faq_categories",
        entityId: id,
        details: { name: deleted[0].name },
        createdAt: new Date(),
      });
    } catch {}

    revalidatePath("/faq");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
