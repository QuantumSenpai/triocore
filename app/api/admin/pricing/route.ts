import { NextRequest, NextResponse } from "next/server";
import { db, mockPricingPlans } from "@/lib/db";
import { pricingPlans, auditLogs, contentRevisions } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { verifyAdminSession } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

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
    const body = await req.json();
    const { name, price, originalPrice, savings, period, badge, isPopular, isBestValue, desc, features, category, order } = body;

    if (!name || !price || !desc) {
      return NextResponse.json({ error: "Name, price, and description are required" }, { status: 400 });
    }

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
      originalPrice: originalPrice || "",
      savings: savings || "",
      period: period || "",
      badge: badge || "",
      isPopular: Boolean(isPopular),
      isBestValue: Boolean(isBestValue),
      desc,
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
        details: { name, price },
        createdAt: now,
      });
      await db.insert(contentRevisions).values({
        section: "pricing",
        data: newPlan[0],
        createdBy: authCheck.user?.email || "admin",
        createdAt: now,
      });
    } catch {}

    revalidatePath("/", "layout");
    revalidatePath("/(marketing)", "layout");

    return NextResponse.json({ success: true, plan: newPlan[0] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { id, name, price, originalPrice, savings, period, badge, isPopular, isBestValue, desc, features, category, order } = body;

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

    const featuresArray = features !== undefined
      ? (Array.isArray(features)
        ? features
        : typeof features === "string"
        ? features.split(",").map((f: string) => f.trim()).filter(Boolean)
        : [])
      : existing[0].features;

    const updated = await db.update(pricingPlans).set({
      name: name !== undefined ? name : existing[0].name,
      price: price !== undefined ? price : existing[0].price,
      originalPrice: originalPrice !== undefined ? originalPrice : existing[0].originalPrice,
      savings: savings !== undefined ? savings : existing[0].savings,
      period: period !== undefined ? period : existing[0].period,
      badge: badge !== undefined ? badge : existing[0].badge,
      isPopular: isPopular !== undefined ? Boolean(isPopular) : existing[0].isPopular,
      isBestValue: isBestValue !== undefined ? Boolean(isBestValue) : existing[0].isBestValue,
      desc: desc !== undefined ? desc : existing[0].desc,
      features: featuresArray,
      category: category !== undefined ? category : existing[0].category,
      order: order !== undefined ? Number(order) : existing[0].order,
    }).where(eq(pricingPlans.id, id)).returning();

    const now = new Date();
    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "UPDATE_PRICING_PLAN",
        entityType: "pricing_plans",
        entityId: id,
        details: { name, price },
        createdAt: now,
      });
      await db.insert(contentRevisions).values({
        section: "pricing",
        data: updated[0],
        createdBy: authCheck.user?.email || "admin",
        createdAt: now,
      });
    } catch {}

    revalidatePath("/", "layout");
    revalidatePath("/(marketing)", "layout");

    return NextResponse.json({ success: true, plan: updated[0] });
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
      return NextResponse.json({ error: "Missing plan ID" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ success: true });
    }

    await db.delete(pricingPlans).where(eq(pricingPlans.id, id));

    const now = new Date();
    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "DELETE_PRICING_PLAN",
        entityType: "pricing_plans",
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
