import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { pricingCategories, auditLogs } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { verifyAdminSession } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

const createCategorySchema = z.object({
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  label: z.string().min(1, "Label is required"),
  order: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});

const updateCategorySchema = z.object({
  id: z.string().min(1, "ID is required"),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  label: z.string().min(1).optional(),
  order: z.number().int().optional(),
  isPublished: z.boolean().optional(),
});

const deleteCategorySchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export async function GET(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    if (!db) return NextResponse.json({ categories: [] });
    const rows = await db.select().from(pricingCategories).orderBy(asc(pricingCategories.order));
    return NextResponse.json({ categories: rows });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const json = await req.json();
    const parseResult = createCategorySchema.safeParse(json);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { slug, label, order, isPublished } = parseResult.data;
    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const existing = await db.select().from(pricingCategories).where(eq(pricingCategories.slug, slug)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Category slug already exists" }, { status: 409 });
    }

    const [newCat] = await db
      .insert(pricingCategories)
      .values({
        slug,
        label,
        order,
        isPublished,
      })
      .returning();

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "CREATE_PRICING_CATEGORY",
        entityType: "pricing_categories",
        entityId: newCat.id,
        details: newCat,
      });
    } catch {}

    revalidatePath("/");
    revalidatePath("/pricing");

    return NextResponse.json({ success: true, category: newCat });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const json = await req.json();
    const parseResult = updateCategorySchema.safeParse(json);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { id, ...updates } = parseResult.data;
    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const existing = await db.select().from(pricingCategories).where(eq(pricingCategories.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const [updated] = await db
      .update(pricingCategories)
      .set(updates)
      .where(eq(pricingCategories.id, id))
      .returning();

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "UPDATE_PRICING_CATEGORY",
        entityType: "pricing_categories",
        entityId: id,
        details: { before: existing[0], after: updated },
      });
    } catch {}

    revalidatePath("/");
    revalidatePath("/pricing");

    return NextResponse.json({ success: true, category: updated });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    let id = req.nextUrl.searchParams.get("id");
    if (!id) {
      try {
        const json = await req.json();
        const parseResult = deleteCategorySchema.safeParse(json);
        if (parseResult.success) {
          id = parseResult.data.id;
        }
      } catch {}
    }

    if (!id) {
      return NextResponse.json(
        { error: "Missing or invalid category ID" },
        { status: 400 }
      );
    }
    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const existing = await db.select().from(pricingCategories).where(eq(pricingCategories.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await db.delete(pricingCategories).where(eq(pricingCategories.id, id));

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "DELETE_PRICING_CATEGORY",
        entityType: "pricing_categories",
        entityId: id,
        details: existing[0],
      });
    } catch {}

    revalidatePath("/");
    revalidatePath("/pricing");

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
