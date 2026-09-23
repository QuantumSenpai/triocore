import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { expenses, auditLogs, user } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/dal/auth";
import { formatPaise, paiseToRupees } from "@/lib/money";
import { expenseCreateSchema, expenseEditSchema } from "@/lib/validations/crm";

export async function GET(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (!authCheck.authorized) return authCheck.response!;

  const isFinance = authCheck.user?.role === "owner" || authCheck.user?.canViewFinance;

  try {
    if (!db) return NextResponse.json({ expenses: [] });

    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get("type"); // "studio" | "personal"
    const memberIdParam = searchParams.get("memberId");

    // Studio expenses require finance permission
    if (typeParam === "studio" && !isFinance) {
      return NextResponse.json(
        { error: "Forbidden: Studio financial records require financial permission." },
        { status: 403 }
      );
    }

    const data = await db.select().from(expenses).orderBy(desc(expenses.createdAt));
    const allUsers = await db.select({ id: user.id, name: user.name, email: user.email }).from(user);
    const userMap = new Map(allUsers.map((u) => [u.id, u]));

    let filtered = data;

    if (typeParam === "studio") {
      filtered = data.filter((e) => (e.expenseType || "studio") === "studio");
    } else if (typeParam === "personal") {
      if (!isFinance) {
        // Regular members only see their own personal expenses
        filtered = data.filter(
          (e) => e.expenseType === "personal" && e.memberId === authCheck.user?.id
        );
      } else {
        // Owner/Finance sees all personal expenses, or filtered by memberId
        filtered = data.filter((e) => {
          if (e.expenseType !== "personal") return false;
          if (memberIdParam) return e.memberId === memberIdParam;
          return true;
        });
      }
    } else {
      // No type specified
      if (!isFinance) {
        filtered = data.filter(
          (e) => e.expenseType === "personal" && e.memberId === authCheck.user?.id
        );
      }
    }

    const enriched = filtered.map((e) => ({
      ...e,
      formattedAmount: formatPaise(e.amountPaise),
      amountRupees: paiseToRupees(e.amountPaise),
      amountLeftPaise: e.amountLeftPaise || 0,
      amountLeftRupees: paiseToRupees(e.amountLeftPaise || 0),
      formattedAmountLeft: formatPaise(e.amountLeftPaise || 0),
      memberName: (e.memberId && userMap.get(e.memberId)?.name) || e.paidBy || "Team Member",
      paidAt: e.date || (e.createdAt ? new Date(e.createdAt).toISOString() : ""),
    }));

    if (searchParams.get("format") === "csv") {
      if (typeParam === "personal") {
        const csvHeader = "ID,Date,ProjectName,Member,TotalAmount(INR),AmountLeft(INR),Reimbursed,Notes\n";
        const csvRows = enriched
          .map(
            (e) =>
              `"${e.id}","${e.date}","${e.title}","${e.memberName}",${e.amountRupees},${e.amountLeftRupees},"${e.isReimbursed ? "Yes" : "No"}","${e.notes || ""}"`
          )
          .join("\n");
        return new NextResponse(csvHeader + csvRows, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="triocore-personal-expenses.csv"',
          },
        });
      } else {
        const csvHeader = "ID,Date,Category,Title,Amount(INR),PaidBy,Notes\n";
        const csvRows = enriched
          .map(
            (e) =>
              `"${e.id}","${e.date}","${e.category}","${e.title}",${e.amountRupees},"${e.paidBy || ""}","${e.notes || ""}"`
          )
          .join("\n");
        return new NextResponse(csvHeader + csvRows, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="triocore-studio-expenses.csv"',
          },
        });
      }
    }

    return NextResponse.json({ expenses: enriched });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (!authCheck.authorized) return authCheck.response!;

  const isFinance = authCheck.user?.role === "owner" || authCheck.user?.canViewFinance;

  try {
    const body = await req.json();
    const parseResult = expenseCreateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid expense data" },
        { status: 400 }
      );
    }

    const {
      title,
      category,
      amountPaise,
      amountLeftPaise = 0,
      date,
      paidBy,
      projectId,
      notes,
      expenseType = "studio",
      memberId,
      isReimbursed = false,
    } = parseResult.data;

    // Studio expenses require finance permission
    if (expenseType === "studio" && !isFinance) {
      return NextResponse.json(
        { error: "Forbidden: Recording studio expenses requires finance permission." },
        { status: 403 }
      );
    }

    // Determine target memberId for personal expenses
    let targetMemberId = memberId || null;
    if (expenseType === "personal") {
      if (!isFinance) {
        targetMemberId = authCheck.user?.id || null;
      } else if (!targetMemberId) {
        targetMemberId = authCheck.user?.id || null;
      }
    } else {
      targetMemberId = null;
    }

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    // Personal expenses store project name in title; projectId foreign key must be null
    const safeProjectId = expenseType === "personal" ? null : (projectId?.trim() || null);

    const newExpense = await db
      .insert(expenses)
      .values({
        id: crypto.randomUUID(),
        title,
        amountPaise,
        category: expenseType === "personal" ? "personal" : (category || "tools"),
        date: date || new Date().toISOString().slice(0, 10),
        paidBy: paidBy?.trim() || authCheck.user?.name || authCheck.user?.email || "admin",
        projectId: safeProjectId,
        notes: notes?.trim() || null,
        expenseType,
        memberId: targetMemberId,
        isReimbursed: isFinance ? isReimbursed : false,
        amountLeftPaise: expenseType === "personal" ? (amountLeftPaise ?? 0) : 0,
        isSample: false,
      })
      .returning();

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "RECORD_EXPENSE",
        entityType: "expenses",
        entityId: newExpense[0].id,
        details: { category: newExpense[0].category, amountPaise, amountLeftPaise, expenseType, memberId: targetMemberId },
      });
    } catch {}

    return NextResponse.json({ success: true, expense: newExpense[0] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (!authCheck.authorized) return authCheck.response!;

  const isFinance = authCheck.user?.role === "owner" || authCheck.user?.canViewFinance;

  try {
    const body = await req.json();
    const parseResult = expenseEditSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Invalid expense data" },
        { status: 400 }
      );
    }

    const {
      id,
      title,
      category,
      amountPaise,
      amountLeftPaise,
      date,
      paidBy,
      projectId,
      notes,
      expenseType,
      memberId,
      isReimbursed,
    } = parseResult.data;

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const existingRows = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1);
    if (existingRows.length === 0) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }
    const existing = existingRows[0];

    // Authorization checks
    if ((existing.expenseType || "studio") === "studio" && !isFinance) {
      return NextResponse.json(
        { error: "Forbidden: Editing studio expenses requires finance permission." },
        { status: 403 }
      );
    }

    if (existing.expenseType === "personal" && !isFinance && existing.memberId !== authCheck.user?.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only edit your own personal expenses." },
        { status: 403 }
      );
    }

    // Only finance/owner can modify isReimbursed status
    if (isReimbursed !== undefined && isReimbursed !== existing.isReimbursed && !isFinance) {
      return NextResponse.json(
        { error: "Forbidden: Only financial administrators can mark expenses as reimbursed." },
        { status: 403 }
      );
    }

    const isPersonal = (expenseType || existing.expenseType) === "personal";

    const finalCategory = isPersonal
      ? (category || existing.category || "personal")
      : (category !== undefined ? category : existing.category);

    const safeProjectId = isPersonal
      ? null
      : projectId !== undefined
      ? (projectId?.trim() || null)
      : existing.projectId;

    const safeMemberId = isPersonal
      ? (memberId !== undefined ? (memberId?.trim() || null) : existing.memberId)
      : null;

    const updated = await db
      .update(expenses)
      .set({
        title: title !== undefined ? title : existing.title,
        category: finalCategory,
        amountPaise: amountPaise !== undefined ? amountPaise : existing.amountPaise,
        amountLeftPaise: amountLeftPaise !== undefined ? amountLeftPaise : existing.amountLeftPaise,
        date: date !== undefined ? date : existing.date,
        paidBy: paidBy !== undefined ? (paidBy?.trim() || null) : existing.paidBy,
        projectId: safeProjectId,
        notes: notes !== undefined ? (notes?.trim() || null) : existing.notes,
        expenseType: expenseType !== undefined ? expenseType : existing.expenseType,
        memberId: safeMemberId,
        isReimbursed: isReimbursed !== undefined ? isReimbursed : existing.isReimbursed,
        updatedAt: new Date(),
      })
      .where(eq(expenses.id, id))
      .returning();

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "UPDATE_EXPENSE",
        entityType: "expenses",
        entityId: id,
        details: {
          old: { amountPaise: existing.amountPaise, amountLeftPaise: existing.amountLeftPaise, isReimbursed: existing.isReimbursed },
          new: { amountPaise, amountLeftPaise, isReimbursed },
        },
      });
    } catch {}

    return NextResponse.json({ success: true, expense: updated[0] });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (!authCheck.authorized) return authCheck.response!;

  const isFinance = authCheck.user?.role === "owner" || authCheck.user?.canViewFinance;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing expense ID" }, { status: 400 });
    if (!db) return NextResponse.json({ success: true });

    const existingRows = await db.select().from(expenses).where(eq(expenses.id, id)).limit(1);
    if (existingRows.length === 0) {
      return NextResponse.json({ success: true });
    }
    const existing = existingRows[0];

    // Authorization checks
    if ((existing.expenseType || "studio") === "studio" && !isFinance) {
      return NextResponse.json(
        { error: "Forbidden: Deleting studio expenses requires finance permission." },
        { status: 403 }
      );
    }

    if (existing.expenseType === "personal" && !isFinance && existing.memberId !== authCheck.user?.id) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own personal expenses." },
        { status: 403 }
      );
    }

    await db.delete(expenses).where(eq(expenses.id, id));

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "DELETE_EXPENSE",
        entityType: "expenses",
        entityId: id,
        details: {
          title: existing.title,
          amountPaise: existing.amountPaise,
          expenseType: existing.expenseType,
        },
      });
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
