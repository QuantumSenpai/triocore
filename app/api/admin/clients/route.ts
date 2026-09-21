import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients, auditLogs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyAdminSession } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    if (!db) return NextResponse.json({ clients: [] });
    const data = await db.select().from(clients).orderBy(desc(clients.createdAt));
    return NextResponse.json({ clients: data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { name, email, phone, company, businessName, address, city, notes, status } = body;

    if (!name) {
      return NextResponse.json({ error: "Client name is required" }, { status: 400 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const newClient = await db.insert(clients).values({
      name,
      email: email || null,
      phone: phone || null,
      businessName: businessName || company || null,
      city: city || address || null,
      notes: notes || null,
      status: status || "active",
    }).returning();

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "CREATE_CLIENT",
        entityType: "clients",
        entityId: newClient[0].id,
        details: { name, company: businessName || company },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      client: { ...newClient[0], company: newClient[0].businessName },
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { id, name, email, phone, company, businessName, address, city, notes, status } = body;

    if (!id || !name) {
      return NextResponse.json({ error: "Client ID and name are required" }, { status: 400 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const updated = await db.update(clients).set({
      name,
      email: email || null,
      phone: phone || null,
      businessName: businessName || company || null,
      city: city || address || null,
      notes: notes || null,
      status: status || "active",
      updatedAt: new Date(),
    }).where(eq(clients.id, id)).returning();

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "UPDATE_CLIENT",
        entityType: "clients",
        entityId: id,
        details: { name },
      });
    } catch {}

    return NextResponse.json({ success: true, client: updated[0] });
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

    if (!id) return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
    if (!db) return NextResponse.json({ success: true });

    await db.delete(clients).where(eq(clients.id, id));

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "DELETE_CLIENT",
        entityType: "clients",
        entityId: id,
        details: { id },
      });
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
