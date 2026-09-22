import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts, auditLogs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyAdminSession } from "@/lib/auth-guard";
import { inquiryEditSchema } from "@/lib/validations/crm";

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

export async function PUT(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const parseResult = inquiryEditSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid inquiry data" },
        { status: 400 }
      );
    }

    const { id, name, email, phone, service, budget, message, status } = parseResult.data;

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const existingRows = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
    if (existingRows.length === 0) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }
    const existing = existingRows[0];

    const updated = await db
      .update(contacts)
      .set({
        name,
        email,
        phone: phone || null,
        service,
        budget: budget || null,
        message,
        status,
      })
      .where(eq(contacts.id, id))
      .returning();

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "UPDATE_INQUIRY",
        entityType: "contacts",
        entityId: id,
        details: {
          old: {
            name: existing.name,
            email: existing.email,
            phone: existing.phone,
            service: existing.service,
            budget: existing.budget,
            status: existing.status,
          },
          new: {
            name,
            email,
            phone: phone || null,
            service,
            budget: budget || null,
            status,
          },
        },
      });
    } catch {}

    return NextResponse.json({ success: true, inquiry: updated[0] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
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

    const existing = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
    await db.update(contacts).set({ status }).where(eq(contacts.id, id));

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "UPDATE_INQUIRY_STATUS",
        entityType: "contacts",
        entityId: id,
        details: {
          oldStatus: existing[0]?.status,
          newStatus: status,
        },
      });
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

    const existing = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ success: true });
    }

    await db.delete(contacts).where(eq(contacts.id, id));

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "DELETE_INQUIRY",
        entityType: "contacts",
        entityId: id,
        details: {
          name: existing[0].name,
          email: existing[0].email,
          service: existing[0].service,
        },
      });
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

