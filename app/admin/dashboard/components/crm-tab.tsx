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
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  Filter,
  Check,
  RotateCcw
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

  // Edit Client Modal
  const [editClientModalOpen, setEditClientModalOpen] = useState(false);
  const [clientEditForm, setClientEditForm] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
    status: "active",
  });
  const [savingClient, setSavingClient] = useState(false);

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

  // Edit Project Modal
  const [editProjectModalOpen, setEditProjectModalOpen] = useState(false);
  const [projectEditForm, setProjectEditForm] = useState({
    id: "",
    clientId: "",
    name: "",
    category: "Apps",
    quotedRupees: "50000",
    assignedMemberIds: [] as string[],
    deadline: "",
    status: "planning",
  });
  const [savingProject, setSavingProject] = useState(false);

  // Milestone Modal
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [milestoneForm, setMilestoneForm] = useState({ title: "", description: "", dueDate: "" });

  // Edit Milestone Modal
  const [editMilestoneModalOpen, setEditMilestoneModalOpen] = useState(false);
  const [milestoneEditForm, setMilestoneEditForm] = useState({
    id: "",
    projectId: "",
    title: "",
    description: "",
    dueDate: "",
    status: "pending",
  });
  const [savingMilestone, setSavingMilestone] = useState(false);

  // Payment Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    projectId: "",
    amountRupees: "20000",
    method: "UPI",
    reference: "",
  });

  // Edit Payment Modal
  const [editPaymentModalOpen, setEditPaymentModalOpen] = useState(false);
  const [paymentEditForm, setPaymentEditForm] = useState({
    id: "",
    amountRupees: "20000",
    method: "UPI",
    receivedDate: "",
    projectId: "",
    status: "received" as "received" | "pending" | "overdue",
    reference: "",
    notes: "",
  });
  const [savingPayment, setSavingPayment] = useState(false);

  // Expenses State (Studio vs Personal & Reimbursements)
  const [expenseTab, setExpenseTab] = useState<"studio" | "personal">("studio");
  const [expenseMemberFilter, setExpenseMemberFilter] = useState<string>("all");
  const [createExpenseModalOpen, setCreateExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    category: "tools",
    amountRupees: "2000",
    amountLeftRupees: "0",
    allocatedAmountRupees: "0",
    totalBudgetRupees: "0",
    memberCount: "4",
    selectedProjectId: "",
    date: new Date().toISOString().slice(0, 10),
    paidBy: "",
    memberId: "",
    expenseType: "studio" as "studio" | "personal",
    notes: "",
    allowOverpayment: false,
  });
  const [savingExpense, setSavingExpense] = useState(false);

  const [editExpenseModalOpen, setEditExpenseModalOpen] = useState(false);
  const [expenseEditForm, setExpenseEditForm] = useState({
    id: "",
    title: "",
    category: "tools",
    amountRupees: "2000",
    amountLeftRupees: "0",
    allocatedAmountRupees: "0",
    projectId: "",
    date: "",
    paidBy: "",
    memberId: "",
    expenseType: "studio" as "studio" | "personal",
    notes: "",
    isReimbursed: false,
    allowOverpayment: false,
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
    type: "inquiry" | "client" | "project" | "milestone" | "payment" | "expense";
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
      } else if (deleteTarget.type === "client") {
        endpoint = `/api/admin/clients?id=${deleteTarget.id}`;
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

  // Open Edit Client Modal
  const handleOpenEditClient = (c: AdminClient) => {
    setClientEditForm({
      id: c.id,
      name: c.name,
      email: c.email || "",
      phone: c.phone || "",
      company: c.company || (c as any).businessName || "",
      notes: c.notes || "",
      status: c.status || "active",
    });
    setEditClientModalOpen(true);
  };

  // Update Client
  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingClient(true);
    try {
      const res = await fetch("/api/admin/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientEditForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update client");
      toast.success("Client updated successfully!");
      setEditClientModalOpen(false);
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSavingClient(false);
    }
  };

  // Delete Client Confirm Prompt
  const handleDeleteClientConfirm = (c: AdminClient) => {
    setDeleteTarget({
      type: "client",
      id: c.id,
      title: `Delete client "${c.name}"?`,
      description: "Delete this client? This cannot be undone.",
      destructiveWarning: "Deleting this client is permanent and will dissociate associated projects.",
    });
    setDeleteConfirmOpen(true);
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

  // Open Edit Project
  const handleOpenEditProject = (p: AdminProject) => {
    setProjectEditForm({
      id: p.id,
      clientId: p.clientId,
      name: p.name || p.title || "",
      category: p.category || "Apps",
      quotedRupees: String(paiseToRupees(p.quotedAmountPaise || 0)),
      assignedMemberIds: p.assignedMemberIds || p.assignees?.map((a) => a.id) || [],
      deadline: p.deadline ? new Date(p.deadline).toISOString().slice(0, 10) : "",
      status: p.status || "planning",
    });
    setEditProjectModalOpen(true);
  };

  // Update Project
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProject(true);
    try {
      const quotedAmountPaise = rupeesToPaise(Number(projectEditForm.quotedRupees) || 0);
      const res = await fetch("/api/admin/business-projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: projectEditForm.id,
          clientId: projectEditForm.clientId,
          name: projectEditForm.name,
          category: projectEditForm.category,
          quotedAmountPaise,
          deadline: projectEditForm.deadline ? new Date(projectEditForm.deadline).toISOString() : null,
          status: projectEditForm.status,
          assignedMemberIds: projectEditForm.assignedMemberIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update project");
      toast.success("Project updated successfully!");
      setEditProjectModalOpen(false);
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSavingProject(false);
    }
  };

  // Delete Project Confirm
  const handleDeleteProjectConfirm = (p: AdminProject) => {
    // Check if project has payments
    const hasPayments = payments.some((pay) => pay.projectId === p.id);
    if (hasPayments) {
      toast.error("Cannot delete project with existing payments. Delete or reassign payments first, or set status to 'cancelled'.");
      return;
    }
    setDeleteTarget({
      type: "project",
      id: p.id,
      title: `Delete project "${p.name || p.title}"?`,
      description: "Delete this project? This cannot be undone.",
      destructiveWarning: "Deleting this project will permanently remove all associated milestones and member assignments.",
    });
    setDeleteConfirmOpen(true);
  };

  // Unassign Team Member from Project
  const handleUnassignMember = async (p: AdminProject, memberId: string) => {
    const currentIds = p.assignedMemberIds || p.assignees?.map((a) => a.id) || [];
    const newIds = currentIds.filter((id) => id !== memberId);
    try {
      const res = await fetch("/api/admin/business-projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: p.id,
          clientId: p.clientId,
          name: p.name || p.title,
          category: p.category,
          quotedAmountPaise: p.quotedAmountPaise,
          deadline: p.deadline,
          status: p.status,
          assignedMemberIds: newIds,
        }),
      });
      if (!res.ok) throw new Error("Failed to unassign member");
      toast.success("Team member unassigned!");
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

  // Open Edit Milestone
  const handleOpenEditMilestone = (m: AdminMilestone) => {
    setMilestoneEditForm({
      id: m.id,
      projectId: m.projectId,
      title: m.title,
      description: m.description || "",
      dueDate: m.dueDate ? new Date(m.dueDate).toISOString().slice(0, 10) : "",
      status: m.status,
    });
    setEditMilestoneModalOpen(true);
  };

  // Update Milestone
  const handleUpdateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMilestone(true);
    try {
      const res = await fetch("/api/admin/milestones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: milestoneEditForm.id,
          title: milestoneEditForm.title,
          description: milestoneEditForm.description || null,
          dueDate: milestoneEditForm.dueDate ? new Date(milestoneEditForm.dueDate).toISOString() : null,
          status: milestoneEditForm.status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update milestone");
      toast.success("Milestone updated!");
      setEditMilestoneModalOpen(false);
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSavingMilestone(false);
    }
  };

  // Delete Milestone Confirm
  const handleDeleteMilestoneConfirm = (m: AdminMilestone) => {
    setDeleteTarget({
      type: "milestone",
      id: m.id,
      title: `Delete milestone "${m.title}"?`,
      description: "Delete this milestone? Project progress % will recalculate automatically.",
    });
    setDeleteConfirmOpen(true);
  };

  // 3-Stage Toggle Milestone Status: Pending -> In Progress -> Done
  const handleToggleMilestone = async (id: string, currentStatus: string) => {
    try {
      const nextStatus =
        currentStatus === "pending"
          ? "in_progress"
          : currentStatus === "in_progress"
          ? "completed"
          : "pending";

      const res = await fetch("/api/admin/milestones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to update milestone");
      const label = nextStatus === "completed" ? "Done" : nextStatus === "in_progress" ? "In Progress" : "Pending";
      toast.success(`Milestone set to ${label}!`);
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

  // Open Edit Payment Modal
  const handleOpenEditPayment = (p: AdminPayment) => {
    setPaymentEditForm({
      id: p.id,
      amountRupees: String(paiseToRupees(p.amountPaise)),
      method: p.method || "UPI",
      receivedDate: p.paidAt ? new Date(p.paidAt).toISOString().slice(0, 10) : "",
      projectId: p.projectId || "",
      status: ((p.status as any) || "received") as "received" | "pending" | "overdue",
      reference: p.reference || "",
      notes: (p as any).notes || "",
    });
    setEditPaymentModalOpen(true);
  };

  // Update Payment
  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPayment(true);
    try {
      const amountPaise = rupeesToPaise(Number(paymentEditForm.amountRupees) || 0);
      const res = await fetch("/api/admin/payments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: paymentEditForm.id,
          amountPaise,
          method: paymentEditForm.method,
          receivedDate: paymentEditForm.receivedDate ? new Date(paymentEditForm.receivedDate).toISOString() : null,
          projectId: paymentEditForm.projectId || null,
          status: paymentEditForm.status,
          reference: paymentEditForm.reference || null,
          notes: paymentEditForm.notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update payment");
      toast.success("Payment updated and project financials synced!");
      setEditPaymentModalOpen(false);
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSavingPayment(false);
    }
  };

  // Delete Payment Confirm
  const handleDeletePaymentConfirm = (p: AdminPayment) => {
    setDeleteTarget({
      type: "payment",
      id: p.id,
      title: `Delete payment of ${formatPaise(p.amountPaise)}?`,
      description: "This will reduce the project's Earned total and increase its Pending total.",
      destructiveWarning: "Deleting this payment will permanently remove the transaction record from the ledger.",
    });
    setDeleteConfirmOpen(true);
  };

  // Create Expense
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingExpense(true);
    try {
      const amountPaise = rupeesToPaise(Number(expenseForm.amountRupees) || 0);
      const allocatedAmountPaise =
        expenseForm.expenseType === "personal"
          ? rupeesToPaise(Number(expenseForm.allocatedAmountRupees) || 0)
          : 0;
      const res = await fetch("/api/admin/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: expenseForm.title,
          category: expenseForm.expenseType === "personal" ? "personal" : expenseForm.category,
          amountPaise,
          allocatedAmountPaise,
          allowOverpayment: expenseForm.allowOverpayment,
          date: expenseForm.date,
          paidBy: expenseForm.paidBy || null,
          projectId:
            expenseForm.selectedProjectId && expenseForm.selectedProjectId !== "custom"
              ? expenseForm.selectedProjectId
              : null,
          memberId: expenseForm.expenseType === "personal" ? expenseForm.memberId || null : null,
          expenseType: expenseForm.expenseType,
          notes: expenseForm.notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add expense");
      toast.success("Expense recorded successfully!");
      setCreateExpenseModalOpen(false);
      setExpenseForm({
        title: "",
        category: "tools",
        amountRupees: "2000",
        amountLeftRupees: "0",
        allocatedAmountRupees: "0",
        totalBudgetRupees: "0",
        memberCount: "4",
        selectedProjectId: "",
        date: new Date().toISOString().slice(0, 10),
        paidBy: "",
        memberId: "",
        expenseType: "studio",
        notes: "",
        allowOverpayment: false,
      });
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSavingExpense(false);
    }
  };

  // Open Edit Expense
  const handleOpenEditExpense = (exp: AdminExpense) => {
    setExpenseEditForm({
      id: exp.id,
      title: exp.title,
      category: exp.category,
      amountRupees: String(paiseToRupees(exp.amountPaise)),
      amountLeftRupees: String(paiseToRupees(exp.amountLeftPaise || 0)),
      allocatedAmountRupees: String(paiseToRupees(exp.allocatedAmountPaise || 0)),
      projectId: exp.projectId || "",
      date: exp.date || (exp.paidAt ? new Date(exp.paidAt).toISOString().slice(0, 10) : ""),
      paidBy: exp.paidBy || "",
      memberId: exp.memberId || "",
      expenseType: (exp.expenseType || "studio") as "studio" | "personal",
      notes: exp.notes || exp.description || "",
      isReimbursed: !!exp.isReimbursed,
      allowOverpayment: false,
    });
    setEditExpenseModalOpen(true);
  };

  // Update Expense
  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingExpense(true);
    try {
      const amountPaise = rupeesToPaise(Number(expenseEditForm.amountRupees) || 0);
      const allocatedAmountPaise =
        expenseEditForm.expenseType === "personal"
          ? rupeesToPaise(Number(expenseEditForm.allocatedAmountRupees) || 0)
          : 0;
      const res = await fetch("/api/admin/expenses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: expenseEditForm.id,
          title: expenseEditForm.title,
          category: expenseEditForm.expenseType === "personal" ? "personal" : expenseEditForm.category,
          amountPaise,
          allocatedAmountPaise,
          allowOverpayment: expenseEditForm.allowOverpayment,
          date: expenseEditForm.date,
          paidBy: expenseEditForm.paidBy || null,
          projectId: expenseEditForm.projectId || null,
          memberId: expenseEditForm.expenseType === "personal" ? expenseEditForm.memberId || null : null,
          expenseType: expenseEditForm.expenseType,
          notes: expenseEditForm.notes || null,
          isReimbursed: expenseEditForm.isReimbursed,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update expense");
      toast.success("Expense updated!");
      setEditExpenseModalOpen(false);
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSavingExpense(false);
    }
  };

  // Toggle Reimbursed Status
  const handleToggleReimbursed = async (exp: AdminExpense) => {
    try {
      const nextState = !exp.isReimbursed;
      const res = await fetch("/api/admin/expenses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: exp.id,
          isReimbursed: nextState,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update reimbursement");
      toast.success(nextState ? "Marked as reimbursed!" : "Reimbursement reverted to pending!");
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // Delete Expense Confirm
  const handleDeleteExpenseConfirm = (exp: AdminExpense) => {
    setDeleteTarget({
      type: "expense",
      id: exp.id,
      title: `Delete expense "${exp.title}"?`,
      description: "Delete this expense record? This cannot be undone.",
    });
    setDeleteConfirmOpen(true);
  };

  // Export Expense CSV
  const handleExportExpenseCsv = (type: "studio" | "personal") => {
    window.open(`/api/admin/expenses?type=${type}&format=csv`, "_blank");
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
          <button
            onClick={() => setSubTab("payments")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === "payments" ? "bg-[#374BFF] text-white shadow-xs" : "text-[#14141A] hover:text-[#374BFF]"
            }`}
          >
            Payments Ledger
          </button>
        )}
        <button
          onClick={() => {
            setSubTab("expenses");
            if (!canViewFinance) setExpenseTab("personal");
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === "expenses" ? "bg-[#374BFF] text-white shadow-xs" : "text-[#14141A] hover:text-[#374BFF]"
          }`}
        >
          Expenses ({expenses.length})
        </button>
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
                  <div className="space-y-1">
                    <h4 className="font-heading text-sm font-bold text-[#14141A]">{c.name}</h4>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {c.company ? (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#374BFF] border border-blue-200/60 text-[10px] font-bold">
                          {c.company}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[10px] font-medium">
                          Not set
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold capitalize">
                      {c.status || "Active"}
                    </span>
                    <button
                      onClick={() => handleOpenEditClient(c)}
                      title="Edit Client"
                      className="p-1.5 rounded-lg border border-black/15 hover:border-[#374BFF] text-[#2B2B38] hover:text-[#374BFF] hover:bg-blue-50 transition-all cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClientConfirm(c)}
                      title="Delete Client"
                      className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-heading text-base font-bold text-[#14141A]">{p.name || p.title}</h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#374BFF]/10 text-[#374BFF]">
                        {p.category}
                      </span>
                      {/* Status Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        p.status === "delivered" || p.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : p.status === "development"
                          ? "bg-blue-100 text-[#374BFF]"
                          : p.status === "design"
                          ? "bg-cyan-100 text-cyan-800"
                          : p.status === "review"
                          ? "bg-purple-100 text-purple-700"
                          : p.status === "on_hold"
                          ? "bg-amber-100 text-amber-800"
                          : p.status === "cancelled"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-indigo-100 text-indigo-800"
                      }`}>
                        {p.status === "on_hold" ? "On Hold" : p.status || "Planning"}
                      </span>
                      {p.isOverdue && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                          Overdue
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#2B2B38] mt-1">
                      Client: <span className="font-bold text-[#14141A]">{p.clientName}</span>
                      {p.deadline && (
                        <span className="ml-2 text-[11px] text-[#2B2B38]">
                          • Deadline: {new Date(p.deadline).toLocaleDateString("en-IN")}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap">
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

                    <div className="flex items-center gap-1.5 pl-2 border-l border-black/10">
                      <button
                        onClick={() => handleOpenEditProject(p)}
                        className="p-1.5 rounded-lg border border-black/10 text-[#14141A] hover:border-[#374BFF] hover:text-[#374BFF] transition-all cursor-pointer"
                        title="Edit project"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      {(isOwner || canViewFinance) && (
                        <button
                          onClick={() => handleDeleteProjectConfirm(p)}
                          className="p-1.5 rounded-lg border border-black/10 text-rose-600 hover:border-rose-400 hover:bg-rose-50 transition-all cursor-pointer"
                          title="Delete project"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Team Assignees Section */}
                <div className="pt-2 border-t border-black/5 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold text-[#2B2B38]">Assignees:</span>
                    {p.assignees && p.assignees.length > 0 ? (
                      p.assignees.map((assignee) => (
                        <span
                          key={assignee.id}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-black/10 text-[11px] font-medium text-[#14141A]"
                        >
                          <span>{assignee.name}</span>
                          <button
                            onClick={() => handleUnassignMember(p, assignee.id)}
                            className="text-[#2B2B38] hover:text-rose-600 ml-0.5 cursor-pointer"
                            title={`Unassign ${assignee.name}`}
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-[#2B2B38]/60 italic">No assignees yet</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleOpenEditProject(p)}
                    className="text-[11px] font-bold text-[#374BFF] hover:underline cursor-pointer"
                  >
                    Manage Assignees
                  </button>
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
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                          m.status === "completed"
                            ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                            : m.status === "in_progress"
                            ? "bg-blue-50/70 border-blue-200 text-blue-900"
                            : "bg-white border-black/10 text-[#14141A]"
                        }`}
                      >
                        <div
                          onClick={() => handleToggleMilestone(m.id, m.status)}
                          className="flex-1 cursor-pointer pr-2 truncate"
                          title="Click to cycle status: Pending -> In Progress -> Done"
                        >
                          <span className="font-medium truncate block">{m.title}</span>
                          <span className="text-[10px] font-bold block mt-0.5">
                            {m.status === "completed" ? "✓ Done" : m.status === "in_progress" ? "⏳ In Progress" : "○ Pending"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleOpenEditMilestone(m)}
                            className="p-1 rounded hover:bg-black/5 text-[#2B2B38] hover:text-[#14141A] cursor-pointer"
                            title="Edit milestone"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteMilestoneConfirm(m)}
                            className="p-1 rounded hover:bg-rose-50 text-rose-600 cursor-pointer"
                            title="Delete milestone"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
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
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          p.status === "received"
                            ? "bg-emerald-100 text-emerald-700"
                            : p.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {p.status || "Received"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handlePrintReceipt(p)}
                          title="Print Receipt"
                          className="p-1.5 rounded-lg border border-black/15 hover:border-[#374BFF] text-[#374BFF] hover:bg-blue-50 transition-all cursor-pointer"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>
                        {canViewFinance && (
                          <>
                            <button
                              onClick={() => handleOpenEditPayment(p)}
                              title="Edit Payment"
                              className="p-1.5 rounded-lg border border-black/15 hover:border-[#374BFF] text-[#2B2B38] hover:text-[#374BFF] hover:bg-blue-50 transition-all cursor-pointer"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePaymentConfirm(p)}
                              title="Delete Payment"
                              className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB: EXPENSES (STUDIO VS PERSONAL & REIMBURSEMENTS) */}
      {subTab === "expenses" && (
        <div className="space-y-6">
          {/* Inner Expenses Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-black/10 shadow-xs">
            <div className="flex items-center gap-2">
              {canViewFinance && (
                <button
                  onClick={() => setExpenseTab("studio")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    expenseTab === "studio"
                      ? "bg-[#14141A] text-white shadow-xs"
                      : "text-[#2B2B38] hover:text-[#14141A] bg-[#F5F6FC]"
                  }`}
                >
                  🏢 Studio Expenses (
                  {expenses.filter((e) => (e.expenseType || "studio") === "studio").length}
                  )
                </button>
              )}
              <button
                onClick={() => setExpenseTab("personal")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  expenseTab === "personal"
                    ? "bg-[#14141A] text-white shadow-xs"
                    : "text-[#2B2B38] hover:text-[#14141A] bg-[#F5F6FC]"
                }`}
              >
                👤 Personal Expenses & Reimbursements (
                {expenses.filter((e) => e.expenseType === "personal").length}
                )
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportExpenseCsv(expenseTab)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-black/15 bg-white text-[#14141A] text-xs font-bold hover:border-[#374BFF] hover:text-[#374BFF] transition-all cursor-pointer"
              >
                <Download className="h-4 w-4" /> Export {expenseTab === "studio" ? "Studio" : "Personal"} CSV
              </button>
              <button
                onClick={() => {
                  const defaultProj = projects[0];
                  const defaultBudget = defaultProj ? paiseToRupees(defaultProj.quotedAmountPaise) : 20000;
                  const defaultMembers = defaultProj?.assignees?.length || 4;
                  const defaultAlloc = Math.floor(defaultBudget / defaultMembers);

                  setExpenseForm({
                    title: defaultProj?.title || defaultProj?.name || "",
                    category: "tools",
                    amountRupees: "2000",
                    amountLeftRupees: "0",
                    allocatedAmountRupees: String(defaultAlloc),
                    totalBudgetRupees: String(defaultBudget),
                    memberCount: String(defaultMembers),
                    selectedProjectId: defaultProj ? defaultProj.id : "custom",
                    date: new Date().toISOString().slice(0, 10),
                    paidBy: "",
                    memberId: teamMembers[0]?.userId || teamMembers[0]?.id || "",
                    expenseType: expenseTab,
                    notes: "",
                    allowOverpayment: false,
                  });
                  setCreateExpenseModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add {expenseTab === "studio" ? "Studio" : "Personal"} Expense
              </button>
            </div>
          </div>

          {/* VIEW: STUDIO EXPENSES */}
          {expenseTab === "studio" && canViewFinance && (
            <div className="rounded-3xl bg-white border border-black/10 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#14141A]">
                    Studio Operational Expenses
                  </h3>
                  <p className="text-xs text-[#2B2B38]">
                    Deducted from Total Earned to calculate Net Studio Profit.
                  </p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-[#F5F6FC] border border-black/10">
                  <span className="text-[10px] font-bold uppercase text-[#2B2B38] block">
                    Total Studio Spend
                  </span>
                  <span className="font-mono font-bold text-sm text-red-600">
                    {formatPaise(
                      expenses
                        .filter((e) => (e.expenseType || "studio") === "studio")
                        .reduce((sum, e) => sum + e.amountPaise, 0)
                    )}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-black/10 text-[#2B2B38] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Title / Description</th>
                      <th className="py-3 px-3">Paid By</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {expenses
                      .filter((e) => (e.expenseType || "studio") === "studio")
                      .map((e) => (
                        <tr key={e.id} className="hover:bg-[#F5F6FC]">
                          <td className="py-3 px-3">
                            {e.paidAt ? new Date(e.paidAt).toLocaleDateString("en-IN") : "N/A"}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize bg-blue-50 text-blue-700">
                              {e.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-bold text-[#14141A]">
                            {e.title}
                            {e.notes && <span className="block text-[11px] font-normal text-[#2B2B38]">{e.notes}</span>}
                          </td>
                          <td className="py-3 px-3 text-[#2B2B38]">{e.paidBy || "Studio"}</td>
                          <td className="py-3 px-3 font-mono font-bold text-red-600">
                            {formatPaise(e.amountPaise)}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditExpense(e)}
                                title="Edit Expense"
                                className="p-1.5 rounded-lg border border-black/15 hover:border-[#374BFF] text-[#2B2B38] hover:text-[#374BFF] hover:bg-blue-50 transition-all cursor-pointer"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteExpenseConfirm(e)}
                                title="Delete Expense"
                                className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
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

          {/* VIEW: PERSONAL EXPENSES & REIMBURSEMENTS */}
          {expenseTab === "personal" && (
            <div className="space-y-6">
              {/* REIMBURSEMENT TRACKER SUMMARY CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-3xl bg-amber-50/70 border border-amber-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                    ⏳ Unreimbursed Pending
                  </span>
                  <p className="mt-2 font-mono text-2xl font-black text-amber-700">
                    {formatPaise(
                      expenses
                        .filter((e) => e.expenseType === "personal" && !e.isReimbursed)
                        .reduce((sum, e) => sum + e.amountPaise, 0)
                    )}
                  </p>
                  <span className="text-[10px] text-amber-800/80 mt-0.5 block">
                    Awaiting studio reimbursement payment
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-emerald-50/70 border border-emerald-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 block">
                    ✓ Total Reimbursed
                  </span>
                  <p className="mt-2 font-mono text-2xl font-black text-emerald-700">
                    {formatPaise(
                      expenses
                        .filter((e) => e.expenseType === "personal" && e.isReimbursed)
                        .reduce((sum, e) => sum + e.amountPaise, 0)
                    )}
                  </p>
                  <span className="text-[10px] text-emerald-800/80 mt-0.5 block">
                    Cleared and reimbursed to team
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-white border border-black/10">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#2B2B38] block">
                    📋 Total Personal Submissions
                  </span>
                  <p className="mt-2 font-heading text-2xl font-black text-[#14141A]">
                    {expenses.filter((e) => e.expenseType === "personal").length}
                  </p>
                  <span className="text-[10px] text-[#2B2B38] mt-0.5 block">
                    Tracked separately from Studio Profit
                  </span>
                </div>
              </div>

              {/* PER-MEMBER BREAKDOWN PILLS */}
              {canViewFinance && (
                <div className="p-4 rounded-2xl bg-white border border-black/10 space-y-2">
                  <span className="text-xs font-bold text-[#14141A] block">
                    Member Reimbursement Balances:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {teamMembers.map((tm) => {
                      const mExps = expenses.filter(
                        (e) =>
                          e.expenseType === "personal" &&
                          (e.memberId === tm.id || (tm.userId && e.memberId === tm.userId))
                      );
                      const pending = mExps.filter((e) => !e.isReimbursed).reduce((s, e) => s + e.amountPaise, 0);
                      const cleared = mExps.filter((e) => e.isReimbursed).reduce((s, e) => s + e.amountPaise, 0);
                      if (mExps.length === 0) return null;
                      return (
                        <div
                          key={tm.id}
                          className="px-3 py-1.5 rounded-xl border border-black/10 bg-[#F5F6FC] text-xs flex items-center gap-2"
                        >
                          <span className="font-bold text-[#14141A]">{tm.name}:</span>
                          <span className="font-mono text-amber-700 font-medium">Pending: {formatPaise(pending)}</span>
                          <span className="text-black/20">•</span>
                          <span className="font-mono text-emerald-700 font-medium">Paid: {formatPaise(cleared)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PERSONAL EXPENSES TABLE */}
              <div className="rounded-3xl bg-white border border-black/10 p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="font-heading text-lg font-bold text-[#14141A]">
                    Personal Expense Submissions
                  </h3>

                  {canViewFinance && (
                    <div className="flex items-center gap-2">
                      <Filter className="h-3.5 w-3.5 text-[#2B2B38]" />
                      <select
                        value={expenseMemberFilter}
                        onChange={(e) => setExpenseMemberFilter(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                      >
                        <option value="all">All Members</option>
                        {teamMembers.map((tm) => (
                          <option key={tm.id} value={tm.userId || tm.id}>
                            {tm.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-black/10 text-[#2B2B38] font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3">Member</th>
                        <th className="py-3 px-3">Project Name</th>
                        <th className="py-3 px-3">Allocated Amount</th>
                        <th className="py-3 px-3">Amount Paid</th>
                        <th className="py-3 px-3">Amount Left to Pay</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {expenses
                        .filter((e) => {
                          if (e.expenseType !== "personal") return false;
                          if (expenseMemberFilter !== "all") {
                            const selectedMember = teamMembers.find(
                              (m) => m.id === expenseMemberFilter || m.userId === expenseMemberFilter
                            );
                            const matches =
                              e.memberId === expenseMemberFilter ||
                              (selectedMember &&
                                (e.memberId === selectedMember.id ||
                                  (selectedMember.userId && e.memberId === selectedMember.userId)));
                            if (!matches) return false;
                          }
                          return true;
                        })
                        .map((e) => (
                          <tr key={e.id} className="hover:bg-[#F5F6FC]">
                            <td className="py-3 px-3">
                              {e.paidAt ? new Date(e.paidAt).toLocaleDateString("en-IN") : "N/A"}
                            </td>
                            <td className="py-3 px-3 font-medium text-[#14141A]">
                              {e.memberName || e.paidBy || "Team Member"}
                            </td>
                            <td className="py-3 px-3 font-bold text-[#14141A]">
                              {e.title}
                              {e.notes && <span className="block text-[11px] font-normal text-[#2B2B38]">{e.notes}</span>}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-[#374BFF]">
                              {e.allocatedAmountPaise ? formatPaise(e.allocatedAmountPaise) : "—"}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-red-600">
                              {formatPaise(e.amountPaise)}
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-amber-700">
                              {formatPaise(e.amountLeftPaise || 0)}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                  (e.amountLeftPaise === 0 || e.isReimbursed)
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {(e.amountLeftPaise === 0 || e.isReimbursed) ? "✓ Cleared" : "⏳ Pending"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {canViewFinance && (
                                  <button
                                    onClick={() => handleToggleReimbursed(e)}
                                    title={e.isReimbursed ? "Revert to Pending" : "Mark as Reimbursed"}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                                      e.isReimbursed
                                        ? "border border-black/15 text-[#2B2B38] hover:bg-black/5"
                                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                                    }`}
                                  >
                                    {e.isReimbursed ? (
                                      <>
                                        <RotateCcw className="h-3 w-3" /> Revert
                                      </>
                                    ) : (
                                      <>
                                        <Check className="h-3 w-3" /> Reimburse
                                      </>
                                    )}
                                  </button>
                                )}
                                <button
                                  onClick={() => handleOpenEditExpense(e)}
                                  title="Edit Expense"
                                  className="p-1.5 rounded-lg border border-black/15 hover:border-[#374BFF] text-[#2B2B38] hover:text-[#374BFF] hover:bg-blue-50 transition-all cursor-pointer"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteExpenseConfirm(e)}
                                  title="Delete Expense"
                                  className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
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
            </div>
          )}
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
                <label className="text-xs font-bold text-[#14141A]">Type</label>
                <select
                  value={clientForm.company}
                  onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                >
                  <option value="">Select Type (Optional)</option>
                  <option value="Company">Company</option>
                  <option value="Brand">Brand</option>
                  <option value="Startup">Startup</option>
                  <option value="Individual">Individual</option>
                </select>
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

      {/* MODAL: EDIT CLIENT */}
      {editClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-black/10 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-[#14141A]">Edit Client</h3>
              <button onClick={() => setEditClientModalOpen(false)} className="text-[#2B2B38] hover:text-[#14141A]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateClient} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#14141A]">Client Name *</label>
                <input
                  type="text"
                  required
                  value={clientEditForm.name}
                  onChange={(e) => setClientEditForm({ ...clientEditForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Email</label>
                  <input
                    type="email"
                    value={clientEditForm.email}
                    onChange={(e) => setClientEditForm({ ...clientEditForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Phone</label>
                  <input
                    type="text"
                    value={clientEditForm.phone}
                    onChange={(e) => setClientEditForm({ ...clientEditForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Type</label>
                  <select
                    value={clientEditForm.company}
                    onChange={(e) => setClientEditForm({ ...clientEditForm, company: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  >
                    <option value="">Select Type (Optional)</option>
                    {clientEditForm.company && !["Company", "Brand", "Startup", "Individual"].includes(clientEditForm.company) && (
                      <option value={clientEditForm.company}>{clientEditForm.company} (Legacy)</option>
                    )}
                    <option value="Company">Company</option>
                    <option value="Brand">Brand</option>
                    <option value="Startup">Startup</option>
                    <option value="Individual">Individual</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Status</label>
                  <select
                    value={clientEditForm.status}
                    onChange={(e) => setClientEditForm({ ...clientEditForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#14141A]">Notes</label>
                <textarea
                  rows={2}
                  value={clientEditForm.notes}
                  onChange={(e) => setClientEditForm({ ...clientEditForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditClientModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-black/15 text-xs font-bold text-[#14141A] hover:bg-[#F5F6FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingClient}
                  className="flex-1 py-2.5 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {savingClient ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                </button>
              </div>
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

      {/* MODAL: EDIT PROJECT */}
      {editProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-black/10 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-[#14141A]">Edit Project</h3>
              <button onClick={() => setEditProjectModalOpen(false)} className="text-[#2B2B38] hover:text-[#14141A]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateProject} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#14141A]">Client *</label>
                <select
                  required
                  value={projectEditForm.clientId}
                  onChange={(e) => setProjectEditForm({ ...projectEditForm, clientId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                >
                  <option value="">Select a Client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.company || "Direct"})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-[#14141A]">Project Name *</label>
                <input
                  type="text"
                  required
                  value={projectEditForm.name}
                  onChange={(e) => setProjectEditForm({ ...projectEditForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Category *</label>
                  <select
                    value={projectEditForm.category}
                    onChange={(e) => setProjectEditForm({ ...projectEditForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  >
                    <option value="Apps">Apps</option>
                    <option value="Web">Web</option>
                    <option value="NFC">NFC</option>
                    <option value="QR menu">QR menu</option>
                    <option value="ML">ML</option>
                    <option value="Robotics">Robotics</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Status *</label>
                  <select
                    value={projectEditForm.status}
                    onChange={(e) => setProjectEditForm({ ...projectEditForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  >
                    <option value="planning">Planning</option>
                    <option value="design">Design</option>
                    <option value="development">Development</option>
                    <option value="review">Review</option>
                    <option value="delivered">Delivered</option>
                    <option value="on_hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Quoted Amount (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={projectEditForm.quotedRupees}
                    onChange={(e) => setProjectEditForm({ ...projectEditForm, quotedRupees: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Deadline</label>
                  <input
                    type="date"
                    value={projectEditForm.deadline}
                    onChange={(e) => setProjectEditForm({ ...projectEditForm, deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#14141A]">Assign Team Members</label>
                <div className="grid grid-cols-2 gap-1.5 mt-1 max-h-40 overflow-y-auto p-1">
                  {teamMembers.map((tm) => (
                    <label key={tm.id} className="flex items-center gap-2 text-xs text-[#14141A] p-2 rounded-lg bg-[#F5F6FC]">
                      <input
                        type="checkbox"
                        checked={projectEditForm.assignedMemberIds.includes(tm.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setProjectEditForm((prev) => ({
                            ...prev,
                            assignedMemberIds: checked
                              ? [...prev.assignedMemberIds, tm.id]
                              : prev.assignedMemberIds.filter((id) => id !== tm.id),
                          }));
                        }}
                      />
                      <span className="truncate">{tm.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditProjectModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-black/15 text-xs font-bold text-[#14141A] hover:bg-[#F5F6FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProject}
                  className="flex-1 py-2.5 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {savingProject ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Project"}
                </button>
              </div>
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

      {/* MODAL: EDIT MILESTONE */}
      {editMilestoneModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-black/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-[#14141A]">Edit Milestone</h3>
              <button onClick={() => setEditMilestoneModalOpen(false)} className="text-[#2B2B38] hover:text-[#14141A]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateMilestone} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#14141A]">Milestone Title *</label>
                <input
                  type="text"
                  required
                  value={milestoneEditForm.title}
                  onChange={(e) => setMilestoneEditForm({ ...milestoneEditForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#14141A]">Description</label>
                <textarea
                  rows={2}
                  value={milestoneEditForm.description}
                  onChange={(e) => setMilestoneEditForm({ ...milestoneEditForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Status *</label>
                  <select
                    value={milestoneEditForm.status}
                    onChange={(e) => setMilestoneEditForm({ ...milestoneEditForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Due Date</label>
                  <input
                    type="date"
                    value={milestoneEditForm.dueDate}
                    onChange={(e) => setMilestoneEditForm({ ...milestoneEditForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditMilestoneModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-black/15 text-xs font-bold text-[#14141A] hover:bg-[#F5F6FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMilestone}
                  className="flex-1 py-2.5 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {savingMilestone ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Milestone"}
                </button>
              </div>
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

      {/* MODAL: EDIT PAYMENT */}
      {editPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-black/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-[#14141A]">Edit Payment</h3>
              <button onClick={() => setEditPaymentModalOpen(false)} className="text-[#2B2B38] hover:text-[#14141A]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdatePayment} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#14141A]">Project</label>
                <select
                  value={paymentEditForm.projectId}
                  onChange={(e) => setPaymentEditForm({ ...paymentEditForm, projectId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                >
                  <option value="">None / Independent</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name || p.title} ({p.clientName || "Client"})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={paymentEditForm.amountRupees}
                    onChange={(e) => setPaymentEditForm({ ...paymentEditForm, amountRupees: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-bold font-mono focus:outline-none focus:border-[#374BFF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Status *</label>
                  <select
                    value={paymentEditForm.status}
                    onChange={(e) => setPaymentEditForm({ ...paymentEditForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  >
                    <option value="received">Received</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Payment Method *</label>
                  <select
                    value={paymentEditForm.method}
                    onChange={(e) => setPaymentEditForm({ ...paymentEditForm, method: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  >
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="Bank Transfer">NEFT / IMPS / Bank</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Date</label>
                  <input
                    type="date"
                    value={paymentEditForm.receivedDate}
                    onChange={(e) => setPaymentEditForm({ ...paymentEditForm, receivedDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#14141A]">Transaction Reference</label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref / UTR / Cheque No."
                  value={paymentEditForm.reference}
                  onChange={(e) => setPaymentEditForm({ ...paymentEditForm, reference: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditPaymentModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-black/15 text-xs font-bold text-[#14141A] hover:bg-[#F5F6FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPayment}
                  className="flex-1 py-2.5 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {savingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                </button>
              </div>
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

      {/* MODAL: CREATE EXPENSE */}
      {createExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-black/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-[#14141A]">
                Record {expenseForm.expenseType === "studio" ? "Studio" : "Personal"} Expense
              </h3>
              <button onClick={() => setCreateExpenseModalOpen(false)} className="text-[#2B2B38] hover:text-[#14141A]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateExpense} className="space-y-3">
              {canViewFinance && (
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Expense Classification *</label>
                  <select
                    value={expenseForm.expenseType}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        expenseType: e.target.value as "studio" | "personal",
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  >
                    <option value="studio">🏢 Studio Operational Expense (Deducted from Profit)</option>
                    <option value="personal">👤 Personal Expense (Reimbursable to Member)</option>
                  </select>
                </div>
              )}

              {expenseForm.expenseType === "personal" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-[#14141A]">Team Member *</label>
                    <select
                      value={expenseForm.memberId}
                      onChange={(e) => setExpenseForm({ ...expenseForm, memberId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                    >
                      <option value="">Select Member</option>
                      {teamMembers.map((tm) => (
                        <option key={tm.id} value={tm.userId || tm.id}>
                          {tm.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#14141A]">Project Selection *</label>
                    <select
                      value={expenseForm.selectedProjectId}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "custom") {
                          setExpenseForm({
                            ...expenseForm,
                            selectedProjectId: "custom",
                            title: "",
                            totalBudgetRupees: "20000",
                            memberCount: "4",
                            allocatedAmountRupees: "5000",
                          });
                        } else {
                          const selProj = projects.find((p) => p.id === val);
                          if (selProj) {
                            const budgetRupees = paiseToRupees(selProj.quotedAmountPaise);
                            const count = selProj.assignees?.length || 4;
                            const alloc = Math.floor(budgetRupees / Math.max(1, count));
                            setExpenseForm({
                              ...expenseForm,
                              selectedProjectId: selProj.id,
                              title: selProj.title || selProj.name || "",
                              totalBudgetRupees: String(budgetRupees),
                              memberCount: String(count),
                              allocatedAmountRupees: String(alloc),
                            });
                          }
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                    >
                      <option value="">-- Choose Existing CRM Project --</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title || p.name} (Budget: ₹{paiseToRupees(p.quotedAmountPaise).toLocaleString("en-IN")})
                        </option>
                      ))}
                      <option value="custom">-- Custom / Other Project --</option>
                    </select>
                  </div>

                  {expenseForm.selectedProjectId === "custom" && (
                    <div>
                      <label className="text-xs font-bold text-[#14141A]">Project Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Website Redesign or Saathi"
                        value={expenseForm.title}
                        onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                      />
                    </div>
                  )}

                  {/* PROJECT BUDGET & MEMBER DIVISION */}
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-[#F5F6FC] border border-black/10">
                    <div>
                      <label className="text-[11px] font-bold text-[#14141A]">Total Project Budget (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={expenseForm.totalBudgetRupees}
                        onChange={(e) => {
                          const newBudget = e.target.value;
                          const count = Math.max(1, Number(expenseForm.memberCount) || 1);
                          const alloc = Math.floor((Number(newBudget) || 0) / count);
                          setExpenseForm({
                            ...expenseForm,
                            totalBudgetRupees: newBudget,
                            allocatedAmountRupees: String(alloc),
                          });
                        }}
                        className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-black/15 bg-white text-xs font-mono font-bold focus:outline-none focus:border-[#374BFF]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#14141A]">Divide Among Members</label>
                      <input
                        type="number"
                        min="1"
                        value={expenseForm.memberCount}
                        onChange={(e) => {
                          const newCount = e.target.value;
                          const budget = Number(expenseForm.totalBudgetRupees) || 0;
                          const alloc = Math.floor(budget / Math.max(1, Number(newCount) || 1));
                          setExpenseForm({
                            ...expenseForm,
                            memberCount: newCount,
                            allocatedAmountRupees: String(alloc),
                          });
                        }}
                        className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-black/15 bg-white text-xs font-mono font-bold focus:outline-none focus:border-[#374BFF]"
                      />
                    </div>
                    <div className="col-span-2 pt-1 text-[11px] text-[#2B2B38] flex items-center justify-between border-t border-black/5">
                      <span>Individual Allocation:</span>
                      <span className="font-mono font-bold text-[#374BFF]">
                        ₹{Number(expenseForm.allocatedAmountRupees || 0).toLocaleString("en-IN")} per member
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#14141A]">Amount Paid (This Payment) (₹) *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={expenseForm.amountRupees}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amountRupees: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-bold font-mono focus:outline-none focus:border-[#374BFF]"
                    />
                  </div>

                  {/* SYSTEM-GENERATED READ-ONLY CALCULATION */}
                  {(() => {
                    const currentAllocRupees = Number(expenseForm.allocatedAmountRupees) || 0;
                    const currentPaymentRupees = Number(expenseForm.amountRupees) || 0;
                    const priorPaidPaise = expenses
                      .filter((e) => {
                        if (e.expenseType !== "personal") return false;
                        if (e.memberId !== expenseForm.memberId) return false;
                        if (expenseForm.selectedProjectId && expenseForm.selectedProjectId !== "custom" && e.projectId) {
                          return e.projectId === expenseForm.selectedProjectId;
                        }
                        return (
                          e.title &&
                          expenseForm.title &&
                          e.title.trim().toLowerCase() === expenseForm.title.trim().toLowerCase()
                        );
                      })
                      .reduce((sum, e) => sum + e.amountPaise, 0);
                    const priorPaidRupees = paiseToRupees(priorPaidPaise);
                    const totalPaidRupees = priorPaidRupees + currentPaymentRupees;
                    const amountLeftRupees = Math.max(0, currentAllocRupees - totalPaidRupees);
                    const isOverpaid = currentAllocRupees > 0 && totalPaidRupees > currentAllocRupees;
                    const excessRupees = isOverpaid ? totalPaidRupees - currentAllocRupees : 0;

                    return (
                      <div className="space-y-2">
                        <div className="p-3.5 rounded-2xl bg-white border border-black/10 space-y-2">
                          <span className="text-[11px] font-bold text-[#2B2B38] uppercase tracking-wider block">
                            Automatic Balance Calculation
                          </span>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-2 rounded-xl bg-[#F5F6FC] border border-black/5">
                              <span className="text-[10px] text-[#2B2B38] block">Allocated Amount</span>
                              <span className="text-xs font-bold font-mono text-[#374BFF]">
                                ₹{currentAllocRupees.toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="p-2 rounded-xl bg-[#F5F6FC] border border-black/5">
                              <span className="text-[10px] text-[#2B2B38] block">Total Paid</span>
                              <span className="text-xs font-bold font-mono text-[#14141A]">
                                ₹{totalPaidRupees.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[9px] text-[#2B2B38] block">
                                (Prior: ₹{priorPaidRupees.toLocaleString("en-IN")})
                              </span>
                            </div>
                            <div className="p-2 rounded-xl bg-[#F5F6FC] border border-black/5">
                              <span className="text-[10px] text-[#2B2B38] block">Amount Left</span>
                              <span
                                className={`text-xs font-bold font-mono ${
                                  amountLeftRupees === 0 ? "text-emerald-600 font-black" : "text-amber-700"
                                }`}
                              >
                                ₹{amountLeftRupees.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* OVERPAYMENT GUARD */}
                        {isOverpaid && (
                          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 space-y-2">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                              <p className="text-xs text-red-800">
                                <span className="font-bold">Overpayment detected:</span> Total paid (₹
                                {totalPaidRupees.toLocaleString("en-IN")}) exceeds allocation (₹
                                {currentAllocRupees.toLocaleString("en-IN")}) by ₹{excessRupees.toLocaleString("en-IN")}.
                              </p>
                            </div>
                            {canViewFinance && (
                              <label className="flex items-center gap-2 pt-1 text-xs font-bold text-red-900 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={expenseForm.allowOverpayment}
                                  onChange={(e) =>
                                    setExpenseForm({ ...expenseForm, allowOverpayment: e.target.checked })
                                  }
                                  className="rounded text-[#374BFF]"
                                />
                                I am an authorized admin and approve this overpayment
                              </label>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {expenseForm.expenseType === "studio" && (
                <>
                  <div>
                    <label className="text-xs font-bold text-[#14141A]">Expense Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Domain Renewal or Client Lunch"
                      value={expenseForm.title}
                      onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#14141A]">Category *</label>
                      <select
                        value={expenseForm.category}
                        onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                      >
                        <option value="tools">Tools / SaaS</option>
                        <option value="hosting">Hosting & Cloud</option>
                        <option value="domain">Domain</option>
                        <option value="software">Software License</option>
                        <option value="marketing">Marketing & Ads</option>
                        <option value="travel">Travel</option>
                        <option value="food">Food & Hospitality</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#14141A]">Amount (₹) *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={expenseForm.amountRupees}
                        onChange={(e) => setExpenseForm({ ...expenseForm, amountRupees: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-bold font-mono focus:outline-none focus:border-[#374BFF]"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Date</label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Paid By</label>
                  <input
                    type="text"
                    placeholder="e.g. Card / Cash / UPI"
                    value={expenseForm.paidBy}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paidBy: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#14141A]">Notes / Description</label>
                <textarea
                  rows={2}
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  placeholder="Optional details..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateExpenseModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-black/15 text-xs font-bold text-[#14141A] hover:bg-[#F5F6FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    savingExpense ||
                    (expenseForm.expenseType === "personal" &&
                      Number(expenseForm.allocatedAmountRupees || 0) > 0 &&
                      (Number(expenseForm.amountRupees || 0) +
                        paiseToRupees(
                          expenses
                            .filter((e) => {
                              if (e.expenseType !== "personal") return false;
                              if (e.memberId !== expenseForm.memberId) return false;
                              if (
                                expenseForm.selectedProjectId &&
                                expenseForm.selectedProjectId !== "custom" &&
                                e.projectId
                              ) {
                                return e.projectId === expenseForm.selectedProjectId;
                              }
                              return (
                                e.title &&
                                expenseForm.title &&
                                e.title.trim().toLowerCase() === expenseForm.title.trim().toLowerCase()
                              );
                            })
                            .reduce((sum, e) => sum + e.amountPaise, 0)
                        )) >
                        Number(expenseForm.allocatedAmountRupees) &&
                      !expenseForm.allowOverpayment)
                  }
                  className="flex-1 py-2.5 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {savingExpense ? <Loader2 className="h-4 w-4 animate-spin" /> : "Record Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT EXPENSE */}
      {editExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-black/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-[#14141A]">Edit Expense</h3>
              <button onClick={() => setEditExpenseModalOpen(false)} className="text-[#2B2B38] hover:text-[#14141A]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateExpense} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#14141A]">
                  {expenseEditForm.expenseType === "personal" ? "Project Name *" : "Title *"}
                </label>
                <input
                  type="text"
                  required
                  value={expenseEditForm.title}
                  onChange={(e) => setExpenseEditForm({ ...expenseEditForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                />
              </div>

              {expenseEditForm.expenseType === "studio" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#14141A]">Category *</label>
                    <select
                      value={expenseEditForm.category}
                      onChange={(e) => setExpenseEditForm({ ...expenseEditForm, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                    >
                      <option value="tools">Tools / SaaS</option>
                      <option value="hosting">Hosting & Cloud</option>
                      <option value="domain">Domain</option>
                      <option value="software">Software License</option>
                      <option value="marketing">Marketing & Ads</option>
                      <option value="travel">Travel</option>
                      <option value="food">Food & Hospitality</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#14141A]">Amount (₹) *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={expenseEditForm.amountRupees}
                      onChange={(e) => setExpenseEditForm({ ...expenseEditForm, amountRupees: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-bold font-mono focus:outline-none focus:border-[#374BFF]"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#14141A]">Individual Allocation (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={expenseEditForm.allocatedAmountRupees}
                        onChange={(e) =>
                          setExpenseEditForm({ ...expenseEditForm, allocatedAmountRupees: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-bold font-mono focus:outline-none focus:border-[#374BFF]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#14141A]">Amount Paid (₹) *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={expenseEditForm.amountRupees}
                        onChange={(e) =>
                          setExpenseEditForm({ ...expenseEditForm, amountRupees: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-bold font-mono focus:outline-none focus:border-[#374BFF]"
                      />
                    </div>
                  </div>

                  {(() => {
                    const currentAllocRupees = Number(expenseEditForm.allocatedAmountRupees) || 0;
                    const currentPaymentRupees = Number(expenseEditForm.amountRupees) || 0;
                    const priorPaidOtherPaise = expenses
                      .filter((e) => {
                        if (e.id === expenseEditForm.id) return false;
                        if (e.expenseType !== "personal") return false;
                        if (e.memberId !== expenseEditForm.memberId) return false;
                        if (expenseEditForm.projectId && e.projectId) {
                          return e.projectId === expenseEditForm.projectId;
                        }
                        return (
                          e.title &&
                          expenseEditForm.title &&
                          e.title.trim().toLowerCase() === expenseEditForm.title.trim().toLowerCase()
                        );
                      })
                      .reduce((sum, e) => sum + e.amountPaise, 0);
                    const priorPaidOtherRupees = paiseToRupees(priorPaidOtherPaise);
                    const totalPaidRupees = priorPaidOtherRupees + currentPaymentRupees;
                    const amountLeftRupees = Math.max(0, currentAllocRupees - totalPaidRupees);
                    const isOverpaid = currentAllocRupees > 0 && totalPaidRupees > currentAllocRupees;
                    const excessRupees = isOverpaid ? totalPaidRupees - currentAllocRupees : 0;

                    return (
                      <div className="space-y-2">
                        <div className="p-3 rounded-2xl bg-[#F5F6FC] border border-black/10 flex items-center justify-between text-xs font-bold">
                          <span>Amount Left to Pay:</span>
                          <span
                            className={
                              amountLeftRupees === 0
                                ? "text-emerald-600 font-mono font-black"
                                : "text-amber-700 font-mono"
                            }
                          >
                            ₹{amountLeftRupees.toLocaleString("en-IN")}
                          </span>
                        </div>
                        {isOverpaid && (
                          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 space-y-2">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                              <p className="text-xs text-red-800">
                                <span className="font-bold">Overpayment detected:</span> Exceeds allocation by ₹
                                {excessRupees.toLocaleString("en-IN")}.
                              </p>
                            </div>
                            {canViewFinance && (
                              <label className="flex items-center gap-2 pt-1 text-xs font-bold text-red-900 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={expenseEditForm.allowOverpayment}
                                  onChange={(e) =>
                                    setExpenseEditForm({
                                      ...expenseEditForm,
                                      allowOverpayment: e.target.checked,
                                    })
                                  }
                                  className="rounded text-[#374BFF]"
                                />
                                Authorize overpayment as admin
                              </label>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Date</label>
                  <input
                    type="date"
                    value={expenseEditForm.date}
                    onChange={(e) => setExpenseEditForm({ ...expenseEditForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#14141A]">Paid By</label>
                  <input
                    type="text"
                    value={expenseEditForm.paidBy}
                    onChange={(e) => setExpenseEditForm({ ...expenseEditForm, paidBy: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                  />
                </div>
              </div>

              {expenseEditForm.expenseType === "personal" && canViewFinance && (
                <div className="p-3 rounded-xl bg-[#F5F6FC] border border-black/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#14141A]">Reimbursement Cleared</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={expenseEditForm.isReimbursed}
                      onChange={(e) => setExpenseEditForm({ ...expenseEditForm, isReimbursed: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-[#14141A]">Notes</label>
                <textarea
                  rows={2}
                  value={expenseEditForm.notes}
                  onChange={(e) => setExpenseEditForm({ ...expenseEditForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditExpenseModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-black/15 text-xs font-bold text-[#14141A] hover:bg-[#F5F6FC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    savingExpense ||
                    (expenseEditForm.expenseType === "personal" &&
                      Number(expenseEditForm.allocatedAmountRupees || 0) > 0 &&
                      (Number(expenseEditForm.amountRupees || 0) +
                        paiseToRupees(
                          expenses
                            .filter((e) => {
                              if (e.id === expenseEditForm.id) return false;
                              if (e.expenseType !== "personal") return false;
                              if (e.memberId !== expenseEditForm.memberId) return false;
                              if (expenseEditForm.projectId && e.projectId) {
                                return e.projectId === expenseEditForm.projectId;
                              }
                              return (
                                e.title &&
                                expenseEditForm.title &&
                                e.title.trim().toLowerCase() === expenseEditForm.title.trim().toLowerCase()
                              );
                            })
                            .reduce((sum, e) => sum + e.amountPaise, 0)
                        )) >
                        Number(expenseEditForm.allocatedAmountRupees) &&
                      !expenseEditForm.allowOverpayment)
                  }
                  className="flex-1 py-2.5 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {savingExpense ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
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
