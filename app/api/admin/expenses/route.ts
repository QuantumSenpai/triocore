import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { expenses, auditLogs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdminRole } from "@/lib/dal/auth";
import { formatPaise, paiseToRupees } from "@/lib/money";

export async function GET(req: NextRequest) {
  const authCheck = await requireAdminRole("finance", req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    if (!db) return NextResponse.json({ expenses: [] });
    const data = await db.select().from(expenses).orderBy(desc(expenses.createdAt));
    const enriched = data.map((e) => ({
      ...e,
      formattedAmount: formatPaise(e.amountPaise),
      amountRupees: paiseToRupees(e.amountPaise),
    }));
    return NextResponse.json({ expenses: enriched });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await requireAdminRole("finance", req);
  if (!authCheck.authorized) return authCheck.response!;

  try {
    const body = await req.json();
    const { category, amountPaise, description, title, date, paidBy, projectId } = body;

    const expenseTitle = title || description;
    if (!category || !amountPaise || !expenseTitle) {
      return NextResponse.json({ error: "Category, amountPaise, and title are required" }, { status: 400 });
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const newExpense = await db.insert(expenses).values({
      title: expenseTitle,
      category,
      amountPaise: Number(amountPaise),
      date: date || new Date().toISOString().slice(0, 10),
      paidBy: paidBy || authCheck.user?.email || "admin",
      projectId: projectId || null,
      notes: description || null,
    }).returning();

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "RECORD_EXPENSE",
        entityType: "expenses",
        entityId: newExpense[0].id,
        details: { category, amountPaise },
      });
    } catch {}

    return NextResponse.json({ success: true, expense: newExpense[0] });
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

    if (!id) return NextResponse.json({ error: "Missing expense ID" }, { status: 400 });
    if (!db) return NextResponse.json({ success: true });

    await db.delete(expenses).where(eq(expenses.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
