import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { payments, projects, clients } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { formatPaise } from "@/lib/money";
import { Printer, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface ReceiptPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReceiptPage({ params }: ReceiptPageProps) {
  const { id } = await params;

  if (!db) {
    notFound();
  }

  const paymentList = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
  if (paymentList.length === 0) {
    notFound();
  }

  const payment = paymentList[0];
  let clientName = "Direct Client";
  let clientEmail = "N/A";
  let clientCompany = "Independent";

  if (payment.clientId) {
    const clientList = await db.select().from(clients).where(eq(clients.id, payment.clientId)).limit(1);
    if (clientList.length > 0) {
      clientName = clientList[0].name;
      clientEmail = clientList[0].email || "N/A";
      clientCompany = clientList[0].businessName || clientCompany;
    }
  }

  let projectName = "Direct Payment";
  let projectCategory = "General";
  if (payment.projectId) {
    const projList = await db.select().from(projects).where(eq(projects.id, payment.projectId)).limit(1);
    if (projList.length > 0) {
      projectName = projList[0].title;
      projectCategory = projList[0].category;
    }
  }

  const dateStr = payment.receivedDate
    ? new Date(payment.receivedDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : payment.createdAt
    ? new Date(payment.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "N/A";

  return (
    <div className="min-h-screen bg-[#F5F6FC] py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#2B2B38] hover:text-[#14141A] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <button
            onClick={undefined}
            data-action="print"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer shadow-sm"
          >
            <Printer className="h-4 w-4" />
            Print Receipt
          </button>
        </div>

        {/* Printable Receipt Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-black/10 shadow-xl space-y-8 print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-6">
            <div>
              <span className="font-heading font-black text-2xl text-[#374BFF] tracking-tight">
                TRIOCORE
              </span>
              <p className="text-[11px] uppercase font-bold text-[#2B2B38] tracking-widest mt-0.5">
                Official Payment Receipt
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Payment Received
              </span>
              <p className="text-xs text-[#2B2B38] mt-1">
                Receipt Date: <span className="font-semibold text-[#14141A]">{dateStr}</span>
              </p>
            </div>
          </div>

          {/* Key Identifiers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F5F6FC] border border-black/10 text-xs">
            <div>
              <span className="text-[#2B2B38] text-[11px] uppercase font-bold tracking-wider">Receipt Reference ID</span>
              <p className="font-mono font-bold text-[#14141A] text-xs sm:text-sm mt-0.5 break-all">
                {payment.id}
              </p>
            </div>
            <div>
              <span className="text-[#2B2B38] text-[11px] uppercase font-bold tracking-wider">Payment Method & Ref</span>
              <p className="font-bold text-[#14141A] text-xs sm:text-sm mt-0.5">
                {payment.method || "UPI"} {payment.reference ? `(${payment.reference})` : ""}
              </p>
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-4 text-xs">
            <h4 className="font-heading text-xs uppercase font-black text-[#2B2B38] tracking-wider">
              Transaction Details
            </h4>
            <div className="divide-y divide-black/10 border-y border-black/10">
              <div className="py-3 flex justify-between">
                <span className="text-[#2B2B38]">Client Name</span>
                <span className="font-bold text-[#14141A]">{clientName}</span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="text-[#2B2B38]">Client Company</span>
                <span className="font-semibold text-[#14141A]">{clientCompany}</span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="text-[#2B2B38]">Client Email</span>
                <span className="font-mono text-[#14141A]">{clientEmail}</span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="text-[#2B2B38]">Associated Project</span>
                <span className="font-bold text-[#14141A]">{projectName}</span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="text-[#2B2B38]">Category</span>
                <span className="capitalize font-semibold text-[#14141A]">{projectCategory}</span>
              </div>
              {payment.notes && (
                <div className="py-3 flex justify-between">
                  <span className="text-[#2B2B38]">Notes / Reference</span>
                  <span className="font-medium text-[#14141A]">{payment.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Total Amount Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#F5F6FC] to-white border-2 border-[#374BFF]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-[#2B2B38]">
                Total Amount Paid
              </span>
              <p className="text-[11px] text-[#2B2B38]">
                All taxes & transaction fees included
              </p>
            </div>
            <div className="text-right">
              <span className="font-mono text-3xl font-black text-emerald-600">
                {formatPaise(payment.amountPaise)}
              </span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-4 border-t border-black/10">
            <p className="text-[11px] text-[#2B2B38]">
              This is a computer-generated receipt issued by TrioCore OS. No signature required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
