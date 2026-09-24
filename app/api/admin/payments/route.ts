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

    const [allPayments, allProjects, allClients] = await Promise.all([
      db.select().from(payments).orderBy(desc(payments.createdAt)),
      db.select().from(projects),
      db.select().from(clients),
    ]);

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
      await syncProjectFinancials(projectId);
    }

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "RECORD_PAYMENT",
        entityType: "payments",
        entityId: newPayment[0].id,
        details: { amountPaise, projectId, clientId: targetClientId },
      });
    } catch {}

    return NextResponse.json({ success: true, payment: newPayment[0] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authCheck = await requireAdminRole("finance", req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { paymentEditSchema } = await import("@/lib/validations/crm");
    const parseResult = paymentEditSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid payment data" },
        { status: 400 }
      );
    }

    const { id, amountPaise, method, receivedDate, reference, projectId, clientId, status, notes } = parseResult.data;

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const existingRows = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    if (existingRows.length === 0) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }
    const existing = existingRows[0];

    // Safety guard: Prevent any update that makes a project's earned total negative
    if (existing.projectId && existing.status === "received") {
      const proj = await db.select().from(projects).where(eq(projects.id, existing.projectId)).limit(1);
      if (proj.length > 0) {
        const otherPayments = await db
          .select()
          .from(payments)
          .where(eq(payments.projectId, existing.projectId));
        const otherReceived = otherPayments
          .filter((p) => p.id !== id && p.status === "received")
          .reduce((sum, p) => sum + p.amountPaise, 0);

        const newReceivedForOldProject =
          existing.projectId === (projectId || null)
            ? otherReceived + (status === "received" ? amountPaise : 0)
            : otherReceived;

        if (newReceivedForOldProject < 0) {
          return NextResponse.json(
            { error: "Cannot update payment: project earned amount would become negative." },
            { status: 400 }
          );
        }
      }
    }

    // If projectId is provided but clientId is not, resolve clientId from project
    let targetClientId = clientId || existing.clientId;
    if (projectId && (!targetClientId || projectId !== existing.projectId)) {
      const pr = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
      if (pr.length > 0) targetClientId = pr[0].clientId;
    }

    const updated = await db
      .update(payments)
      .set({
        amountPaise,
        method,
        receivedDate: receivedDate || existing.receivedDate,
        reference: reference !== undefined ? reference : existing.reference,
        projectId: projectId !== undefined ? projectId : existing.projectId,
        clientId: targetClientId,
        status,
        notes: notes !== undefined ? notes : existing.notes,
      })
      .where(eq(payments.id, id))
      .returning();

    // Recalculate financials for affected projects
    if (existing.projectId) {
      await syncProjectFinancials(existing.projectId);
    }
    if (projectId && projectId !== existing.projectId) {
      await syncProjectFinancials(projectId);
    }

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "UPDATE_PAYMENT",
        entityType: "payments",
        entityId: id,
        details: {
          old: {
            amountPaise: existing.amountPaise,
            status: existing.status,
            projectId: existing.projectId,
          },
          new: {
            amountPaise,
            status,
            projectId,
          },
        },
      });
    } catch {}

    return NextResponse.json({ success: true, payment: updated[0] });
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
    if (existing.length === 0) {
      return NextResponse.json({ success: true });
    }
    const payment = existing[0];

    // Safety guard: ensure delete does not cause project earned amount to become negative
    if (payment.projectId && payment.status === "received") {
      const proj = await db.select().from(projects).where(eq(projects.id, payment.projectId)).limit(1);
      if (proj.length > 0) {
        const otherPayments = await db
          .select()
          .from(payments)
          .where(eq(payments.projectId, payment.projectId));
        const remainingReceived = otherPayments
          .filter((p) => p.id !== id && p.status === "received")
          .reduce((sum, p) => sum + p.amountPaise, 0);

        if (remainingReceived < 0) {
          return NextResponse.json(
            { error: "Cannot delete payment: project earned amount would become negative." },
            { status: 400 }
          );
        }
      }
    }

    await db.delete(payments).where(eq(payments.id, id));

    if (payment.projectId) {
      await syncProjectFinancials(payment.projectId);
    }

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "DELETE_PAYMENT",
        entityType: "payments",
        entityId: id,
        details: {
          amountPaise: payment.amountPaise,
          projectId: payment.projectId,
          status: payment.status,
        },
      });
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

async function syncProjectFinancials(projectId: string) {
  if (!db || !projectId) return;
  try {
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
      await db
        .update(projects)
        .set({
          receivedPaise: Math.max(0, totalCollected),
          pendingPaise: pending,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, projectId));
    }
  } catch {}
}
