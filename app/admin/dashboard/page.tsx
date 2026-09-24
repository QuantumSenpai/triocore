"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  BarChart3, 
  Users, 
  FolderGit2, 
  Settings, 
  LogOut, 
  ExternalLink, 
  Sparkles,
  ShieldCheck,
  Globe,
  DollarSign,
  KeyRound,
  Eye,
  EyeOff,
  X,
  Lock,
  Loader2,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { toast } from "sonner";
import { signOut, useSession } from "@/lib/auth-client";
import { validatePassword } from "@/lib/password-rules";
import { OverviewTab } from "./components/overview-tab";
import { CrmTab } from "./components/crm-tab";
import { OperationsTab } from "./components/operations-tab";
import { CmsTab } from "./components/cms-tab";
import { DashboardSkeleton } from "./components/dashboard-skeleton";
import type {
  AdminInquiry,
  AdminClient,
  AdminProject,
  AdminPayment,
  AdminExpense,
  AdminTeamMember,
  AdminEmployee,
  AdminStat,
  AdminService,
  AdminPricingPlan,
  AdminShowcaseProject,
  AdminFaq,
  AdminFaqCategory,
  AdminLegalDoc,
  AdminNote,
  AdminFeedbackReport,
  AdminInvite,
  AdminSiteContent,
} from "@/types/admin";

