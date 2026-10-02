import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { siteSettings, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyAdminSession } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { defaultLaunchOffer, LaunchOfferConfig } from "@/lib/dal/content";

const itemSchema = z.object({
  label: z.string().min(1, "Label is required"),
  original_price_paise: z.number().int().nonnegative(),
  offer_price_paise: z.number().int().nonnegative(),
  savings_label: z.string().default(""),
  desc: z.string().optional(),
});

const launchOfferSchema = z.object({
  isActive: z.boolean(),
  headline: z.string().min(1, "Headline is required"),
  subtext: z.string().min(1, "Subtext is required"),
  tag: z.string().optional(),
  items: z.array(itemSchema).min(1, "At least one item is required"),
});

export async function GET(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    if (!db) return NextResponse.json({ offer: defaultLaunchOffer });

    const rows = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, "launch_offer"))
      .limit(1);

    if (rows.length > 0 && rows[0].value) {
      return NextResponse.json({ offer: rows[0].value });
    }

    return NextResponse.json({ offer: defaultLaunchOffer });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const json = await req.json();
    const parseResult = launchOfferSchema.safeParse(json);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const offerData: LaunchOfferConfig = parseResult.data;

    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }

    await db
      .insert(siteSettings)
      .values({
        id: "launch_offer",
        key: "launch_offer",
        value: offerData,
        updatedBy: authCheck.user?.email || "admin",
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: offerData,
          updatedBy: authCheck.user?.email || "admin",
          updatedAt: new Date(),
        },
      });

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "UPDATE_LAUNCH_OFFER",
        entityType: "site_settings",
        entityId: "launch_offer",
        details: offerData,
      });
    } catch (auditErr) {
      console.warn("Failed to record audit log for launch offer update:", auditErr);
    }

    revalidatePath("/");
    revalidatePath("/pricing");

    return NextResponse.json({ success: true, offer: offerData });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
