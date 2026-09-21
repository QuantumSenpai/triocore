import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { payments, projects, clients, auditLogs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdminRole } from "@/lib/dal/auth";
import { formatPaise, paiseToRupees } from "@/lib/money";

export async function GET(req: NextRequest) {
  // Finance restricted: requires owner or canViewFinance=true
  const authCheck = await requireAdminRole("finance", req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    if (!db) return NextResponse.json({ payments: [] });

    const allPayments = await db.select().from(payments).orderBy(desc(payments.createdAt));
    const allProjects = await db.select().from(projects);
    const allClients = await db.select().from(clients);

    const enriched = allPayments.map((p) => {
      const proj = allProjects.find((pr) => pr.id === p.projectId);
      const cl = allClients.find((c) => c.id === p.clientId);
      const dateStr = p.receivedDate || (p.createdAt ? new Date(p.createdAt).toISOString() : "");
      return {
        ...p,
        paidAt: dateStr,
        projectName: proj?.title || "Independent",
        clientName: cl?.name || "Direct Client",
        formattedAmount: formatPaise(p.amountPaise),
        amountRupees: paiseToRupees(p.amountPaise),
      };
    });

    const { searchParams } = new URL(req.url);
    if (searchParams.get("format") === "csv") {
      const csvHeader = "ID,Date,Project,Client,Amount(INR),Method,Reference,Status\n";
      const csvRows = enriched
        .map(
          (p) =>
            `"${p.id}","${p.paidAt || ""}","${p.projectName}","${p.clientName}",${p.amountRupees},"${p.method || ""}","${p.reference || ""}","${p.status}"`
        )
        .join("\n");

      return new NextResponse(csvHeader + csvRows, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="triocore-payments.csv"',
        },
      });
    }

    return NextResponse.json({ payments: enriched });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await requireAdminRole("finance", req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { projectId, clientId, amountPaise, method = "UPI", reference, paidAt, notes } = body;

    if (!amountPaise || Number(amountPaise) <= 0) {
      return NextResponse.json({ error: "Valid amountPaise is required" }, { status: 400 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    let targetClientId = clientId;
    if (!targetClientId && projectId) {
      const pr = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
      if (pr.length > 0) targetClientId = pr[0].clientId;
    }
    if (!targetClientId) {
      const defaultClient = await db.select().from(clients).limit(1);
      if (defaultClient.length > 0) {
        targetClientId = defaultClient[0].id;
      } else {
        return NextResponse.json({ error: "Client is required for payment" }, { status: 400 });
      }
    }

    const newPayment = await db.insert(payments).values({
      projectId: projectId || null,
      clientId: targetClientId,
      amountPaise: Number(amountPaise),
      status: "received",
      method,
      reference: reference || null,
      receivedDate: paidAt ? String(paidAt) : new Date().toISOString(),
      notes: notes || null,
    }).returning();

    // Recompute project receivedPaise and pendingPaise
    if (projectId) {
      const projPayments = await db
        .select()
        .from(payments)
        .where(eq(payments.projectId, projectId));
      const totalCollected = projPayments
        .filter((p) => p.status === "received")
        .reduce((sum, p) => sum + p.amountPaise, 0);

      const proj = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
      if (proj.length > 0) {
        const quoted = proj[0].quotedAmountPaise;
        const pending = Math.max(0, quoted - totalCollected);
        await db.update(projects).set({
          receivedPaise: totalCollected,
          pendingPaise: pending,
          updatedAt: new Date(),
        }).where(eq(projects.id, projectId));
      }
    }

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "RECORD_PAYMENT",
        entityType: "payments",
        entityId: newPayment[0].id,
        details: { amountPaise, projectId, clientId },
      });
    } catch {}

    return NextResponse.json({ success: true, payment: newPayment[0] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authCheck = await requireAdminRole("finance", req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing payment ID" }, { status: 400 });
    if (!db) return NextResponse.json({ success: true });

    const existing = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    await db.delete(payments).where(eq(payments.id, id));

    if (existing.length > 0 && existing[0].projectId) {
      const projId = existing[0].projectId;
      const projPayments = await db
        .select()
        .from(payments)
        .where(eq(payments.projectId, projId));
      const totalCollected = projPayments
        .filter((p) => p.status === "received")
        .reduce((sum, p) => sum + p.amountPaise, 0);

      const proj = await db.select().from(projects).where(eq(projects.id, projId)).limit(1);
      if (proj.length > 0) {
        const pending = Math.max(0, proj[0].quotedAmountPaise - totalCollected);
        await db.update(projects).set({
          receivedPaise: totalCollected,
          pendingPaise: pending,
          updatedAt: new Date(),
        }).where(eq(projects.id, projId));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
