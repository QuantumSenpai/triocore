import { NextRequest, NextResponse } from "next/server";
import { db, mockSiteStats } from "@/lib/db";
import { siteStats } from "@/lib/db/schema";
import { eq, asc, sql } from "drizzle-orm";
import { verifyAdminSession } from "@/lib/auth-guard";

async function ensureTable() {
  if (!db) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "site_stats" (
        "id" text PRIMARY KEY,
        "section" text DEFAULT 'hero' NOT NULL,
        "key" text UNIQUE NOT NULL,
        "value" text NOT NULL,
        "label" text NOT NULL,
        "order" integer DEFAULT 0 NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
  } catch {}
}

export async function GET(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ stats: mockSiteStats });
    }

    await ensureTable();

    const data = await db.select().from(siteStats).orderBy(asc(siteStats.order));
    if (data.length === 0) {
      return NextResponse.json({ stats: mockSiteStats });
    }
    return NextResponse.json({ stats: data });
  } catch (error) {
    return NextResponse.json({ stats: mockSiteStats, error: (error as Error).message });
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { key, value, label, section = "hero", order = 0 } = body;

    if (!key || !value || !label) {
      return NextResponse.json({ error: "Key, value, and label are required" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ success: true, message: "Database not connected" });
    }

    await ensureTable();

    const newStat = await db
      .insert(siteStats)
      .values({
        key,
        value,
        label,
        section,
        order: Number(order) || 0,
      })
      .returning();

    return NextResponse.json({ success: true, stat: newStat[0] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { id, key, value, label, section, order } = body;

    if (!id || !value || !label) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ success: true, message: "Database not connected" });
    }

    await ensureTable();

    const updated = await db
      .update(siteStats)
      .set({
        value,
        label,
        ...(key ? { key } : {}),
        ...(section ? { section } : {}),
        ...(order !== undefined ? { order: Number(order) } : {}),
        updatedAt: new Date(),
      })
      .where(eq(siteStats.id, id))
      .returning();

    return NextResponse.json({ success: true, stat: updated[0] });
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
      return NextResponse.json({ error: "Missing stat ID" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ success: true });
    }

    await ensureTable();

    await db.delete(siteStats).where(eq(siteStats.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
