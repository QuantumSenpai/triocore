/**
 * Money utilities for TrioCore OS.
 * RULE: All money is stored as integer paise (1 Rupee = 100 Paise).
 * Display formatting uses Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).
 */

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const inrExactFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

/**
 * Converts integer paise to Indian Rupees (decimal).
 * e.g., 2000000 paise -> 20000
 */
export function paiseToRupees(paise: number | bigint): number {
  return Number(paise) / 100;
}

/**
 * Converts Indian Rupees to integer paise.
 * e.g., 20000 -> 2000000 paise
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Formats integer paise into standard Indian Rupee currency display.
 * e.g., 2000000 -> "₹20,000"
 */
export function formatPaise(paise: number | bigint, exactCents = false): string {
  const rupees = paiseToRupees(paise);
  return exactCents ? inrExactFormatter.format(rupees) : inrFormatter.format(rupees);
}

export const formatRupees = formatPaise;

/**
 * Calculates payment progress percentage (0 to 100).
 */
export function calculatePaymentProgress(collectedPaise: number, quotedPaise: number): number {
  if (!quotedPaise || quotedPaise <= 0) return 0;
  const pct = Math.round((collectedPaise / quotedPaise) * 100);
  return Math.min(Math.max(0, pct), 100);
}

/**
 * Computes aggregated financial summaries from a list of payments.
 */
export interface FinancialSummary {
  quotedPaise: number;
  collectedPaise: number;
  pendingPaise: number;
  overduePaise: number;
  collectionProgressPercent: number;
}

export function computeFinancialSummary(
  quotedPaise: number,
  payments: { amountPaise: number; status: "pending" | "received" | "overdue"; dueDate?: string | Date | null }[]
): FinancialSummary {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let collectedPaise = 0;
  let pendingPaise = 0;
  let overduePaise = 0;

  for (const p of payments) {
    if (p.status === "received") {
      collectedPaise += p.amountPaise;
    } else {
      const isOverdue =
        p.status === "overdue" ||
        (p.dueDate && new Date(p.dueDate).getTime() < today.getTime());

      if (isOverdue) {
        overduePaise += p.amountPaise;
      } else {
        pendingPaise += p.amountPaise;
      }
    }
  }

  const totalOutstanding = pendingPaise + overduePaise;

  return {
    quotedPaise,
    collectedPaise,
    pendingPaise: totalOutstanding,
    overduePaise,
    collectionProgressPercent: calculatePaymentProgress(collectedPaise, quotedPaise),
  };
}
