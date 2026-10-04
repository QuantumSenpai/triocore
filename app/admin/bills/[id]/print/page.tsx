import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { bills, projects, clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { formatPaise } from "@/lib/money";
import { ArrowLeft, CheckCircle2, AlertCircle, FileText, Ban } from "lucide-react";
import Link from "next/link";
import { PrintBillButton } from "./print-button";
import type { AdminBillLineItem } from "@/types/admin";
import { getCompanyContactInfo } from "@/lib/dal/content";

interface BillPageProps {
  params: Promise<{ id: string }>;
}

export default async function BillPrintPage({ params }: BillPageProps) {
  const { id } = await params;

  if (!db) {
    notFound();
  }

  const billList = await db.select().from(bills).where(eq(bills.id, id)).limit(1);
  if (billList.length === 0) {
    notFound();
  }

  const bill = billList[0];
  let clientName = bill.clientName || "Direct Client";
  let clientEmail = "N/A";
  let clientCompany = "Independent";

  if (bill.clientId) {
    const clientList = await db.select().from(clients).where(eq(clients.id, bill.clientId)).limit(1);
    if (clientList.length > 0) {
      clientName = clientList[0].name;
      clientEmail = clientList[0].email || "N/A";
      clientCompany = clientList[0].businessName || clientCompany;
    }
  }

  let projectName = bill.projectName || "General Engineering & Design";
  let projectCategory = "Engineering";
  if (bill.projectId) {
    const projList = await db.select().from(projects).where(eq(projects.id, bill.projectId)).limit(1);
    if (projList.length > 0) {
      projectName = projList[0].title;
      projectCategory = projList[0].category;
    }
  }

  const dateStr = bill.issuedDate
    ? new Date(bill.issuedDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : bill.createdAt
    ? new Date(bill.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "N/A";

  const lineItems = (Array.isArray(bill.lineItems) ? bill.lineItems : []) as AdminBillLineItem[];
  const companyInfo = await getCompanyContactInfo();

  return (
    <div className="min-h-screen bg-[#F5F6FC] py-8 sm:py-12 px-4 sm:px-6 print:bg-white print:py-0 print:px-0">
      <div className="max-w-3xl mx-auto space-y-6 print:max-w-none print:w-full print:space-y-4">
        {/* Navigation & Actions (Hidden during print) */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#2B2B38] hover:text-[#14141A] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <PrintBillButton />
        </div>

        {/* Printable Bill Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-black/10 shadow-xl space-y-8 print:border-none print:shadow-none print:p-0 print:rounded-none">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-black/10 pb-6">
            <div>
              <span className="font-heading font-black text-2xl sm:text-3xl text-[#374BFF] tracking-tight">
                {companyInfo.companyName.toUpperCase()}
              </span>
              <p className="text-[12px] font-semibold text-[#14141A] tracking-normal mt-0.5">
                Digital Engineering & Web Systems
              </p>
              <p className="text-[11px] text-[#2B2B38] mt-0.5">
                {companyInfo.email} • {companyInfo.website}
              </p>
            </div>
            <div className="text-left sm:text-right space-y-1">
              <div className="flex sm:justify-end items-center gap-2">
                <span className="text-[11px] uppercase font-bold text-[#2B2B38] tracking-wider">
                  Status:
                </span>
                {bill.status === "final" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3" />
                    Final
                  </span>
                )}
                {bill.status === "draft" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertCircle className="h-3 w-3" />
                    Draft
                  </span>
                )}
                {bill.status === "void" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <Ban className="h-3 w-3" />
                    Void
                  </span>
                )}
              </div>
              <p className="text-xs text-[#2B2B38]">
                Bill Date: <span className="font-semibold text-[#14141A]">{dateStr}</span>
              </p>
              <p className="text-xs text-[#2B2B38]">
                Order / Bill ID: <span className="font-mono font-bold text-[#14141A]">{bill.orderId}</span>
              </p>
            </div>
          </div>

          {/* Void Banner if status is void */}
          {bill.status === "void" && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-xs font-bold text-center">
              ⚠️ THIS BILL HAS BEEN MARKED AS VOID AND IS NO LONGER VALID FOR PAYMENT OR ACCOUNTING.
            </div>
          )}

          {/* Client & Project Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-[#F5F6FC] border border-black/10 text-xs print:bg-slate-50">
            <div>
              <span className="text-[#2B2B38] text-[11px] uppercase font-bold tracking-wider">
                Billed To
              </span>
              <p className="font-bold text-[#14141A] text-sm mt-0.5">{clientName}</p>
              {clientCompany && clientCompany !== "Independent" && (
                <p className="text-[#2B2B38] font-medium">{clientCompany}</p>
              )}
              {clientEmail && clientEmail !== "N/A" && (
                <p className="font-mono text-[#2B2B38] mt-0.5">{clientEmail}</p>
              )}
            </div>
            <div>
              <span className="text-[#2B2B38] text-[11px] uppercase font-bold tracking-wider">
                Project & Service
              </span>
              <p className="font-bold text-[#14141A] text-sm mt-0.5">{projectName}</p>
              <p className="text-[#2B2B38] font-medium capitalize mt-0.5">Category: {projectCategory}</p>
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs uppercase font-black text-[#2B2B38] tracking-wider">
              Itemized Scope of Work
            </h4>
            <div className="border border-black/10 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F5F6FC] border-b border-black/10 text-[#2B2B38] font-bold uppercase text-[10px] tracking-wider print:bg-slate-100">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Description / Scope</th>
                    <th className="py-3 px-4 text-right w-36">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {lineItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-black/[0.02]">
                      <td className="py-3.5 px-4 text-center font-mono text-[#2B2B38] font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#14141A]">
                        {item.description}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#14141A]">
                        {formatPaise(item.amountPaise)}
                      </td>
                    </tr>
                  ))}
                  {lineItems.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-[#2B2B38]">
                        No line items recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Calculation Breakdown */}
          <div className="flex flex-col sm:flex-row justify-end items-end gap-6 pt-2">
            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-black/10">
                <span className="text-[#2B2B38]">Subtotal:</span>
                <span className="font-mono font-bold text-[#14141A]">
                  {formatPaise(bill.subtotalPaise)}
                </span>
              </div>
              {bill.discountPaise > 0 && (
                <div className="flex justify-between py-1 border-b border-black/10 text-emerald-600">
                  <span>Discount:</span>
                  <span className="font-mono font-bold">
                    -{formatPaise(bill.discountPaise)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-[#F5F6FC] border border-black/10 font-bold print:bg-slate-100">
                <span className="text-[#14141A] text-sm">Total Payable:</span>
                <span className="font-mono text-base sm:text-lg text-[#374BFF]">
                  {formatPaise(bill.totalPaise)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes & Payment Terms */}
          {bill.notes && (
            <div className="p-4 rounded-xl bg-slate-50 border border-black/10 text-xs space-y-1">
              <span className="font-bold text-[#2B2B38] uppercase tracking-wider text-[10px]">
                Notes & Terms:
              </span>
              <p className="text-[#14141A] whitespace-pre-wrap">{bill.notes}</p>
            </div>
          )}

          {/* Footer note */}
          <div className="text-center pt-4 border-t border-black/10 text-[11px] text-[#2B2B38] space-y-1">
            <p>
              This is a computer-generated bill / invoice issued by TrioCore OS. No physical signature required.
            </p>
            <p className="text-[10px] text-slate-400">
              Generated by {bill.createdBy || "TrioCore OS"} • System ID: {bill.id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
