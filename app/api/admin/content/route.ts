import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteContent } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyAdminSession } from "@/lib/auth-guard";
import { saveSiteContent } from "@/lib/dal/content";

export async function GET(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    if (!db) return NextResponse.json({ content: [] });
    const { searchParams } = new URL(req.url);
    const section = searchParams.get("section");

    const query = db.select().from(siteContent);
    if (section) {
      const data = await db.select().from(siteContent).where(eq(siteContent.section, section));
      return NextResponse.json({ content: data });
    }

    const data = await query;
    return NextResponse.json({ content: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { key, value, section = "general", label = key } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Key and value are required" }, { status: 400 });
    }

    const result = await saveSiteContent(key, String(value), section, label);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