type MainTab = "overview" | "crm" | "operations" | "cms";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: _sessionData, isPending: _sessionPending } = useSession();

  const [activeTab, setActiveTab] = useState<MainTab>("overview");
  const [loading, setLoading] = useState(true);

  // Core Data States
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [businessProjects, setBusinessProjects] = useState<AdminProject[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [expenses, setExpenses] = useState<AdminExpense[]>([]);
  const [teamMembers, setTeamMembers] = useState<AdminTeamMember[]>([]);
  const [employees, setEmployees] = useState<AdminEmployee[]>([]);
  const [stats, setStats] = useState<AdminStat[]>([]);
  const [services, setServices] = useState<AdminService[]>([]);
  const [pricing, setPricing] = useState<AdminPricingPlan[]>([]);
  const [showcaseProjects, setShowcaseProjects] = useState<AdminShowcaseProject[]>([]);
  const [faqs, setFaqs] = useState<AdminFaq[]>([]);
  const [faqCategories, setFaqCategories] = useState<AdminFaqCategory[]>([]);
  const [legalDocs, setLegalDocs] = useState<AdminLegalDoc[]>([]);
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [feedbackReports, setFeedbackReports] = useState<AdminFeedbackReport[]>([]);
  const [unreadFeedbackCount, setUnreadFeedbackCount] = useState(0);
  const [adminInvites, setAdminInvites] = useState<AdminInvite[]>([]);
  const [siteContent, setSiteContent] = useState<AdminSiteContent[]>([]);

  // User privileges
  const [userRole, setUserRole] = useState("owner");
  const [canViewFinance, setCanViewFinance] = useState(true);
  const [monthlyGoalPaise, setMonthlyGoalPaise] = useState(10000000); // default ₹1,00,000 = 10,000,000 paise

  // Change Password State
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const pwCheck = validatePassword(newPassword);
    if (!pwCheck.valid) {
      toast.error(pwCheck.error || "Password does not meet security requirements.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to change password.");
      } else {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setChangePasswordModalOpen(false);
      }
    } catch {
      toast.error("Network error changing password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const loadAllData = useCallback(async () => {
    try {
      // Stage 1: Load essential Overview tab data concurrently
      const [inqRes, projRes, payRes, expRes, setRes, fbRes] = await Promise.all([
        fetch("/api/admin/inquiries").then((r) => (r.ok ? r.json() : { inquiries: [] })),
        fetch("/api/admin/business-projects").then((r) => (r.ok ? r.json() : { projects: [] })),
        fetch("/api/admin/payments").then((r) => {
          if (r.status === 403) setCanViewFinance(false);
          return r.ok ? r.json() : { payments: [] };
        }),
        fetch("/api/admin/expenses").then((r) => (r.ok ? r.json() : { expenses: [] })),
        fetch("/api/admin/settings").then((r) => (r.ok ? r.json() : { settings: {} })),
        fetch("/api/admin/feedback").then((r) => (r.ok ? r.json() : { reports: [], unreadCount: 0 })),
      ]);

      setInquiries(inqRes.inquiries || []);
      setBusinessProjects(projRes.projects || []);
      setPayments(payRes.payments || []);
      setExpenses(expRes.expenses || []);
      setFeedbackReports(fbRes.reports || []);
      setUnreadFeedbackCount(fbRes.unreadCount || 0);
      if (setRes.settings?.monthly_goal_paise) {
        setMonthlyGoalPaise(Number(setRes.settings.monthly_goal_paise));
      }
      // Unlock Overview screen immediately as soon as Stage 1 completes
      setLoading(false);

      // Stage 2: Stream remaining tab data in parallel background batch
      const [
        clientRes,
        teamRes,
        empRes,
        statRes,
        servRes,
        priceRes,
        showRes,
        faqRes,
        faqCatRes,
        legalRes,
        notesRes,
        contRes,
        accessRes,
      ] = await Promise.all([
        fetch("/api/admin/clients").then((r) => (r.ok ? r.json() : { clients: [] })),
        fetch("/api/admin/team").then((r) => (r.ok ? r.json() : { members: [] })),
        fetch("/api/admin/employees").then((r) => (r.ok ? r.json() : { employees: [] })),
        fetch("/api/admin/stats").then((r) => (r.ok ? r.json() : { stats: [] })),
        fetch("/api/admin/services").then((r) => (r.ok ? r.json() : { services: [] })),
        fetch("/api/admin/pricing").then((r) => (r.ok ? r.json() : { plans: [] })),
        fetch("/api/admin/projects").then((r) => (r.ok ? r.json() : { projects: [] })),
        fetch("/api/admin/faqs").then((r) => (r.ok ? r.json() : { faqs: [] })),
        fetch("/api/admin/faq-categories").then((r) => (r.ok ? r.json() : { categories: [] })),
        fetch("/api/admin/legal").then((r) => (r.ok ? r.json() : { documents: [] })),
        fetch("/api/admin/notes").then((r) => (r.ok ? r.json() : { notes: [] })),
        fetch("/api/admin/content").then((r) => (r.ok ? r.json() : { content: [] })),
        fetch("/api/admin/team-access").then((r) => {
          if (r.status === 403) setUserRole("member");
          return r.ok ? r.json() : { members: [] };
        }),
      ]);

      setClients(clientRes.clients || []);
      setTeamMembers(teamRes.members || teamRes.team || []);
      setEmployees(empRes.employees || []);
      setStats(statRes.stats || []);
      setServices(servRes.services || []);
      setPricing(priceRes.plans || []);
      setShowcaseProjects(showRes.projects || []);
      setFaqs(faqRes.faqs || []);
      setFaqCategories(faqCatRes.categories || []);
      setLegalDocs(legalRes.documents || []);
      setNotes(notesRes.notes || []);
      setSiteContent(contRes.content || []);
      if (accessRes.members && accessRes.members.length > 0) {
        setUserRole("owner");
      }
    } catch (err) {
      console.error("Dashboard data fetch warning:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Aggregate Metrics in Paise
  const totalEarnedPaise = payments
    .filter((p) => p.status === "received")
    .reduce((sum, p) => sum + p.amountPaise, 0);

  const totalQuotedPaise = businessProjects.reduce((sum, p) => sum + p.quotedAmountPaise, 0);
  const totalPendingPaise = Math.max(0, totalQuotedPaise - totalEarnedPaise);

  const totalStudioExpensesPaise = expenses
    .filter((e) => (e.expenseType || "studio") === "studio")
    .reduce((sum, e) => sum + e.amountPaise, 0);

  // Category-wise earnings
  const categoryEarnings: Record<string, number> = {};
  for (const proj of businessProjects) {
    const projCategory = proj.category || "General";
    const projCollected = payments
      .filter((p) => p.projectId === proj.id && p.status === "received")
      .reduce((sum, p) => sum + p.amountPaise, 0);
    categoryEarnings[projCategory] = (categoryEarnings[projCategory] || 0) + projCollected;
  }

  const handleUpdateGoal = async (newGoalPaise: number) => {
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "monthly_goal_paise", value: String(newGoalPaise) }),
    });
    setMonthlyGoalPaise(newGoalPaise);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#F5F6FC] text-[#14141A] flex flex-col font-sans pb-16 lg:pb-0">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-black/10 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size="sm" />
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#374BFF]/10 text-[#374BFF] text-[10px] font-black uppercase tracking-wider">
            <ShieldCheck className="h-3 w-3" />
            TrioCore OS
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-2xl bg-[#F5F6FC] border border-black/10">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "overview" ? "bg-[#374BFF] text-white shadow-xs" : "text-[#14141A] hover:text-[#374BFF]"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("crm")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "crm" ? "bg-[#374BFF] text-white shadow-xs" : "text-[#14141A] hover:text-[#374BFF]"
            }`}
          >
            Business & CRM
          </button>
          <button
            onClick={() => setActiveTab("operations")}
            className={`relative px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "operations" ? "bg-[#374BFF] text-white shadow-xs" : "text-[#14141A] hover:text-[#374BFF]"
            }`}
          >
            Operations & Team
            {unreadFeedbackCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[9px] font-black">
                {unreadFeedbackCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("cms")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "cms" ? "bg-[#374BFF] text-white shadow-xs" : "text-[#14141A] hover:text-[#374BFF]"
            }`}
          >
            Website CMS
          </button>
        </nav>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[#374BFF] hover:underline"
          >
            <span>Live Site</span>
            <ExternalLink className="h-3 w-3" />
          </a>

          <button
            onClick={() => setChangePasswordModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/15 bg-white text-xs font-bold text-[#14141A] hover:bg-[#F5F6FC] transition-all cursor-pointer"
            title="Change Password"
          >
            <KeyRound className="h-3.5 w-3.5 text-[#374BFF]" />
            <span>Change Password</span>
          </button>

          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/15 bg-white text-xs font-bold text-red-600 hover:bg-red-50 transition-all cursor-pointer"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {activeTab === "overview" && (
              <OverviewTab
                earnedPaise={totalEarnedPaise}
                pendingPaise={totalPendingPaise}
                goalPaise={monthlyGoalPaise}
                projectsCount={businessProjects.length}
                inquiriesCount={inquiries.length}
                projects={businessProjects}
                categoryEarnings={categoryEarnings}
                onUpdateGoal={handleUpdateGoal}
                studioExpensesPaise={totalStudioExpensesPaise}
              />
            )}

            {activeTab === "crm" && (
              <CrmTab
                inquiries={inquiries}
                clients={clients}
                projects={businessProjects}
                payments={payments}
                expenses={expenses}
                teamMembers={teamMembers}
                canViewFinance={canViewFinance}
                isOwner={userRole === "owner"}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === "operations" && (
              <OperationsTab
                reports={feedbackReports}
                unreadCount={unreadFeedbackCount}
                notes={notes}
                teamMembers={teamMembers}
                adminInvites={adminInvites}
                isOwner={userRole === "owner"}
                onRefresh={loadAllData}
              />
            )}

            {activeTab === "cms" && (
              <CmsTab
                initialContent={siteContent}
                services={services}
                pricing={pricing}
                stats={stats}
                projects={showcaseProjects}
                team={teamMembers}
                employees={employees}
                faqs={faqs}
                faqCategories={faqCategories}
                legalDocs={legalDocs}
                onRefresh={loadAllData}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (<1024px) */}
      <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-white border-t border-black/10 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex flex-col items-center justify-center min-w-[60px] min-h-[44px] py-1 text-[10px] font-bold ${
            activeTab === "overview" ? "text-[#374BFF]" : "text-[#2B2B38]"
          }`}
        >
          <BarChart3 className="h-5 w-5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("crm")}
          className={`flex flex-col items-center justify-center min-w-[60px] min-h-[44px] py-1 text-[10px] font-bold ${
            activeTab === "crm" ? "text-[#374BFF]" : "text-[#2B2B38]"
          }`}
        >
          <FolderGit2 className="h-5 w-5" />
          <span>CRM</span>
        </button>

        <button
          onClick={() => setActiveTab("operations")}
          className={`relative flex flex-col items-center justify-center min-w-[60px] min-h-[44px] py-1 text-[10px] font-bold ${
            activeTab === "operations" ? "text-[#374BFF]" : "text-[#2B2B38]"
          }`}
        >
          <Users className="h-5 w-5" />
          <span>Operations</span>
          {unreadFeedbackCount > 0 && (
            <span className="absolute top-1 right-2 px-1 rounded-full bg-red-500 text-white text-[8px] font-black">
              {unreadFeedbackCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("cms")}
          className={`flex flex-col items-center justify-center min-w-[60px] min-h-[44px] py-1 text-[10px] font-bold ${
            activeTab === "cms" ? "text-[#374BFF]" : "text-[#2B2B38]"
          }`}
        >
          <Globe className="h-5 w-5" />
          <span>CMS</span>
        </button>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      {changePasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-black/10 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-black/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-[#374BFF]/10 flex items-center justify-center text-[#374BFF]">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-[#14141A]">
                    Change Password
                  </h3>
                  <p className="text-[11px] text-[#2B2B38]">
                    Min 12 chars, no common words
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChangePasswordModalOpen(false)}
                className="text-[#2B2B38] hover:text-[#14141A]"
                aria-label="Close change password modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#14141A]">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-black/15 bg-[#F5F6FC] text-[#14141A] font-medium focus:outline-none focus:border-[#374BFF]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    aria-label={showCurrent ? "Hide current password" : "Show current password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2B2B38] hover:text-[#14141A] cursor-pointer"
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#14141A]">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 12 chars, strong password"
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-black/15 bg-[#F5F6FC] text-[#14141A] font-medium focus:outline-none focus:border-[#374BFF]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    aria-label={showNew ? "Hide new password" : "Show new password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2B2B38] hover:text-[#14141A] cursor-pointer"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#14141A]">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-black/15 bg-[#F5F6FC] text-[#14141A] font-medium focus:outline-none focus:border-[#374BFF]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2B2B38] hover:text-[#14141A] cursor-pointer"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex-1 py-2.5 rounded-xl bg-[#374BFF] text-white font-bold hover:bg-[#14141A] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={() => setChangePasswordModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-black/15 font-bold hover:bg-[#F5F6FC] transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
