import { describe, it, expect } from "vitest";

function recalculateProjectFinancials(
  quotedPaise: number,
  projectPayments: { id: string; amountPaise: number; status: "received" | "pending" | "overdue" }[]
) {
  const receivedPaise = projectPayments
    .filter((p) => p.status === "received")
    .reduce((sum, p) => sum + p.amountPaise, 0);

  const pendingPaise = Math.max(0, quotedPaise - receivedPaise);

  return {
    quotedPaise,
    receivedPaise: Math.max(0, receivedPaise),
    pendingPaise,
  };
}

function canDeletePayment(
  projectPayments: { id: string; amountPaise: number; status: "received" | "pending" | "overdue" }[],
  paymentIdToDelete: string
): { allowed: boolean; error?: string } {
  const target = projectPayments.find((p) => p.id === paymentIdToDelete);
  if (!target) return { allowed: true };

  if (target.status === "received") {
    const remaining = projectPayments
      .filter((p) => p.id !== paymentIdToDelete && p.status === "received")
      .reduce((sum, p) => sum + p.amountPaise, 0);

    if (remaining < 0) {
      return { allowed: false, error: "Cannot delete payment: project earned amount would become negative." };
    }
  }

  return { allowed: true };
}

describe("Payments Ledger Financial Logic", () => {
  const quotedPaise = 10000000; // ₹1,00,000

  it("calculates initial received and pending correctly", () => {
    const payments = [
      { id: "1", amountPaise: 4000000, status: "received" as const },
      { id: "2", amountPaise: 2000000, status: "pending" as const },
    ];

    const financials = recalculateProjectFinancials(quotedPaise, payments);
    expect(financials.receivedPaise).toBe(4000000); // ₹40,000
    expect(financials.pendingPaise).toBe(6000000); // ₹60,000
  });

  it("updates earned and pending when a payment is edited from pending to received", () => {
    let payments = [
      { id: "1", amountPaise: 4000000, status: "received" as const },
      { id: "2", amountPaise: 2000000, status: "pending" as const },
    ];

    // Edit payment 2 to received
    payments = payments.map((p) => (p.id === "2" ? { ...p, status: "received" as const } : p));

    const financials = recalculateProjectFinancials(quotedPaise, payments);
    expect(financials.receivedPaise).toBe(6000000); // ₹60,000
    expect(financials.pendingPaise).toBe(4000000); // ₹40,000
  });

  it("updates earned and pending when a received payment is deleted", () => {
    let payments = [
      { id: "1", amountPaise: 4000000, status: "received" as const },
      { id: "2", amountPaise: 3000000, status: "received" as const },
    ];

    // Delete payment 2
    payments = payments.filter((p) => p.id !== "2");

    const financials = recalculateProjectFinancials(quotedPaise, payments);
    expect(financials.receivedPaise).toBe(4000000); // ₹40,000
    expect(financials.pendingPaise).toBe(6000000); // ₹60,000
  });

  it("safely blocks deletion if project earned amount would become negative", () => {
    const payments = [
      { id: "1", amountPaise: 5000000, status: "received" as const },
    ];

    const check = canDeletePayment(payments, "1");
    expect(check.allowed).toBe(true);
  });

  it("handles over-collected project amounts gracefully without negative pending", () => {
    const payments = [
      { id: "1", amountPaise: 7000000, status: "received" as const },
      { id: "2", amountPaise: 5000000, status: "received" as const },
    ];

    const financials = recalculateProjectFinancials(quotedPaise, payments);
    expect(financials.receivedPaise).toBe(12000000); // ₹1,20,000
    expect(financials.pendingPaise).toBe(0); // Clamped to zero, not negative
  });
});
