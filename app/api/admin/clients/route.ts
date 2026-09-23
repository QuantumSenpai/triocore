import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients, auditLogs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/dal/auth";
import { clientCreateSchema, clientEditSchema } from "@/lib/validations/crm";

export async function GET(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    if (!db) return NextResponse.json({ clients: [] });
    const data = await db.select().from(clients).orderBy(desc(clients.createdAt));
    const enriched = data.map((c) => ({
      ...c,
      company: c.businessName || null,
    }));
    return NextResponse.json({ clients: enriched });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const parseResult = clientCreateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid client data" },
        { status: 400 }
      );
    }

    const { name, email, phone, company, businessName, address, city, notes, status } = parseResult.data;
    const finalBusinessName = businessName || company || null;

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const newClient = await db.insert(clients).values({
      name,
      email: email || null,
      phone: phone || null,
      businessName: finalBusinessName,
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
        details: { name, businessName: finalBusinessName },
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
  const authCheck = await requireAdmin(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const parseResult = clientEditSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid client data" },
        { status: 400 }
      );
    }

    const { id, name, email, phone, company, businessName, address, city, notes, status } = parseResult.data;
    const finalBusinessName = businessName !== undefined ? businessName : (company !== undefined ? company : undefined);

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const updatePayload: Record<string, unknown> = {
      name,
      email: email || null,
      phone: phone || null,
      city: city || address || null,
      notes: notes || null,
      status: status || "active",
      updatedAt: new Date(),
    };

    if (finalBusinessName !== undefined) {
      updatePayload.businessName = finalBusinessName || null;
    }

    const updated = await db.update(clients).set(updatePayload).where(eq(clients.id, id)).returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "UPDATE_CLIENT",
        entityType: "clients",
        entityId: id,
        details: { name, businessName: finalBusinessName },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      client: { ...updated[0], company: updated[0].businessName },
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authCheck = await requireAdmin(req);
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
