import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteSettings, auditLogs } from "@/lib/db/schema";
import { verifyAdminSession } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    if (!db) return NextResponse.json({ settings: {} });
    const rows = await db.select().from(siteSettings);
    const settingsMap: Record<string, unknown> = {};
    for (const r of rows) {
      settingsMap[r.key] = r.value;
    }
    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    await db
      .insert(siteSettings)
      .values({
        id: key,
        key,
        value,
        updatedBy: authCheck.user?.email || "admin",
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value,
          updatedBy: authCheck.user?.email || "admin",
          updatedAt: new Date(),
        },
      });

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "UPDATE_SITE_SETTING",
        entityType: "site_settings",
        entityId: key,
        details: { key, value },
      });
    } catch {}

    return NextResponse.json({ success: true, key, value });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
