import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyAdminSession } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    if (!db) {
      return NextResponse.json({ inquiries: [] });
    }

    try {
      const data = await db.select().from(contacts).orderBy(desc(contacts.createdAt));
      return NextResponse.json({ inquiries: data });
    } catch {
      const partialData = await db.select({
        id: contacts.id,
        name: contacts.name,
        email: contacts.email,
        phone: contacts.phone,
        service: contacts.service,
        budget: contacts.budget,
        message: contacts.message,
        createdAt: contacts.createdAt,
      }).from(contacts).orderBy(desc(contacts.createdAt));

      const normalized = partialData.map((item) => ({
        ...item,
        status: "Unread",
      }));

      return NextResponse.json({ inquiries: normalized });
    }
  } catch {
    return NextResponse.json({ inquiries: [] });
  }
}

export async function PATCH(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "Missing inquiry ID or status" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ success: true });
    }

    try {
      await db.update(contacts).set({ status }).where(eq(contacts.id, id));
    } catch {}

    return NextResponse.json({ success: true });
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
      return NextResponse.json({ error: "Missing inquiry ID" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ success: true });
    }

    await db.delete(contacts).where(eq(contacts.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
