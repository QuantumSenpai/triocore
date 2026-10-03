import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { bills, auditLogs } from "@/lib/db/schema";
import { verifyAdminSession } from "@/lib/auth-guard";
import { eq, desc, ilike, or, sql } from "drizzle-orm";

const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amountPaise: z.number().int().min(0, "Amount must be positive"),
});

const createBillSchema = z.object({
  orderId: z.string().optional(),
  clientId: z.string().min(1, "Client ID is required"),
  projectId: z.string().nullable().optional(),
  clientName: z.string().nullable().optional(),
  projectName: z.string().nullable().optional(),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
  subtotalPaise: z.number().int().min(0),
  discountPaise: z.number().int().min(0).default(0),
  totalPaise: z.number().int().min(0),
  issuedDate: z.string().min(1, "Issue date is required"),
  status: z.enum(["draft", "final", "void"]).default("final"),
  notes: z.string().nullable().optional(),
});

const updateBillSchema = z.object({
  id: z.string().min(1, "Bill ID is required"),
  status: z.enum(["draft", "final", "void"]).optional(),
  notes: z.string().nullable().optional(),
  lineItems: z.array(lineItemSchema).optional(),
  subtotalPaise: z.number().int().optional(),
  discountPaise: z.number().int().optional(),
  totalPaise: z.number().int().optional(),
});

export async function GET(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    if (!db) return NextResponse.json({ bills: [] });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const search = searchParams.get("search");

    if (id) {
      const [bill] = await db
        .select()
        .from(bills)
        .where(eq(bills.id, id))
        .limit(1);

      if (!bill) {
        return NextResponse.json({ error: "Bill not found" }, { status: 404 });
      }
      return NextResponse.json({ bill });
    }

    let query = db.select().from(bills).orderBy(desc(bills.createdAt));

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      const filtered = await db
        .select()
        .from(bills)
        .where(
          or(
            ilike(bills.orderId, term),
            ilike(bills.clientName, term),
            ilike(bills.projectName, term)
          )
        )
        .orderBy(desc(bills.createdAt));
      return NextResponse.json({ bills: filtered });
    }

    const allBills = await query;
    return NextResponse.json({ bills: allBills });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const json = await req.json();
    const parseResult = createBillSchema.safeParse(json);
    if (!parseResult.success) {
      console.error("[bills route] Validation failed:", JSON.stringify(parseResult.error.flatten()), "Payload:", JSON.stringify(json));
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Auto-generate order ID if not provided
    let finalOrderId = data.orderId?.trim();
    if (!finalOrderId) {
      const [countResult] = await db.select({ count: sql<number>`count(*)::int` }).from(bills);
      const nextNum = (countResult?.count || 0) + 1001;
      finalOrderId = `TC-B${nextNum}`;
    }

    const [createdBill] = await db
      .insert(bills)
      .values({
        orderId: finalOrderId,
        clientId: data.clientId,
        projectId: data.projectId || null,
        clientName: data.clientName || null,
        projectName: data.projectName || null,
        lineItems: data.lineItems,
        subtotalPaise: data.subtotalPaise,
        discountPaise: data.discountPaise || 0,
        totalPaise: data.totalPaise,
        issuedDate: data.issuedDate,
        status: data.status,
        notes: data.notes || null,
        createdBy: authCheck.user?.email || "admin",
      })
      .returning();

    // Audit log entry
    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "CREATE_BILL",
        entityType: "bills",
        entityId: createdBill.id,
        details: createdBill,
      });
    } catch (auditErr) {
      console.error("Failed to write audit log for bill creation:", auditErr);
    }

    return NextResponse.json({ success: true, bill: createdBill });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const json = await req.json();
    const parseResult = updateBillSchema.safeParse(json);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { id, ...updates } = parseResult.data;

    const [existing] = await db.select().from(bills).where(eq(bills.id, id)).limit(1);
    if (!existing) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    const [updated] = await db
      .update(bills)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(bills.id, id))
      .returning();

    // Audit log
    const action = updates.status === "void" ? "VOID_BILL" : "UPDATE_BILL";
    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action,
        entityType: "bills",
        entityId: id,
        details: { before: existing, after: updated },
      });
    } catch (auditErr) {
      console.error("Failed to write audit log for bill update:", auditErr);
    }

    return NextResponse.json({ success: true, bill: updated });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const authCheck = await verifyAdminSession(req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    let id = req.nextUrl.searchParams.get("id");
    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {
        // empty body
      }
    }
    if (!id) return NextResponse.json({ error: "Bill ID is required" }, { status: 400 });

    const [existing] = await db.select().from(bills).where(eq(bills.id, id)).limit(1);
    if (!existing) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    if (existing.status === "final") {
      return NextResponse.json(
        { error: "Finalized bills cannot be deleted for audit reasons. Please mark as void instead." },
        { status: 400 }
      );
    }

    await db.delete(bills).where(eq(bills.id, id));

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "DELETE_DRAFT_BILL",
        entityType: "bills",
        entityId: id,
        details: existing,
      });
    } catch (auditErr) {
      console.error("Failed to write audit log for bill deletion:", auditErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
