import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { siteSettings, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyAdminSession } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { roadmapData, RoadmapPhase } from "@/lib/data/site-content";

const milestoneSchema = z.object({
  text: z.string().min(1, "Milestone text is required"),
  status: z.enum(["completed", "in-progress", "pending", "future"]),
});

const phaseSchema = z.object({
  phase: z.string().min(1, "Phase name is required"),
  year: z.string().min(1, "Year is required"),
  title: z.string().min(1, "Title is required"),
  status: z.string().min(1, "Status badge text is required"),
  statusType: z.enum(["active", "upcoming", "future"]),
  badgeBg: z.string().optional(),
  nodeBorder: z.string().optional(),
  milestones: z.array(milestoneSchema).min(1, "At least one milestone is required"),
});

const roadmapPayloadSchema = z.union([
  z.object({
    phases: z.array(phaseSchema).min(1, "At least one phase is required"),
  }),
  z.array(phaseSchema).min(1, "At least one phase is required"),
]);

export async function GET(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    if (!db) return NextResponse.json({ phases: roadmapData });

    const rows = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, "roadmap"))
      .limit(1);

    if (rows.length > 0 && rows[0].value && Array.isArray(rows[0].value)) {
      return NextResponse.json({ phases: rows[0].value });
    }

    return NextResponse.json({ phases: roadmapData });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const json = await req.json();
    const parseResult = roadmapPayloadSchema.safeParse(json);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const phases: RoadmapPhase[] = Array.isArray(parseResult.data)
      ? parseResult.data
      : parseResult.data.phases;

    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }

    await db
      .insert(siteSettings)
      .values({
        id: "roadmap",
        key: "roadmap",
        value: phases,
        updatedBy: authCheck.user?.email || "admin",
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: phases,
          updatedBy: authCheck.user?.email || "admin",
          updatedAt: new Date(),
        },
      });

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "UPDATE_ROADMAP",
        entityType: "site_settings",
        entityId: "roadmap",
        details: { count: phases.length },
      });
    } catch (auditErr) {
      console.warn("Failed to record audit log for roadmap update:", auditErr);
    }

    revalidatePath("/");
    revalidatePath("/#roadmap");

    return NextResponse.json({ success: true, phases });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
