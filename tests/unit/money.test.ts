import { describe, it, expect } from "vitest";
import {
  paiseToRupees,
  rupeesToPaise,
  formatPaise,
  calculatePaymentProgress,
  computeFinancialSummary,
} from "@/lib/money";

describe("Money Utilities (Integer Paise & INR)", () => {
  it("converts paise to rupees correctly", () => {
    expect(paiseToRupees(100)).toBe(1);
    expect(paiseToRupees(5000000)).toBe(50000);
    expect(paiseToRupees(29900)).toBe(299);
  });

  it("converts rupees to paise correctly", () => {
    expect(rupeesToPaise(1)).toBe(100);
    expect(rupeesToPaise(50000)).toBe(5000000);
    expect(rupeesToPaise(299)).toBe(29900);
  });

  it("formats paise in Indian Rupee currency display without decimals when exactCents is false", () => {
    const formatted = formatPaise(5000000);
    expect(formatted).toContain("50,000");
    expect(formatted).toMatch(/₹|INR/);
  });

  it("calculates payment progress percent correctly", () => {
    expect(calculatePaymentProgress(2000000, 5000000)).toBe(40);
    expect(calculatePaymentProgress(5000000, 5000000)).toBe(100);
    expect(calculatePaymentProgress(0, 5000000)).toBe(0);
    expect(calculatePaymentProgress(6000000, 5000000)).toBe(100);
  });

  it("computes financial summary accurately", () => {
    const payments = [
      { amountPaise: 2000000, status: "received" as const },
      { amountPaise: 1000000, status: "received" as const },
      { amountPaise: 1000000, status: "pending" as const, dueDate: "2099-01-01" },
      { amountPaise: 1000000, status: "overdue" as const },
    ];
    const summary = computeFinancialSummary(5000000, payments);

    expect(summary.quotedPaise).toBe(5000000);
    expect(summary.collectedPaise).toBe(3000000);
    expect(summary.pendingPaise).toBe(2000000); // pending + overdue
    expect(summary.overduePaise).toBe(1000000);
    expect(summary.collectionProgressPercent).toBe(60);
  });
});
