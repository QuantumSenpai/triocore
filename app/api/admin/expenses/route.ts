import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { expenses, auditLogs, user, teamMembers, projects } from "@/lib/db/schema";
import { eq, desc, ilike, and } from "drizzle-orm";
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
      allocatedAmountPaise: e.allocatedAmountPaise || 0,
      allocatedAmountRupees: paiseToRupees(e.allocatedAmountPaise || 0),
      formattedAllocatedAmount: formatPaise(e.allocatedAmountPaise || 0),
      memberName: (e.memberId && userMap.get(e.memberId)?.name) || e.paidBy || "Team Member",
      paidAt: e.date || (e.createdAt ? new Date(e.createdAt).toISOString() : ""),
    }));

    if (searchParams.get("format") === "csv") {
      if (typeParam === "personal") {
        const csvHeader = "ID,Date,ProjectName,Member,AllocatedAmount(INR),AmountPaid(INR),AmountLeft(INR),Status,Notes\n";
        const csvRows = enriched
          .map(
            (e) =>
              `"${e.id}","${e.date}","${e.title}","${e.memberName}",${e.allocatedAmountRupees || 0},${e.amountRupees},${e.amountLeftRupees},"${e.isReimbursed ? "Cleared" : "Pending"}","${e.notes || ""}"`
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
      allocatedAmountPaise = 0,
      allowOverpayment = false,
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

    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    // Determine target memberId for personal expenses, resolving team_members.id to user.id if needed
    let targetMemberId: string | null = null;
    if (expenseType === "personal") {
      const candidateId = isFinance ? (memberId || authCheck.user?.id) : authCheck.user?.id;
      if (candidateId) {
        // 1. Direct check if candidateId is a valid user.id
        const userExists = await db.select({ id: user.id }).from(user).where(eq(user.id, candidateId)).limit(1);
        if (userExists.length > 0) {
          targetMemberId = userExists[0].id;
        } else {
          // 2. Check if candidateId is a team_members.id and resolve to user by name
          const tm = await db.select({ name: teamMembers.name }).from(teamMembers).where(eq(teamMembers.id, candidateId)).limit(1);
          if (tm.length > 0) {
            const firstName = tm[0].name.trim().split(" ")[0];
            const matchedUser = await db.select({ id: user.id }).from(user).where(ilike(user.name, `%${firstName}%`)).limit(1);
            if (matchedUser.length > 0) {
              targetMemberId = matchedUser[0].id;
            }
          }
        }
      }
      if (!targetMemberId) {
        targetMemberId = authCheck.user?.id || null;
      }
      if (targetMemberId) {
        const verified = await db.select({ id: user.id }).from(user).where(eq(user.id, targetMemberId)).limit(1);
        if (verified.length === 0) {
          targetMemberId = null;
        }
      }
    }

    // Verify projectId exists in projects table if provided
    let safeProjectId: string | null = null;
    if (projectId && projectId.trim() !== "") {
      const projExists = await db.select({ id: projects.id }).from(projects).where(eq(projects.id, projectId)).limit(1);
      if (projExists.length > 0) {
        safeProjectId = projExists[0].id;
      }
    }

    // Cumulative personal expense balance & overpayment prevention logic
    let calculatedAmountLeftPaise = amountLeftPaise ?? 0;
    let finalAllocatedAmountPaise = allocatedAmountPaise ?? 0;
    let finalIsReimbursed = isFinance ? isReimbursed : false;

    if (expenseType === "personal" && targetMemberId) {
      const memberPersonalExpenses = await db
        .select()
        .from(expenses)
        .where(and(eq(expenses.expenseType, "personal"), eq(expenses.memberId, targetMemberId)));

      const priorForProject = memberPersonalExpenses.filter((e) => {
        if (safeProjectId && e.projectId === safeProjectId) return true;
        if (e.title && e.title.trim().toLowerCase() === title.trim().toLowerCase()) return true;
        return false;
      });

      const totalPreviouslyPaid = priorForProject.reduce((sum, e) => sum + e.amountPaise, 0);
      const totalPaidNow = totalPreviouslyPaid + amountPaise;

      if (finalAllocatedAmountPaise <= 0) {
        const priorWithAlloc = priorForProject.find((e) => (e.allocatedAmountPaise || 0) > 0);
        if (priorWithAlloc) {
          finalAllocatedAmountPaise = priorWithAlloc.allocatedAmountPaise || 0;
        }
      }

      if (finalAllocatedAmountPaise > 0) {
        // Prevent accidental overpayment unless explicitly authorized by admin
        if (totalPaidNow > finalAllocatedAmountPaise && !allowOverpayment) {
          return NextResponse.json(
            {
              error: `Payment of ${formatPaise(amountPaise)} would bring total paid to ${formatPaise(totalPaidNow)}, exceeding member's allocated budget of ${formatPaise(finalAllocatedAmountPaise)}. Overpayment requires authorized admin override.`,
              allocatedPaise: finalAllocatedAmountPaise,
              totalPaidPaise: totalPaidNow,
              excessPaise: totalPaidNow - finalAllocatedAmountPaise,
            },
            { status: 400 }
          );
        }

        calculatedAmountLeftPaise = Math.max(0, finalAllocatedAmountPaise - totalPaidNow);
        finalIsReimbursed = isFinance ? (isReimbursed || calculatedAmountLeftPaise === 0) : calculatedAmountLeftPaise === 0;
      }
    }

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
        isReimbursed: finalIsReimbursed,
        amountLeftPaise: calculatedAmountLeftPaise,
        allocatedAmountPaise: finalAllocatedAmountPaise,
        isSample: false,
      })
      .returning();

    try {
      await db.insert(auditLogs).values({
        userId: authCheck.user?.id || null,
        action: "RECORD_EXPENSE",
        entityType: "expenses",
        entityId: newExpense[0].id,
        details: { category: newExpense[0].category, amountPaise, amountLeftPaise: calculatedAmountLeftPaise, allocatedAmountPaise: finalAllocatedAmountPaise, expenseType, memberId: targetMemberId },
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
      allocatedAmountPaise,
      allowOverpayment = false,
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

    let safeProjectId: string | null = existing.projectId;
    if (projectId !== undefined) {
      if (!projectId || projectId.trim() === "") {
        safeProjectId = null;
      } else {
        const projExists = await db.select({ id: projects.id }).from(projects).where(eq(projects.id, projectId)).limit(1);
        safeProjectId = projExists.length > 0 ? projExists[0].id : null;
      }
    }

    let safeMemberId: string | null = null;
    if (isPersonal) {
      const candidateId = memberId !== undefined ? memberId : existing.memberId;
      if (candidateId) {
        const userExists = await db.select({ id: user.id }).from(user).where(eq(user.id, candidateId)).limit(1);
        if (userExists.length > 0) {
          safeMemberId = userExists[0].id;
        } else {
          const tm = await db.select({ name: teamMembers.name }).from(teamMembers).where(eq(teamMembers.id, candidateId)).limit(1);
          if (tm.length > 0) {
            const firstName = tm[0].name.trim().split(" ")[0];
            const matchedUser = await db.select({ id: user.id }).from(user).where(ilike(user.name, `%${firstName}%`)).limit(1);
            if (matchedUser.length > 0) {
              safeMemberId = matchedUser[0].id;
            }
          }
        }
      }
      if (!safeMemberId) {
        safeMemberId = existing.memberId;
      }
      if (safeMemberId) {
        const verified = await db.select({ id: user.id }).from(user).where(eq(user.id, safeMemberId)).limit(1);
        if (verified.length === 0) {
          safeMemberId = null;
        }
      }
    }

    let finalAllocatedPaise = allocatedAmountPaise !== undefined ? allocatedAmountPaise : (existing.allocatedAmountPaise || 0);
    let finalAmountLeftPaise = amountLeftPaise !== undefined ? amountLeftPaise : existing.amountLeftPaise;
    let finalIsReimbursed = isReimbursed !== undefined ? isReimbursed : existing.isReimbursed;

    if (isPersonal && safeMemberId) {
      const targetTitle = title !== undefined ? title : existing.title;
      const effectiveAmountPaise = amountPaise !== undefined ? amountPaise : existing.amountPaise;

      const memberPersonalExpenses = await db
        .select()
        .from(expenses)
        .where(and(eq(expenses.expenseType, "personal"), eq(expenses.memberId, safeMemberId)));

      const otherExpensesForProject = memberPersonalExpenses.filter((e) => {
        if (e.id === id) return false;
        if (safeProjectId && e.projectId === safeProjectId) return true;
        if (e.title && e.title.trim().toLowerCase() === targetTitle.trim().toLowerCase()) return true;
        return false;
      });

      const totalPreviouslyPaidOther = otherExpensesForProject.reduce((sum, e) => sum + e.amountPaise, 0);
      const totalPaidNow = totalPreviouslyPaidOther + effectiveAmountPaise;

      if (finalAllocatedPaise <= 0) {
        const priorWithAlloc = otherExpensesForProject.find((e) => (e.allocatedAmountPaise || 0) > 0);
        if (priorWithAlloc) {
          finalAllocatedPaise = priorWithAlloc.allocatedAmountPaise || 0;
        }
      }

      if (finalAllocatedPaise > 0) {
        if (totalPaidNow > finalAllocatedPaise && !allowOverpayment) {
          return NextResponse.json(
            {
              error: `Updated payment of ${formatPaise(effectiveAmountPaise)} would bring total paid to ${formatPaise(totalPaidNow)}, exceeding member's allocated budget of ${formatPaise(finalAllocatedPaise)}. Overpayment requires authorized admin override.`,
              allocatedPaise: finalAllocatedPaise,
              totalPaidPaise: totalPaidNow,
              excessPaise: totalPaidNow - finalAllocatedPaise,
            },
            { status: 400 }
          );
        }

        finalAmountLeftPaise = Math.max(0, finalAllocatedPaise - totalPaidNow);
        finalIsReimbursed = isFinance ? (isReimbursed !== undefined ? isReimbursed : finalAmountLeftPaise === 0) : finalAmountLeftPaise === 0;
      }
    }

    const updated = await db
      .update(expenses)
      .set({
        title: title !== undefined ? title : existing.title,
        category: finalCategory,
        amountPaise: amountPaise !== undefined ? amountPaise : existing.amountPaise,
        amountLeftPaise: finalAmountLeftPaise,
        allocatedAmountPaise: finalAllocatedPaise,
        date: date !== undefined ? date : existing.date,
        paidBy: paidBy !== undefined ? (paidBy?.trim() || null) : existing.paidBy,
        projectId: safeProjectId,
        notes: notes !== undefined ? (notes?.trim() || null) : existing.notes,
        expenseType: expenseType !== undefined ? expenseType : existing.expenseType,
        memberId: safeMemberId,
        isReimbursed: finalIsReimbursed,
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
          old: { amountPaise: existing.amountPaise, amountLeftPaise: existing.amountLeftPaise, allocatedAmountPaise: existing.allocatedAmountPaise, isReimbursed: existing.isReimbursed },
          new: { amountPaise, amountLeftPaise: finalAmountLeftPaise, allocatedAmountPaise: finalAllocatedPaise, isReimbursed: finalIsReimbursed },
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
