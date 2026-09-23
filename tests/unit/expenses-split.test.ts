import { describe, it, expect } from "vitest";

interface ExpenseItem {
  id: string;
  amountPaise: number;
  expenseType: "studio" | "personal";
  memberId?: string | null;
  isReimbursed?: boolean;
}

function calculateFinancials(totalEarnedPaise: number, expenses: ExpenseItem[]) {
  const studioExpensesPaise = expenses
    .filter((e) => e.expenseType === "studio")
    .reduce((sum, e) => sum + e.amountPaise, 0);

  const personalExpenses = expenses.filter((e) => e.expenseType === "personal");

  const unreimbursedPaise = personalExpenses
    .filter((e) => !e.isReimbursed)
    .reduce((sum, e) => sum + e.amountPaise, 0);

  const reimbursedPaise = personalExpenses
    .filter((e) => !!e.isReimbursed)
    .reduce((sum, e) => sum + e.amountPaise, 0);

  const netStudioProfitPaise = totalEarnedPaise - studioExpensesPaise;

  return {
    studioExpensesPaise,
    netStudioProfitPaise,
    unreimbursedPaise,
    reimbursedPaise,
  };
}

function calculateMemberBalances(memberId: string, expenses: ExpenseItem[]) {
  const memberExpenses = expenses.filter(
    (e) => e.expenseType === "personal" && e.memberId === memberId
  );

  const pendingReimbursement = memberExpenses
    .filter((e) => !e.isReimbursed)
    .reduce((sum, e) => sum + e.amountPaise, 0);

  const clearedReimbursement = memberExpenses
    .filter((e) => !!e.isReimbursed)
    .reduce((sum, e) => sum + e.amountPaise, 0);

  return {
    totalSubmissions: memberExpenses.length,
    pendingReimbursement,
    clearedReimbursement,
  };
}

describe("Expenses Split & Reimbursement Tracker Logic", () => {
  const totalEarnedPaise = 20000000; // ₹2,00,000

  it("calculates Net Studio Profit deducting ONLY studio expenses and ignoring personal expenses", () => {
    const expenses: ExpenseItem[] = [
      { id: "e1", amountPaise: 3000000, expenseType: "studio" }, // ₹30,000 hosting
      { id: "e2", amountPaise: 2000000, expenseType: "studio" }, // ₹20,000 SaaS
      { id: "e3", amountPaise: 1500000, expenseType: "personal", memberId: "m1", isReimbursed: false }, // ₹15,000 flight
    ];

    const { studioExpensesPaise, netStudioProfitPaise, unreimbursedPaise, reimbursedPaise } =
      calculateFinancials(totalEarnedPaise, expenses);

    expect(studioExpensesPaise).toBe(5000000); // ₹50,000
    expect(netStudioProfitPaise).toBe(15000000); // ₹1,50,000 (Earned ₹2,00,000 - Studio ₹50,000)
    expect(unreimbursedPaise).toBe(1500000); // ₹15,000
    expect(reimbursedPaise).toBe(0);
  });

  it("updates reimbursement balances when an expense is marked as reimbursed", () => {
    let expenses: ExpenseItem[] = [
      { id: "e1", amountPaise: 1000000, expenseType: "personal", memberId: "m1", isReimbursed: false },
      { id: "e2", amountPaise: 2500000, expenseType: "personal", memberId: "m2", isReimbursed: false },
    ];

    let { unreimbursedPaise, reimbursedPaise } = calculateFinancials(totalEarnedPaise, expenses);
    expect(unreimbursedPaise).toBe(3500000);
    expect(reimbursedPaise).toBe(0);

    // Mark e1 as reimbursed
    expenses = expenses.map((e) => (e.id === "e1" ? { ...e, isReimbursed: true } : e));

    const updated = calculateFinancials(totalEarnedPaise, expenses);
    expect(updated.unreimbursedPaise).toBe(2500000); // e2
    expect(updated.reimbursedPaise).toBe(1000000); // e1
  });

  it("calculates per-member breakdown balances accurately", () => {
    const expenses: ExpenseItem[] = [
      { id: "e1", amountPaise: 1000000, expenseType: "personal", memberId: "m1", isReimbursed: true },
      { id: "e2", amountPaise: 1500000, expenseType: "personal", memberId: "m1", isReimbursed: false },
      { id: "e3", amountPaise: 4000000, expenseType: "personal", memberId: "m2", isReimbursed: false },
    ];

    const m1Balances = calculateMemberBalances("m1", expenses);
    expect(m1Balances.totalSubmissions).toBe(2);
    expect(m1Balances.clearedReimbursement).toBe(1000000);
    expect(m1Balances.pendingReimbursement).toBe(1500000);

    const m2Balances = calculateMemberBalances("m2", expenses);
    expect(m2Balances.totalSubmissions).toBe(1);
    expect(m2Balances.clearedReimbursement).toBe(0);
    expect(m2Balances.pendingReimbursement).toBe(4000000);
  });

  it("validates personal expense creation without category and with amountLeftPaise", async () => {
    const { expenseCreateSchema } = await import("@/lib/validations/crm");

    // Personal expense without Category provided: valid, category defaults to 'personal'
    const personalRes = expenseCreateSchema.safeParse({
      title: "Mobile App Client Redesign",
      amountPaise: 500000, // ₹5,000
      amountLeftPaise: 200000, // ₹2,000 still owed
      date: "2026-09-23",
      expenseType: "personal",
      memberId: "user-123",
    });
    expect(personalRes.success).toBe(true);
    if (personalRes.success) {
      expect(personalRes.data.category).toBe("personal");
      expect(personalRes.data.amountLeftPaise).toBe(200000);
    }

    // Studio expense without Category: must fail validation
    const studioRes = expenseCreateSchema.safeParse({
      title: "Server Hosting",
      amountPaise: 1000000,
      date: "2026-09-23",
      expenseType: "studio",
      category: "",
    });
    expect(studioRes.success).toBe(false);
  });

  it("transforms empty strings or whitespace for projectId and memberId to null", async () => {
    const { expenseCreateSchema, expenseEditSchema } = await import("@/lib/validations/crm");

    // Create schema with empty string projectId
    const createRes = expenseCreateSchema.safeParse({
      title: "Saathi Project",
      amountPaise: 200000,
      amountLeftPaise: 50000,
      date: "2026-09-23",
      expenseType: "personal",
      memberId: "user-123",
      projectId: "",
    });
    expect(createRes.success).toBe(true);
    if (createRes.success) {
      expect(createRes.data.projectId).toBe(null);
    }

    // Edit schema with whitespace or empty projectId
    const editRes = expenseEditSchema.safeParse({
      id: "exp-1",
      projectId: "   ",
    });
    expect(editRes.success).toBe(true);
    if (editRes.success) {
      expect(editRes.data.projectId).toBe(null);
    }

    // Edit schema with omitted projectId stays undefined
    const editOmitted = expenseEditSchema.safeParse({
      id: "exp-1",
      title: "Updated Title",
    });
    expect(editOmitted.success).toBe(true);
    if (editOmitted.success) {
      expect(editOmitted.data.projectId).toBe(undefined);
    }
  });
});

