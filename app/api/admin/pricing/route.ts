import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, mockPricingPlans } from "@/lib/db";
import { pricingPlans, auditLogs, contentRevisions } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { verifyAdminSession } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

const createPlanSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.string().min(1, "Price is required"),
  priceType: z.enum(["flat", "starting_from"]).default("flat"),
  originalPrice: z.string().optional(),
  savings: z.string().optional(),
  period: z.string().optional(),
  badge: z.string().optional(),
  isPopular: z.boolean().default(false),
  isBestValue: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  desc: z.string().default(""),
  features: z.union([z.array(z.string()), z.string()]).default([]),
  category: z.string().default("websites"),
  order: z.number().int().default(0),
});

const updatePlanSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1).optional(),
  price: z.string().min(1).optional(),
  priceType: z.enum(["flat", "starting_from"]).optional(),
  originalPrice: z.string().optional(),
  savings: z.string().optional(),
  period: z.string().optional(),
  badge: z.string().optional(),
  isPopular: z.boolean().optional(),
  isBestValue: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  desc: z.string().optional(),
  features: z.union([z.array(z.string()), z.string()]).optional(),
  category: z.string().optional(),
  order: z.number().int().optional(),
});

export async function GET(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    if (!db) {
      return NextResponse.json({ plans: mockPricingPlans, pricing: mockPricingPlans });
    }

    const data = await db.select().from(pricingPlans).orderBy(asc(pricingPlans.order));
    if (data.length === 0) {
      return NextResponse.json({ plans: mockPricingPlans, pricing: mockPricingPlans });
    }

    const formattedData = data.map((plan) => ({
      ...plan,
      priceType: plan.priceType || "flat",
      isPublished: plan.isPublished !== false,
      originalPrice: plan.originalPrice || "",
      savings: plan.savings || "",
      period: plan.period || "",
      badge: plan.badge || "",
      features: Array.isArray(plan.features)
        ? plan.features
        : typeof plan.features === "string"
        ? (plan.features as string).split(",").map((f) => f.trim()).filter(Boolean)
        : [],
    }));

    return NextResponse.json({ plans: formattedData, pricing: formattedData });
  } catch (error) {
    return NextResponse.json({ plans: mockPricingPlans, pricing: mockPricingPlans, error: (error as Error).message });
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const json = await req.json();
    const parseResult = createPlanSchema.safeParse(json);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const {
      name,
      price,
      priceType,
      originalPrice,
      savings,
      period,
      badge,
      isPopular,
      isBestValue,
      isPublished,
      desc,
      features,
      category,
      order,
    } = parseResult.data;

    if (!db) {
      return NextResponse.json({ success: true, message: "Database not connected" });
    }

    const featuresArray = Array.isArray(features)
      ? features
      : typeof features === "string"
      ? features.split(",").map((f: string) => f.trim()).filter(Boolean)
      : [];

    const newPlan = await db.insert(pricingPlans).values({
      name,
      price,
      priceType: priceType || (price.includes("+") ? "starting_from" : "flat"),
      originalPrice: originalPrice || "",
      savings: savings || "",
      period: period || "",
      badge: badge || "",
      isPopular: Boolean(isPopular),
      isBestValue: Boolean(isBestValue),
      isPublished: isPublished !== false,
      desc: desc || "",
      features: featuresArray,
      category: category || "websites",
      order: Number(order) || 0,
    }).returning();

    const now = new Date();
    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "CREATE_PRICING_PLAN",
        entityType: "pricing_plans",
        entityId: newPlan[0].id,
        details: newPlan[0],
        createdAt: now,
      });
      await db.insert(contentRevisions).values({
        section: "pricing",
        data: newPlan[0],
        createdBy: authCheck.user?.email || "admin",
        createdAt: now,
      });
    } catch {}

    revalidatePath("/");
    revalidatePath("/pricing");

    return NextResponse.json({ success: true, plan: newPlan[0] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const json = await req.json();
    const parseResult = updatePlanSchema.safeParse(json);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { id, features, ...fields } = parseResult.data;

    if (!db) {
      return NextResponse.json({ success: true, message: "Database not connected" });
    }

    const existing = await db.select().from(pricingPlans).where(eq(pricingPlans.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: "Pricing plan not found" }, { status: 404 });
    }

    const featuresArray = features !== undefined
      ? (Array.isArray(features)
        ? features
        : typeof features === "string"
        ? features.split(",").map((f: string) => f.trim()).filter(Boolean)
        : [])
      : existing[0].features;

    const updated = await db.update(pricingPlans).set({
      ...fields,
      ...(features !== undefined ? { features: featuresArray } : {}),
    }).where(eq(pricingPlans.id, id)).returning();

    const now = new Date();
    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "UPDATE_PRICING_PLAN",
        entityType: "pricing_plans",
        entityId: id,
        details: { before: existing[0], after: updated[0] },
        createdAt: now,
      });
      await db.insert(contentRevisions).values({
        section: "pricing",
        data: updated[0],
        createdBy: authCheck.user?.email || "admin",
        createdAt: now,
      });
    } catch {}

    revalidatePath("/");
    revalidatePath("/pricing");

    return NextResponse.json({ success: true, plan: updated[0] });
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
        id = json?.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ error: "Missing plan ID" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ success: true, message: "Database not connected" });
    }

    const existing = await db.select().from(pricingPlans).where(eq(pricingPlans.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: "Pricing plan not found" }, { status: 404 });
    }

    await db.delete(pricingPlans).where(eq(pricingPlans.id, id));

    const now = new Date();
    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "DELETE_PRICING_PLAN",
        entityType: "pricing_plans",
        entityId: id,
        details: existing[0],
        createdAt: now,
      });
      await db.insert(contentRevisions).values({
        section: "pricing",
        data: { id, deleted: true, prev: existing[0] },
        createdBy: authCheck.user?.email || "admin",
        createdAt: now,
      });
    } catch {}

    revalidatePath("/");
    revalidatePath("/pricing");

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
