import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts, clients, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyAdminSession } from "@/lib/auth-guard";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing inquiry ID" }, { status: 400 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const inquiry = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
    if (inquiry.length === 0) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    const inq = inquiry[0];

    // Create client from inquiry
    const newClient = await db.insert(clients).values({
      name: inq.name,
      email: inq.email,
      phone: inq.phone || null,
      notes: `Converted from Inquiry for ${inq.service}.${inq.budget ? ` Budget: ${inq.budget}.` : ""} Message: ${inq.message}`,
      status: "active",
    }).returning();

    // Mark contact as converted
    await db.update(contacts).set({ status: "converted" }).where(eq(contacts.id, id));

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "CONVERT_INQUIRY_TO_CLIENT",
        entityType: "contacts",
        entityId: id,
        details: { clientId: newClient[0].id, name: inq.name },
      });
    } catch {}

    return NextResponse.json({ success: true, client: newClient[0] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
