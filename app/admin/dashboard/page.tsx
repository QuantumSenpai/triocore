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
  DollarSign
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { toast } from "sonner";
import { signOut, useSession } from "@/lib/auth-client";
import { OverviewTab } from "./components/overview-tab";
import { CrmTab } from "./components/crm-tab";
import { OperationsTab } from "./components/operations-tab";
import { CmsTab } from "./components/cms-tab";
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

  const loadAllData = useCallback(async () => {
    try {
      // Inquiries
      const inqRes = await fetch("/api/admin/inquiries").then((r) => (r.ok ? r.json() : { inquiries: [] }));
      setInquiries(inqRes.inquiries || []);

      // Clients
      const clientRes = await fetch("/api/admin/clients").then((r) => (r.ok ? r.json() : { clients: [] }));
      setClients(clientRes.clients || []);

      // Business Projects
      const projRes = await fetch("/api/admin/business-projects").then((r) => (r.ok ? r.json() : { projects: [] }));
      setBusinessProjects(projRes.projects || []);

      // Payments
      const payRes = await fetch("/api/admin/payments").then((r) => {
        if (r.status === 403) setCanViewFinance(false);
        return r.ok ? r.json() : { payments: [] };
      });
      setPayments(payRes.payments || []);

      // Expenses
      const expRes = await fetch("/api/admin/expenses").then((r) => (r.ok ? r.json() : { expenses: [] }));
      setExpenses(expRes.expenses || []);

      // Team
      const teamRes = await fetch("/api/admin/team").then((r) => (r.ok ? r.json() : { members: [] }));
      setTeamMembers(teamRes.members || teamRes.team || []);

      // Employees
      const empRes = await fetch("/api/admin/employees").then((r) => (r.ok ? r.json() : { employees: [] }));
      setEmployees(empRes.employees || []);

      // Stats
      const statRes = await fetch("/api/admin/stats").then((r) => (r.ok ? r.json() : { stats: [] }));
      setStats(statRes.stats || []);

      // Services
      const servRes = await fetch("/api/admin/services").then((r) => (r.ok ? r.json() : { services: [] }));
      setServices(servRes.services || []);

      // Pricing
      const priceRes = await fetch("/api/admin/pricing").then((r) => (r.ok ? r.json() : { plans: [] }));
      setPricing(priceRes.plans || []);

      // Showcase Projects
      const showRes = await fetch("/api/admin/projects").then((r) => (r.ok ? r.json() : { projects: [] }));
      setShowcaseProjects(showRes.projects || []);

      // FAQs
      const faqRes = await fetch("/api/admin/faqs").then((r) => (r.ok ? r.json() : { faqs: [] }));
      setFaqs(faqRes.faqs || []);

      // Legal
      const legalRes = await fetch("/api/admin/legal").then((r) => (r.ok ? r.json() : { documents: [] }));
      setLegalDocs(legalRes.documents || []);

      // Notes
      const notesRes = await fetch("/api/admin/notes").then((r) => (r.ok ? r.json() : { notes: [] }));
      setNotes(notesRes.notes || []);

      // Feedback
      const fbRes = await fetch("/api/admin/feedback").then((r) => (r.ok ? r.json() : { reports: [], unreadCount: 0 }));
      setFeedbackReports(fbRes.reports || []);
      setUnreadFeedbackCount(fbRes.unreadCount || 0);

      // Site Settings
      const setRes = await fetch("/api/admin/settings").then((r) => (r.ok ? r.json() : { settings: {} }));
      if (setRes.settings?.monthly_goal_paise) {
        setMonthlyGoalPaise(Number(setRes.settings.monthly_goal_paise));
      }

      // Site Content
      const contRes = await fetch("/api/admin/content").then((r) => (r.ok ? r.json() : { content: [] }));
      setSiteContent(contRes.content || []);

      // Team Access (Owner only)
      const accessRes = await fetch("/api/admin/team-access").then((r) => {
        if (r.status === 403) setUserRole("member");
        return r.ok ? r.json() : { members: [] };
      });
      if (accessRes.members) {
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
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#374BFF] border-t-transparent" />
            <p className="font-heading text-sm font-bold text-[#14141A]">
              Connecting to Neon dev cluster...
            </p>
          </div>
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
    </div>
  );
}
