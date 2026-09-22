"use client";

import { useState } from "react";
import { 
  Users, 
  FolderGit2, 
  CreditCard, 
  Plus, 
  Download, 
  Printer, 
  CheckCircle2, 
  UserCheck, 
  DollarSign, 
  Mail, 
  Phone, 
  Building, 
  Calendar as CalendarIcon,
  Sparkles,
  Receipt,
  X,
  Edit3,
  Trash2,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { formatPaise, rupeesToPaise, paiseToRupees } from "@/lib/money";
import { toast } from "sonner";
import type {
  AdminInquiry,
  AdminClient,
  AdminProject,
  AdminPayment,
  AdminExpense,
  AdminTeamMember,
  AdminMilestone,
} from "@/types/admin";

interface CrmTabProps {
  inquiries: AdminInquiry[];
  clients: AdminClient[];
  projects: AdminProject[];
  payments: AdminPayment[];
  expenses: AdminExpense[];
  teamMembers: AdminTeamMember[];
  canViewFinance: boolean;
  isOwner?: boolean;
  onRefresh: () => Promise<void>;
}

export function CrmTab({
  inquiries,
  clients,
  projects,
  payments,
  expenses,
  teamMembers,
  canViewFinance,
  isOwner = true,
  onRefresh,
}: CrmTabProps) {
  const [subTab, setSubTab] = useState<"inquiries" | "clients" | "projects" | "payments" | "expenses">("inquiries");

  // Client Modal
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [clientForm, setClientForm] = useState({ name: "", email: "", phone: "", company: "", notes: "" });

  // Project Modal
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({
    clientId: "",
    name: "",
    description: "",
    category: "Apps",
    quotedRupees: "50000",
    assignedMemberIds: [] as string[],
    deadline: "",
  });

  // Milestone Modal
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [milestoneForm, setMilestoneForm] = useState({ title: "", description: "", dueDate: "" });

  // Payment Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    projectId: "",
    amountRupees: "20000",
    method: "UPI",
    reference: "",
  });

  // Receipt Modal
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(null);

  // Inquiry Edit Modal State
  const [editInquiryModalOpen, setEditInquiryModalOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    service: "",
    budget: "",
    message: "",
    status: "Unread",
  });
  const [savingInquiry, setSavingInquiry] = useState(false);
  const [convertingInquiryId, setConvertingInquiryId] = useState<string | null>(null);

  // Generic Reusable Confirm Delete State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "inquiry" | "project" | "milestone" | "payment" | "expense";
    id: string;
    title: string;
    description: string;
    destructiveWarning?: string;
    extraId?: string; // e.g. projectId for milestone
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Open Edit Inquiry
  const handleOpenEditInquiry = (inq: AdminInquiry) => {
    setInquiryForm({
      id: inq.id,
      name: inq.name,
      email: inq.email,
      phone: inq.phone || "",
      service: inq.service || "",
      budget: inq.budget || "",
      message: inq.message,
      status: inq.status || "Unread",
    });
    setEditInquiryModalOpen(true);
  };

  // Update Inquiry
  const handleUpdateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInquiry(true);
    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inquiryForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update inquiry");
      toast.success("Inquiry updated successfully!");
      setEditInquiryModalOpen(false);
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSavingInquiry(false);
    }
  };

  // Delete Inquiry Confirm Prompt
  const handleDeleteInquiryConfirm = (inq: AdminInquiry) => {
    setDeleteTarget({
      type: "inquiry",
      id: inq.id,
      title: `Delete inquiry from ${inq.name}?`,
      description: "Delete this inquiry? This cannot be undone.",
    });
    setDeleteConfirmOpen(true);
  };

  // Execute Delete for all entities
  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      let endpoint = "";
      if (deleteTarget.type === "inquiry") {
        endpoint = `/api/admin/inquiries?id=${deleteTarget.id}`;
      } else if (deleteTarget.type === "project") {
        endpoint = `/api/admin/business-projects?id=${deleteTarget.id}`;
      } else if (deleteTarget.type === "milestone") {
        endpoint = `/api/admin/milestones?id=${deleteTarget.id}`;
      } else if (deleteTarget.type === "payment") {
        endpoint = `/api/admin/payments?id=${deleteTarget.id}`;
      } else if (deleteTarget.type === "expense") {
        endpoint = `/api/admin/expenses?id=${deleteTarget.id}`;
      }

      const res = await fetch(endpoint, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to delete ${deleteTarget.type}`);

      const entityName = deleteTarget.type.charAt(0).toUpperCase() + deleteTarget.type.slice(1);
      toast.success(`${entityName} deleted successfully!`);
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Convert Inquiry to Client
  const handleConvertInquiry = async (id: string) => {
    setConvertingInquiryId(id);
    try {
      const res = await fetch(`/api/admin/inquiries/${id}/convert`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to convert inquiry");
      toast.success("Inquiry converted to client successfully!");
      await onRefresh();
      setSubTab("clients");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setConvertingInquiryId(null);
    }
  };

  // Create Client
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create client");
      toast.success("Client created!");
      setClientModalOpen(false);
      setClientForm({ name: "", email: "", phone: "", company: "", notes: "" });
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // Create Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const quotedAmountPaise = rupeesToPaise(Number(projectForm.quotedRupees) || 0);
      const res = await fetch("/api/admin/business-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: projectForm.clientId || null,
          name: projectForm.name,
          description: projectForm.description,
          category: projectForm.category,
          quotedAmountPaise,
          assignedMemberIds: projectForm.assignedMemberIds,
          deadline: projectForm.deadline ? new Date(projectForm.deadline).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create project");
      toast.success("Project created with quoted amount in integer paise!");
      setProjectModalOpen(false);
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // Create Milestone
  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          title: milestoneForm.title,
          description: milestoneForm.description,
          dueDate: milestoneForm.dueDate ? new Date(milestoneForm.dueDate).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create milestone");
      toast.success("Milestone added!");
      setMilestoneModalOpen(false);
      setMilestoneForm({ title: "", description: "", dueDate: "" });
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // Toggle Milestone Status
  const handleToggleMilestone = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "completed" ? "pending" : "completed";
      const res = await fetch("/api/admin/milestones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update milestone");
      toast.success(`Milestone marked as ${newStatus}!`);
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // Record Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const amountPaise = rupeesToPaise(Number(paymentForm.amountRupees) || 0);
      const selectedProj = projects.find((p) => p.id === paymentForm.projectId);
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: paymentForm.projectId || null,
          clientId: selectedProj?.clientId || null,
          amountPaise,
          method: paymentForm.method,
          reference: paymentForm.reference,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record payment");
      toast.success("Payment recorded and ledger updated!");
      setPaymentModalOpen(false);
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    window.open("/api/admin/payments?format=csv", "_blank");
  };

  // Trigger Receipt Print
  const handlePrintReceipt = (payment: AdminPayment) => {
    setSelectedPayment(payment);
    setReceiptModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white border border-black/10 shadow-xs">
        <button
          onClick={() => setSubTab("inquiries")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === "inquiries" ? "bg-[#374BFF] text-white shadow-xs" : "text-[#14141A] hover:text-[#374BFF]"
          }`}
        >
          Inquiries ({inquiries.length})
        </button>
        <button
          onClick={() => setSubTab("clients")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === "clients" ? "bg-[#374BFF] text-white shadow-xs" : "text-[#14141A] hover:text-[#374BFF]"
          }`}
        >
          Clients ({clients.length})
        </button>
        <button
          onClick={() => setSubTab("projects")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === "projects" ? "bg-[#374BFF] text-white shadow-xs" : "text-[#14141A] hover:text-[#374BFF]"
          }`}
        >
          Projects ({projects.length})
        </button>

        {canViewFinance && (
          <>
            <button
              onClick={() => setSubTab("payments")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                subTab === "payments" ? "bg-[#374BFF] text-white shadow-xs" : "text-[#14141A] hover:text-[#374BFF]"
              }`}
            >
              Payments Ledger
            </button>
            <button
              onClick={() => setSubTab("expenses")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                subTab === "expenses" ? "bg-[#374BFF] text-white shadow-xs" : "text-[#14141A] hover:text-[#374BFF]"
              }`}
            >
              Expenses
            </button>
          </>
        )}
      </div>

      {/* SUBTAB: INQUIRIES */}
      {subTab === "inquiries" && (
        <div className="rounded-3xl bg-white border border-black/10 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-bold text-[#14141A]">
              Website Inquiries & Leads
            </h3>
            <span className="text-xs font-medium text-[#2B2B38]">
              Includes Budget and Instant "Convert to Client"
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-black/10 text-[#2B2B38] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Lead</th>
                  <th className="py-3 px-3">Service</th>
                  <th className="py-3 px-3">Budget</th>
                  <th className="py-3 px-3">Message</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {inquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-[#F5F6FC]">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-[#14141A]">{inq.name}</div>
                      <div className="text-[#2B2B38] text-[11px]">{inq.email}</div>
                      {inq.phone && <div className="text-[#2B2B38] text-[10px]">{inq.phone}</div>}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-[#14141A]">{inq.service}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#374BFF]">
                      {inq.budget || "Not specified"}
                    </td>
                    <td className="py-3.5 px-3 text-[#2B2B38] max-w-xs truncate">{inq.message}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        inq.status?.toLowerCase() === "converted"
                          ? "bg-emerald-100 text-emerald-700"
                          : inq.status?.toLowerCase() === "contacted"
                          ? "bg-purple-100 text-purple-700"
                          : inq.status?.toLowerCase() === "archived"
                          ? "bg-zinc-200 text-zinc-700"
                          : "bg-blue-100 text-[#374BFF]"
                      }`}>
                        {inq.status || "Unread"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inq.status?.toLowerCase() === "converted" ? (
                          <button
                            disabled
                            className="px-2.5 py-1.5 rounded-xl bg-black/5 text-[#2B2B38]/50 text-[11px] font-bold cursor-not-allowed inline-flex items-center gap-1"
                            title="Inquiry already converted to client"
                          >
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            Converted
                          </button>
                        ) : (
                          <button
                            onClick={() => handleConvertInquiry(inq.id)}
                            disabled={convertingInquiryId === inq.id}
                            className="px-2.5 py-1.5 rounded-xl bg-[#374BFF] text-white text-[11px] font-bold hover:bg-[#14141A] transition-all cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            {convertingInquiryId === inq.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <UserCheck className="h-3 w-3" />
                            )}
                            Convert
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditInquiry(inq)}
                          className="p-1.5 rounded-lg border border-black/10 text-[#14141A] hover:border-[#374BFF] hover:text-[#374BFF] transition-all cursor-pointer"
                          title="Edit inquiry"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteInquiryConfirm(inq)}
                          className="p-1.5 rounded-lg border border-black/10 text-rose-600 hover:border-rose-400 hover:bg-rose-50 transition-all cursor-pointer"
                          title="Delete inquiry"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB: CLIENTS */}
      {subTab === "clients" && (
        <div className="rounded-3xl bg-white border border-black/10 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-bold text-[#14141A]">
              Clients Directory
            </h3>
            <button
              onClick={() => setClientModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Client
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((c) => (
              <div key={c.id} className="p-5 rounded-2xl bg-[#F5F6FC] border border-black/10 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-heading text-sm font-bold text-[#14141A]">{c.name}</h4>
                    {c.company && <p className="text-xs text-[#374BFF] font-medium">{c.company}</p>}
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                    Active
                  </span>
                </div>
                <div className="space-y-1 text-xs text-[#2B2B38] pt-1">
                  {c.email && <div className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-[#374BFF]" /> {c.email}</div>}
                  {c.phone && <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[#374BFF]" /> {c.phone}</div>}
                </div>
                {c.notes && (
                  <p className="text-[11px] text-[#2B2B38] bg-white p-2 rounded-xl border border-black/5 mt-2">
                    {c.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB: PROJECTS */}
      {subTab === "projects" && (
        <div className="rounded-3xl bg-white border border-black/10 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-[#14141A]">
                Business Projects
              </h3>
              <p className="text-xs text-[#2B2B38]">
                Money in integer paise • Milestones % • Multi-assignee support
              </p>
            </div>
            <button
              onClick={() => setProjectModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> New Project
            </button>
          </div>

          <div className="space-y-4">
            {projects.map((p) => (
              <div key={p.id} className="p-6 rounded-2xl bg-[#F5F6FC] border border-black/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading text-base font-bold text-[#14141A]">{p.name}</h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#374BFF]/10 text-[#374BFF]">
                        {p.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#2B2B38]">
                      Client: <span className="font-bold text-[#14141A]">{p.clientName}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-[#2B2B38] block">Quoted</span>
                      <span className="font-mono text-sm font-bold text-[#14141A]">{formatPaise(p.quotedAmountPaise)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 block">Earned</span>
                      <span className="font-mono text-sm font-bold text-emerald-600">{formatPaise(p.earnedPaise || 0)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-amber-600 block">Pending</span>
                      <span className="font-mono text-sm font-bold text-amber-600">{formatPaise(p.pendingPaise || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Milestones Section */}
                <div className="pt-3 border-t border-black/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#14141A]">
                      Milestones ({p.milestones?.length || 0}) • Progress: {p.milestoneProgressPercent}%
                    </span>
                    <button
                      onClick={() => {
                        setSelectedProjectId(p.id);
                        setMilestoneModalOpen(true);
                      }}
                      className="text-xs font-bold text-[#374BFF] hover:underline cursor-pointer"
                    >
                      + Add Milestone
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {p.milestones?.map((m: AdminMilestone) => (
                      <div
                        key={m.id}
                        onClick={() => handleToggleMilestone(m.id, m.status)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                          m.status === "completed"
                            ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                            : "bg-white border-black/10 text-[#14141A]"
                        }`}
                      >
                        <span className="font-medium truncate">{m.title}</span>
                        <span className="text-[10px] font-bold">
                          {m.status === "completed" ? "✓ Done" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB: PAYMENTS */}
      {subTab === "payments" && canViewFinance && (
        <div className="rounded-3xl bg-white border border-black/10 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-heading text-lg font-bold text-[#14141A]">
                Payments Ledger
              </h3>
              <p className="text-xs text-[#2B2B38]">
                Integer paise recorded • Instant CSV Export & Printable Receipts
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-black/15 bg-white text-[#14141A] text-xs font-bold hover:border-[#374BFF] hover:text-[#374BFF] transition-all cursor-pointer"
              >
                <Download className="h-4 w-4" /> Export CSV
              </button>
              <button
                onClick={() => setPaymentModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Record Payment
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-black/10 text-[#2B2B38] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Project</th>
                  <th className="py-3 px-3">Client</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F5F6FC]">
                    <td className="py-3.5 px-3 font-medium">
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-IN") : "N/A"}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-[#14141A]">{p.projectName}</td>
                    <td className="py-3.5 px-3 text-[#2B2B38]">{p.clientName}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-emerald-600">
                      {formatPaise(p.amountPaise)}
                    </td>
                    <td className="py-3.5 px-3">{p.method || "UPI"}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        Received
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handlePrintReceipt(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-black/15 hover:border-[#374BFF] text-[11px] font-bold text-[#374BFF] transition-all cursor-pointer"
                      >
                        <Printer className="h-3 w-3" /> Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB: EXPENSES */}
      {subTab === "expenses" && canViewFinance && (
        <div className="rounded-3xl bg-white border border-black/10 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-bold text-[#14141A]">
              Studio Operational Expenses
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-black/10 text-[#2B2B38] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-[#F5F6FC]">
                    <td className="py-3 px-3">
                      {e.paidAt ? new Date(e.paidAt).toLocaleDateString("en-IN") : "N/A"}
                    </td>
                    <td className="py-3 px-3 font-bold text-[#14141A]">{e.category}</td>
                    <td className="py-3 px-3 text-[#2B2B38]">{e.description || "N/A"}</td>
                    <td className="py-3 px-3 font-mono font-bold text-red-600">
                      {formatPaise(e.amountPaise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: CREATE CLIENT */}
      {clientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-black/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-[#14141A]">Add New Client</h3>
              <button onClick={() => setClientModalOpen(false)} className="text-[#2B2B38] hover:text-[#14141A]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateClient} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#14141A]">Client Name *</label>
                <input
                  type="text"
                  required
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#14141A]">Email</label>
                <input
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#14141A]">Phone</label>
                <input
                  type="text"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#14141A]">Company / Brand</label>
                <input
                  type="text"
                  value={clientForm.company}
                  onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer mt-2"
              >
                Save Client
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE PROJECT */}
      {projectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-black/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-[#14141A]">Create New Project</h3>
              <button onClick={() => setProjectModalOpen(false)} className="text-[#2B2B38] hover:text-[#14141A]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#14141A]">Project Name *</label>
                <input
                  type="text"
                  required
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Client</label>
                  <select
                    value={projectForm.clientId}
                    onChange={(e) => setProjectForm({ ...projectForm, clientId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  >
                    <option value="">Select client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Category</label>
                  <select
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  >
                    <option value="Apps">Apps (Mobile & Web)</option>
                    <option value="Websites">Websites</option>
                    <option value="Hardware">Hardware / Robotics</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Quoted Amount (₹ Rupees) *</label>
                  <input
                    type="number"
                    required
                    value={projectForm.quotedRupees}
                    onChange={(e) => setProjectForm({ ...projectForm, quotedRupees: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-bold font-mono focus:outline-none focus:border-[#374BFF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Deadline Date</label>
                  <input
                    type="date"
                    value={projectForm.deadline}
                    onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#14141A]">Assign Team Members (Assign 2+)</label>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {teamMembers.map((tm) => (
                    <label key={tm.id} className="flex items-center gap-2 text-xs text-[#14141A] p-2 rounded-lg bg-[#F5F6FC]">
                      <input
                        type="checkbox"
                        checked={projectForm.assignedMemberIds.includes(tm.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setProjectForm((prev) => ({
                            ...prev,
                            assignedMemberIds: checked
                              ? [...prev.assignedMemberIds, tm.id]
                              : prev.assignedMemberIds.filter((id) => id !== tm.id),
                          }));
                        }}
                      />
                      <span>{tm.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer mt-2"
              >
                Create Project
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE MILESTONE */}
      {milestoneModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-black/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-[#14141A]">Add Milestone</h3>
              <button onClick={() => setMilestoneModalOpen(false)} className="text-[#2B2B38] hover:text-[#14141A]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateMilestone} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#14141A]">Milestone Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prototype UI Review"
                  value={milestoneForm.title}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#14141A]">Due Date</label>
                <input
                  type="date"
                  value={milestoneForm.dueDate}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer mt-2"
              >
                Save Milestone
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD PAYMENT */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-black/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-[#14141A]">Record Client Payment</h3>
              <button onClick={() => setPaymentModalOpen(false)} className="text-[#2B2B38] hover:text-[#14141A]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#14141A]">Project *</label>
                <select
                  required
                  value={paymentForm.projectId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, projectId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                >
                  <option value="">Select project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Quoted {formatPaise(p.quotedAmountPaise)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-[#14141A]">Payment Amount (₹ Rupees) *</label>
                <input
                  type="number"
                  required
                  value={paymentForm.amountRupees}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amountRupees: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-bold font-mono focus:outline-none focus:border-[#374BFF]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#14141A]">Payment Method</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                >
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Bank Transfer">NEFT / IMPS / Bank</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-[#14141A]">Transaction Reference</label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref / UTR"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer mt-2"
              >
                Record Payment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRINTABLE RECEIPT */}
      {receiptModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full border border-black/10 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/10 pb-4">
              <div>
                <span className="font-heading font-black text-xl text-[#374BFF]">TRIOCORE</span>
                <p className="text-[10px] uppercase font-bold text-[#2B2B38] tracking-widest">
                  Official Payment Receipt
                </p>
              </div>
              <button onClick={() => setReceiptModalOpen(false)} className="text-[#2B2B38] hover:text-[#14141A]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-[#2B2B38]">Receipt No:</span>
                <span className="font-mono font-bold">{selectedPayment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#2B2B38]">Date:</span>
                <span className="font-bold">
                  {selectedPayment.paidAt ? new Date(selectedPayment.paidAt).toLocaleDateString("en-IN") : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#2B2B38]">Client Name:</span>
                <span className="font-bold">{selectedPayment.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#2B2B38]">Project:</span>
                <span className="font-bold">{selectedPayment.projectName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#2B2B38]">Payment Method:</span>
                <span className="font-bold">{selectedPayment.method || "UPI"}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#F5F6FC] border border-black/10 flex justify-between items-center mt-4">
                <span className="font-heading text-sm font-bold text-[#14141A]">Amount Paid:</span>
                <span className="font-mono text-xl font-black text-emerald-600">
                  {formatPaise(selectedPayment.amountPaise)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="h-4 w-4" /> Print Receipt
              </button>
              <button
                onClick={() => setReceiptModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-black/15 text-xs font-bold hover:bg-[#F5F6FC] transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT INQUIRY */}
      {editInquiryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-black/10 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-[#14141A]">Edit Inquiry</h3>
              <button onClick={() => setEditInquiryModalOpen(false)} className="text-[#2B2B38] hover:text-[#14141A]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateInquiry} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Name *</label>
                  <input
                    type="text"
                    required
                    value={inquiryForm.name}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Email *</label>
                  <input
                    type="email"
                    required
                    value={inquiryForm.email}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Phone</label>
                  <input
                    type="text"
                    value={inquiryForm.phone}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Service *</label>
                  <input
                    type="text"
                    required
                    value={inquiryForm.service}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, service: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Budget</label>
                  <input
                    type="text"
                    value={inquiryForm.budget}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, budget: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                    placeholder="e.g. ₹50,000 - ₹1,00,000"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Status *</label>
                  <select
                    value={inquiryForm.status}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  >
                    <option value="Unread">Unread</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Converted">Converted</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#14141A]">Message *</label>
                <textarea
                  required
                  rows={3}
                  value={inquiryForm.message}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditInquiryModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-black/15 text-xs font-bold text-[#14141A] hover:bg-[#F5F6FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingInquiry}
                  className="flex-1 py-2.5 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {savingInquiry ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REUSABLE CONFIRM DELETE DIALOG */}
      {deleteConfirmOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-black/10 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="h-10 w-10 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-[#14141A]">
                  {deleteTarget.title}
                </h3>
                <p className="text-xs text-[#2B2B38] mt-0.5">
                  {deleteTarget.description}
                </p>
              </div>
            </div>

            {deleteTarget.destructiveWarning && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
                {deleteTarget.destructiveWarning}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setDeleteTarget(null);
                }}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-black/15 text-xs font-bold text-[#14141A] hover:bg-[#F5F6FC]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
