"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Users, 
  FolderGit2, 
  Mail, 
  LogOut, 
  ArrowLeft, 
  ExternalLink, 
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  X,
  Layers,
  Tag,
  Check,
  Archive,
  RotateCcw,
  BarChart3
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { AdminInquirySkeleton, Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  service: string;
  budget?: string | null;
  message: string;
  status: string;
  createdAt?: string | Date;
}

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  liveUrl?: string | null;
  tech: string[];
  status: string;
  order: number;
}

interface Member {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  skills: string[];
  projects?: { title: string; desc?: string }[];
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  order: number;
}

interface Service {
  id: string;
  title: string;
  desc: string;
  badge: string;
  colSpan?: string;
  features: string[];
  accent?: string;
  iconName?: string;
  order: number;
}

interface PricingPlanItem {
  id: string;
  name: string;
  price: string;
  originalPrice?: string | null;
  savings?: string | null;
  period?: string | null;
  badge?: string | null;
  isPopular?: boolean;
  isBestValue?: boolean;
  desc: string;
  features: string[];
  category: string;
  order: number;
}

interface SiteStat {
  id: string;
  key: string;
  value: string;
  label: string;
  section: string;
  order: number;
}

type TabType = "inquiries" | "showcase" | "team" | "services" | "pricing" | "stats";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("inquiries");
  
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [team, setTeam] = useState<Member[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [pricing, setPricing] = useState<PricingPlanItem[]>([]);
  const [stats, setStats] = useState<SiteStat[]>([]);
  const [loading, setLoading] = useState(true);

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    liveUrl: "",
    tech: "",
    status: "Completed",
    order: 0,
  });

  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [teamForm, setTeamForm] = useState({
    name: "",
    role: "",
    avatarUrl: "",
    skills: "",
    projects: "",
    githubUrl: "",
    linkedinUrl: "",
    order: 0,
  });

  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    title: "",
    desc: "",
    badge: "",
    colSpan: "lg:col-span-1",
    features: "",
    accent: "from-[#374BFF] to-[#14141A]",
    iconName: "Globe",
    order: 0,
  });

  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [editingPricing, setEditingPricing] = useState<PricingPlanItem | null>(null);
  const [pricingForm, setPricingForm] = useState({
    name: "",
    price: "",
    originalPrice: "",
    savings: "",
    badge: "",
    desc: "",
    features: "",
    category: "websites",
    isPopular: false,
    isBestValue: false,
    order: 0,
  });

  const [statModalOpen, setStatModalOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<SiteStat | null>(null);
  const [statForm, setStatForm] = useState({
    key: "",
    value: "",
    label: "",
    section: "hero",
    order: 0,
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [inqRes, projRes, teamRes, srvRes, prcRes, statRes] = await Promise.allSettled([
        fetch("/api/admin/inquiries").then((r) => r.json()),
        fetch("/api/admin/projects").then((r) => r.json()),
        fetch("/api/admin/team").then((r) => r.json()),
        fetch("/api/admin/services").then((r) => r.json()),
        fetch("/api/admin/pricing").then((r) => r.json()),
        fetch("/api/admin/stats").then((r) => r.json()),
      ]);

      if (inqRes.status === "fulfilled" && inqRes.value.inquiries) {
        setInquiries(inqRes.value.inquiries);
      }
      if (projRes.status === "fulfilled" && projRes.value.projects) {
        setProjects(projRes.value.projects);
      }
      if (teamRes.status === "fulfilled" && (teamRes.value.team || teamRes.value.members)) {
        setTeam(teamRes.value.team || teamRes.value.members);
      }
      if (srvRes.status === "fulfilled" && srvRes.value.services) {
        setServices(srvRes.value.services);
      }
      if (prcRes.status === "fulfilled" && (prcRes.value.pricing || prcRes.value.plans)) {
        setPricing(prcRes.value.pricing || prcRes.value.plans);
      }
      if (statRes.status === "fulfilled" && statRes.value.stats) {
        setStats(statRes.value.stats);
      }
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
      router.push("/admin/login");
    } catch {
      router.push("/admin/login");
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        setInquiries((prev) =>
          prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
        );
        toast.success(`Inquiry marked as ${newStatus}`);
      } else {
        toast.error("Failed to update status");
      }
    } catch {
      toast.error("Error updating status");
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      const res = await fetch(`/api/admin/inquiries?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setInquiries((prev) => prev.filter((inq) => inq.id !== id));
        toast.success("Inquiry deleted");
      } else {
        toast.error("Failed to delete inquiry");
      }
    } catch {
      toast.error("Error deleting inquiry");
    }
  };

  const openProjectModal = (p?: Project) => {
    if (p) {
      setEditingProject(p);
      setProjectForm({
        title: p.title,
        description: p.description,
        imageUrl: p.imageUrl,
        liveUrl: p.liveUrl || "",
        tech: p.tech.join(", "),
        status: p.status,
        order: p.order,
      });
    } else {
      setEditingProject(null);
      setProjectForm({
        title: "",
        description: "",
        imageUrl: "",
        liveUrl: "",
        tech: "",
        status: "Completed",
        order: projects.length + 1,
      });
    }
    setProjectModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = editingProject ? "PUT" : "POST";
      const payload = {
        ...projectForm,
        id: editingProject ? editingProject.id : undefined,
      };

      const res = await fetch("/api/admin/projects", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingProject ? "Project updated" : "Project created");
        setProjectModalOpen(false);
        fetchDashboardData();
      } else {
        toast.error("Failed to save project");
      }
    } catch {
      toast.error("Error saving project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      const res = await fetch(`/api/admin/projects?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        toast.success("Project deleted");
      } else {
        toast.error("Failed to delete project");
      }
    } catch {
      toast.error("Error deleting project");
    }
  };

  const openTeamModal = (m?: Member) => {
    if (m) {
      setEditingMember(m);
      setTeamForm({
        name: m.name,
        role: m.role,
        avatarUrl: m.avatarUrl,
        skills: m.skills.join(", "),
        projects: (m.projects || []).map((p) => p.title).join(", "),
        githubUrl: m.githubUrl || "",
        linkedinUrl: m.linkedinUrl || "",
        order: m.order,
      });
    } else {
      setEditingMember(null);
      setTeamForm({
        name: "",
        role: "",
        avatarUrl: "",
        skills: "",
        projects: "",
        githubUrl: "",
        linkedinUrl: "",
        order: team.length + 1,
      });
    }
    setTeamModalOpen(true);
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = editingMember ? "PUT" : "POST";
      const payload = {
        ...teamForm,
        id: editingMember ? editingMember.id : undefined,
      };

      const res = await fetch("/api/admin/team", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingMember ? "Team member updated" : "Team member added");
        setTeamModalOpen(false);
        fetchDashboardData();
      } else {
        toast.error("Failed to save team member");
      }
    } catch {
      toast.error("Error saving team member");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;
    try {
      const res = await fetch(`/api/admin/team?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setTeam((prev) => prev.filter((m) => m.id !== id));
        toast.success("Team member removed");
      } else {
        toast.error("Failed to delete team member");
      }
    } catch {
      toast.error("Error deleting team member");
    }
  };

  const openServiceModal = (srv?: Service) => {
    if (srv) {
      setEditingService(srv);
      setServiceForm({
        title: srv.title,
        desc: srv.desc,
        badge: srv.badge,
        colSpan: srv.colSpan || "lg:col-span-1",
        features: srv.features.join(", "),
        accent: srv.accent || "from-[#374BFF] to-[#14141A]",
        iconName: srv.iconName || "Globe",
        order: srv.order,
      });
    } else {
      setEditingService(null);
      setServiceForm({
        title: "",
        desc: "",
        badge: "Specialized",
        colSpan: "lg:col-span-1",
        features: "",
        accent: "from-[#374BFF] to-[#14141A]",
        iconName: "Globe",
        order: services.length + 1,
      });
    }
    setServiceModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = editingService ? "PUT" : "POST";
      const payload = {
        ...serviceForm,
        id: editingService ? editingService.id : undefined,
      };

      const res = await fetch("/api/admin/services", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingService ? "Service updated" : "Service added");
        setServiceModalOpen(false);
        fetchDashboardData();
      } else {
        toast.error("Failed to save service");
      }
    } catch {
      toast.error("Error saving service");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      const res = await fetch(`/api/admin/services?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setServices((prev) => prev.filter((s) => s.id !== id));
        toast.success("Service deleted");
      } else {
        toast.error("Failed to delete service");
      }
    } catch {
      toast.error("Error deleting service");
    }
  };

  const openPricingModal = (plan?: PricingPlanItem) => {
    if (plan) {
      setEditingPricing(plan);
      setPricingForm({
        name: plan.name,
        price: plan.price,
        originalPrice: plan.originalPrice || "",
        savings: plan.savings || "",
        badge: plan.badge || "",
        desc: plan.desc,
        features: Array.isArray(plan.features) ? plan.features.join(", ") : typeof plan.features === "string" ? plan.features : "",
        category: plan.category || "websites",
        isPopular: Boolean(plan.isPopular),
        isBestValue: Boolean(plan.isBestValue),
        order: plan.order,
      });
    } else {
      setEditingPricing(null);
      setPricingForm({
        name: "",
        price: "₹",
        originalPrice: "",
        savings: "",
        badge: "",
        desc: "",
        features: "",
        category: "websites",
        isPopular: false,
        isBestValue: false,
        order: pricing.length + 1,
      });
    }
    setPricingModalOpen(true);
  };

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = editingPricing ? "PUT" : "POST";
      const payload = {
        ...pricingForm,
        id: editingPricing ? editingPricing.id : undefined,
      };

      const res = await fetch("/api/admin/pricing", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingPricing ? "Pricing plan updated" : "Pricing plan added");
        setPricingModalOpen(false);
        fetchDashboardData();
      } else {
        toast.error("Failed to save pricing plan");
      }
    } catch {
      toast.error("Error saving pricing plan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePricing = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pricing plan?")) return;
    try {
      const res = await fetch(`/api/admin/pricing?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setPricing((prev) => prev.filter((p) => p.id !== id));
        toast.success("Pricing plan deleted");
      } else {
        toast.error("Failed to delete pricing plan");
      }
    } catch {
      toast.error("Error deleting pricing plan");
    }
  };

  const openStatModal = (s?: SiteStat) => {
    if (s) {
      setEditingStat(s);
      setStatForm({
        key: s.key,
        value: s.value,
        label: s.label,
        section: s.section,
        order: s.order,
      });
    } else {
      setEditingStat(null);
      setStatForm({
        key: "",
        value: "",
        label: "",
        section: "hero",
        order: stats.length + 1,
      });
    }
    setStatModalOpen(true);
  };

  const handleSaveStat = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const method = editingStat ? "PUT" : "POST";
      const payload = {
        ...statForm,
        id: editingStat ? editingStat.id : undefined,
      };

      const res = await fetch("/api/admin/stats", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(editingStat ? "Stat updated" : "Stat added");
        setStatModalOpen(false);
        fetchDashboardData();
      } else {
        toast.error("Failed to save stat");
      }
    } catch {
      toast.error("Error saving stat");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStat = async (id: string) => {
    if (!confirm("Are you sure you want to delete this stat?")) return;
    try {
      const res = await fetch(`/api/admin/stats?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setStats((prev) => prev.filter((s) => s.id !== id));
        toast.success("Stat deleted");
      } else {
        toast.error("Failed to delete stat");
      }
    } catch {
      toast.error("Error deleting stat");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6FC] dark:bg-[#0C0C10] text-[#14141A] dark:text-[#F5F6FC]">
      <header className="sticky top-0 z-40 border-b border-[#14141A]/10 dark:border-white/10 bg-white/80 dark:bg-[#0C0C10]/80 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Logo />
            </Link>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#374BFF]/10 text-[#374BFF] dark:text-[#CFFF04] border border-[#374BFF]/20 uppercase tracking-widest">
                CMS Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#14141A]/15 dark:border-white/15 text-xs font-bold hover:border-[#374BFF] transition-colors"
            >
              <span>Live Site</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-bold hover:bg-red-500/20 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6 sm:p-8 space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="glass-card rounded-3xl p-5 border border-[#14141A]/12 dark:border-[#374BFF]/20">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#14141A]/60 dark:text-[#F5F6FC]/70">
                Inquiries
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#374BFF]/15 text-[#374BFF] dark:text-[#CFFF04]">
                <Mail className="h-4 w-4" />
              </div>
            </div>
            {loading ? <Skeleton className="mt-2 h-8 w-12 rounded-lg" /> : (
              <p className="mt-2 font-heading text-2xl font-black text-[#14141A] dark:text-[#F5F6FC]">
                {inquiries.length}
              </p>
            )}
          </div>

          <div className="glass-card rounded-3xl p-5 border border-[#14141A]/12 dark:border-[#374BFF]/20">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#14141A]/60 dark:text-[#F5F6FC]/70">
                Projects
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#374BFF]/15 text-[#374BFF] dark:text-[#CFFF04]">
                <FolderGit2 className="h-4 w-4" />
              </div>
            </div>
            {loading ? <Skeleton className="mt-2 h-8 w-12 rounded-lg" /> : (
              <p className="mt-2 font-heading text-2xl font-black text-[#14141A] dark:text-[#F5F6FC]">
                {projects.length}
              </p>
            )}
          </div>

          <div className="glass-card rounded-3xl p-5 border border-[#14141A]/12 dark:border-[#374BFF]/20">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#14141A]/60 dark:text-[#F5F6FC]/70">
                Team
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#374BFF]/15 text-[#374BFF] dark:text-[#CFFF04]">
                <Users className="h-4 w-4" />
              </div>
            </div>
            {loading ? <Skeleton className="mt-2 h-8 w-12 rounded-lg" /> : (
              <p className="mt-2 font-heading text-2xl font-black text-[#14141A] dark:text-[#F5F6FC]">
                {team.length}
              </p>
            )}
          </div>

          <div className="glass-card rounded-3xl p-5 border border-[#14141A]/12 dark:border-[#374BFF]/20">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#14141A]/60 dark:text-[#F5F6FC]/70">
                Services
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#374BFF]/15 text-[#374BFF] dark:text-[#CFFF04]">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            {loading ? <Skeleton className="mt-2 h-8 w-12 rounded-lg" /> : (
              <p className="mt-2 font-heading text-2xl font-black text-[#14141A] dark:text-[#F5F6FC]">
                {services.length}
              </p>
            )}
          </div>

          <div className="glass-card rounded-3xl p-5 border border-[#14141A]/12 dark:border-[#374BFF]/20">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#14141A]/60 dark:text-[#F5F6FC]/70">
                Plans
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#374BFF]/15 text-[#374BFF] dark:text-[#CFFF04]">
                <Tag className="h-4 w-4" />
              </div>
            </div>
            {loading ? <Skeleton className="mt-2 h-8 w-12 rounded-lg" /> : (
              <p className="mt-2 font-heading text-2xl font-black text-[#14141A] dark:text-[#F5F6FC]">
                {pricing.length}
              </p>
            )}
          </div>

          <div className="glass-card rounded-3xl p-5 border border-[#14141A]/12 dark:border-[#374BFF]/20">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#14141A]/60 dark:text-[#F5F6FC]/70">
                Site Stats
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#374BFF]/15 text-[#374BFF] dark:text-[#CFFF04]">
                <BarChart3 className="h-4 w-4" />
              </div>
            </div>
            {loading ? <Skeleton className="mt-2 h-8 w-12 rounded-lg" /> : (
              <p className="mt-2 font-heading text-2xl font-black text-[#14141A] dark:text-[#F5F6FC]">
                {stats.length}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#14141A]/10 dark:border-white/10 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ["inquiries", `Client Inquiries (${inquiries.length})`],
                ["showcase", `Showcase Projects (${projects.length})`],
                ["team", `Team Members (${team.length})`],
                ["services", `Services (${services.length})`],
                ["pricing", `Pricing Plans (${pricing.length})`],
                ["stats", `Site Stats (${stats.length})`],
              ] as [TabType, string][]
            ).map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#374BFF] text-white shadow-md"
                    : "text-[#14141A]/70 dark:text-[#F5F6FC]/70 hover:bg-white dark:hover:bg-[#1C1C26]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === "showcase" && (
            <button
              onClick={() => openProjectModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#374BFF] text-white text-xs font-bold shadow-md hover:bg-[#14141A] dark:hover:bg-[#CFFF04] dark:hover:text-[#14141A] transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Project</span>
            </button>
          )}

          {activeTab === "team" && (
            <button
              onClick={() => openTeamModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#374BFF] text-white text-xs font-bold shadow-md hover:bg-[#14141A] dark:hover:bg-[#CFFF04] dark:hover:text-[#14141A] transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Member</span>
            </button>
          )}

          {activeTab === "services" && (
            <button
              onClick={() => openServiceModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#374BFF] text-white text-xs font-bold shadow-md hover:bg-[#14141A] dark:hover:bg-[#CFFF04] dark:hover:text-[#14141A] transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Service</span>
            </button>
          )}

          {activeTab === "pricing" && (
            <button
              onClick={() => openPricingModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#374BFF] text-white text-xs font-bold shadow-md hover:bg-[#14141A] dark:hover:bg-[#CFFF04] dark:hover:text-[#14141A] transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Plan</span>
            </button>
          )}

          {activeTab === "stats" && (
            <button
              onClick={() => openStatModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#374BFF] text-white text-xs font-bold shadow-md hover:bg-[#14141A] dark:hover:bg-[#CFFF04] dark:hover:text-[#14141A] transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Stat</span>
            </button>
          )}
        </div>

        {activeTab === "inquiries" && (
          <div className="space-y-4">
            {loading ? (
              <AdminInquirySkeleton />
            ) : inquiries.length === 0 ? (
              <div className="glass-card rounded-3xl p-12 text-center border border-[#14141A]/10 dark:border-white/10 space-y-3">
                <Mail className="mx-auto h-10 w-10 text-[#374BFF]" />
                <h3 className="font-heading text-lg font-bold">No Inquiries Found</h3>
                <p className="text-xs text-[#14141A]/60 dark:text-[#F5F6FC]/60 max-w-sm mx-auto">
                  Client submissions from the contact form will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="glass-card rounded-3xl p-6 border border-[#14141A]/12 dark:border-white/10 flex flex-col justify-between space-y-4 shadow-sm hover:border-[#374BFF] transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-heading text-base font-bold">{inq.name}</h4>
                          <a
                            href={`mailto:${inq.email}`}
                            className="text-xs font-semibold text-[#374BFF] dark:text-[#CFFF04] hover:underline"
                          >
                            {inq.email}
                          </a>
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            inq.status === "Unread"
                              ? "bg-[#374BFF]/10 text-[#374BFF] border-[#374BFF]/30"
                              : inq.status === "Contacted"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                              : "bg-neutral-500/10 text-neutral-400 border-neutral-500/30"
                          }`}
                        >
                          {inq.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                        <span className="px-2 py-0.5 rounded-md bg-[#14141A]/5 dark:bg-white/5 border border-[#14141A]/10 dark:border-white/10">
                          {inq.service}
                        </span>
                        {inq.budget && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {inq.budget}
                          </span>
                        )}
                        {inq.phone && (
                          <span className="px-2 py-0.5 rounded-md bg-[#14141A]/5 dark:bg-white/5 border border-[#14141A]/10 dark:border-white/10">
                            📞 {inq.phone}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#14141A]/80 dark:text-[#F5F6FC]/80 leading-relaxed bg-[#14141A]/4 dark:bg-white/4 p-3 rounded-2xl border border-[#14141A]/5 dark:border-white/5 line-clamp-4">
                        {inq.message}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#14141A]/10 dark:border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {inq.status !== "Contacted" && (
                          <button
                            onClick={() => handleUpdateStatus(inq.id, "Contacted")}
                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                          >
                            Mark Contacted
                          </button>
                        )}
                        {inq.status !== "Archived" && (
                          <button
                            onClick={() => handleUpdateStatus(inq.id, "Archived")}
                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-neutral-500/10 text-neutral-400 hover:bg-neutral-500/20 transition-colors cursor-pointer"
                          >
                            Archive
                          </button>
                        )}
                        {inq.status === "Archived" && (
                          <button
                            onClick={() => handleUpdateStatus(inq.id, "Unread")}
                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#374BFF]/10 text-[#374BFF] hover:bg-[#374BFF]/20 transition-colors cursor-pointer"
                          >
                            Restore
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteInquiry(inq.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/15 transition-colors cursor-pointer"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "showcase" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3].map((k) => (
                <div key={k} className="glass-card rounded-2xl p-6 border border-[#14141A]/12 dark:border-white/10 space-y-4 animate-pulse">
                  <Skeleton className="h-40 w-full rounded-xl" />
                  <Skeleton className="h-5 w-3/4 rounded-lg" />
                </div>
              ))
            ) : (
              projects.map((p) => (
                <div
                  key={p.id}
                  className="glass-card rounded-2xl p-5 border border-[#14141A]/12 dark:border-white/10 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="relative h-40 w-full rounded-xl overflow-hidden bg-neutral-900 border border-white/10">
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80";
                        }}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute top-2.5 right-2.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/70 text-white backdrop-blur-md">
                        {p.status}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-heading text-base font-bold text-[#14141A] dark:text-[#F5F6FC]">{p.title}</h4>
                      <p className="text-xs text-[#14141A]/70 dark:text-[#F5F6FC]/70 line-clamp-2 mt-1">{p.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {p.tech.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#374BFF]/10 text-[#374BFF] dark:text-[#CFFF04]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#14141A]/10 dark:border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openProjectModal(p)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#374BFF] dark:text-[#CFFF04] hover:underline cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProject(p.id)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-red-500 hover:underline cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                    {p.liveUrl && (
                      <a href={p.liveUrl} target="_blank" rel="noreferrer" className="text-xs text-[#374BFF] hover:underline">
                        Live Link ↗
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "team" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              [1, 2, 3, 4].map((k) => (
                <div key={k} className="glass-card rounded-2xl p-6 border border-[#14141A]/12 dark:border-white/10 space-y-4 animate-pulse">
                  <Skeleton className="h-20 w-20 rounded-full mx-auto" />
                  <Skeleton className="h-5 w-3/4 rounded-lg mx-auto" />
                </div>
              ))
            ) : (
              team.map((m) => (
                <div
                  key={m.id}
                  className="glass-card rounded-2xl p-5 border border-[#14141A]/12 dark:border-white/10 flex flex-col justify-between space-y-4 text-center"
                >
                  <div className="space-y-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openTeamModal(m)}
                        className="p-1.5 rounded-lg text-[#374BFF] dark:text-[#CFFF04] hover:bg-[#374BFF]/10 transition-colors cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(m.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/15 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="relative mx-auto h-20 w-20 rounded-full overflow-hidden ring-2 ring-[#374BFF]/30">
                      <img
                        src={m.avatarUrl}
                        alt={m.name}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80";
                        }}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-heading text-base font-bold text-[#14141A] dark:text-[#F5F6FC]">{m.name}</h4>
                      <p className="text-[11px] font-bold text-[#374BFF] dark:text-[#CFFF04] uppercase tracking-wider">{m.role}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#14141A]/50 dark:text-[#F5F6FC]/50">Skills</span>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {m.skills.slice(0, 4).map((s) => (
                          <span
                            key={s}
                            className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#14141A]/5 dark:bg-white/5 border border-[#14141A]/10 dark:border-white/10"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#14141A]/10 dark:border-white/10 flex items-center justify-between text-xs text-[#14141A]/60 dark:text-[#F5F6FC]/60 font-medium">
                    <span>Order: #{m.order}</span>
                    <div className="flex items-center gap-2">
                      {m.githubUrl && (
                        <a href={m.githubUrl} target="_blank" rel="noreferrer" className="text-[#374BFF] font-bold hover:underline">
                          GitHub
                        </a>
                      )}
                      {m.linkedinUrl && (
                        <a href={m.linkedinUrl} target="_blank" rel="noreferrer" className="text-[#374BFF] dark:text-[#CFFF04] font-bold hover:underline">
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "services" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3].map((k) => (
                <div key={k} className="glass-card rounded-2xl p-6 border border-[#14141A]/12 dark:border-white/10 space-y-4 animate-pulse">
                  <Skeleton className="h-6 w-32 rounded-lg" />
                  <Skeleton className="h-4 w-full rounded-md" />
                </div>
              ))
            ) : (
              services.map((srv) => (
                <div
                  key={srv.id}
                  className="glass-card rounded-2xl p-6 border border-[#14141A]/12 dark:border-white/10 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#374BFF]/30 bg-[#374BFF]/10 text-[#374BFF] dark:text-[#CFFF04]">
                        {srv.badge}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openServiceModal(srv)}
                          className="p-1.5 rounded-lg text-[#374BFF] dark:text-[#CFFF04] hover:bg-[#374BFF]/10 transition-colors cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(srv.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/15 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-[#14141A] dark:text-[#F5F6FC]">
                        {srv.title}
                      </h3>
                      <p className="text-xs text-[#14141A]/75 dark:text-[#F5F6FC]/75 leading-relaxed mt-1">
                        {srv.desc}
                      </p>
                    </div>
                    <div className="space-y-1 pt-1">
                      {srv.features.map((f) => (
                        <p key={f} className="text-xs text-[#14141A] dark:text-[#F5F6FC] font-semibold flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-[#374BFF] dark:text-[#CFFF04]" />
                          <span>{f}</span>
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#14141A]/10 dark:border-white/10 flex items-center justify-between text-xs text-[#14141A]/60 dark:text-[#F5F6FC]/60 font-mono">
                    <span>Order: #{srv.order}</span>
                    <span>Icon: {srv.iconName || "Globe"}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "pricing" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3].map((k) => (
                <div key={k} className="glass-card rounded-2xl p-6 border border-[#14141A]/12 dark:border-white/10 space-y-4 animate-pulse">
                  <Skeleton className="h-6 w-32 rounded-lg" />
                  <Skeleton className="h-4 w-full rounded-md" />
                </div>
              ))
            ) : (
              pricing.map((plan) => (
                <div
                  key={plan.id}
                  className="glass-card rounded-2xl p-6 border border-[#14141A]/12 dark:border-white/10 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#14141A]/5 dark:bg-white/5 border border-[#14141A]/10 dark:border-white/10">
                        {plan.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openPricingModal(plan)}
                          className="p-1.5 rounded-lg text-[#374BFF] dark:text-[#CFFF04] hover:bg-[#374BFF]/10 transition-colors cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePricing(plan.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/15 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-[#14141A] dark:text-[#F5F6FC]">
                        {plan.name}
                      </h3>
                      <p className="text-xl font-black text-[#374BFF] dark:text-[#CFFF04]">{plan.price}</p>
                    </div>
                    <p className="text-xs text-[#14141A]/75 dark:text-[#F5F6FC]/75 leading-relaxed font-medium">
                      {plan.desc}
                    </p>
                    <div className="space-y-1 pt-2">
                      {(plan.features || []).map((f) => (
                        <p key={f} className="text-xs text-[#14141A] dark:text-[#F5F6FC] font-semibold flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-[#374BFF] dark:text-[#CFFF04]" />
                          <span>{f}</span>
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#14141A]/10 dark:border-white/10 flex items-center justify-between text-xs text-[#14141A]/60 dark:text-[#F5F6FC]/60 font-mono">
                    <span>Order: #{plan.order}</span>
                    {plan.badge && <span className="font-bold text-[#374BFF]">{plan.badge}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "stats" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {loading ? (
                [1, 2, 3, 4].map((k) => (
                  <div key={k} className="glass-card rounded-2xl p-6 border border-[#14141A]/12 dark:border-white/10 space-y-4 animate-pulse">
                    <Skeleton className="h-8 w-24 rounded-lg" />
                    <Skeleton className="h-4 w-full rounded-md" />
                  </div>
                ))
              ) : stats.length === 0 ? (
                <div className="col-span-full glass-card rounded-3xl p-12 text-center border border-[#14141A]/10 dark:border-white/10 space-y-3">
                  <BarChart3 className="mx-auto h-10 w-10 text-[#374BFF]" />
                  <h3 className="font-heading text-lg font-bold">No Stats Configured</h3>
                  <p className="text-xs text-[#14141A]/60 dark:text-[#F5F6FC]/60 max-w-sm mx-auto">
                    Click "+ Add Stat" to configure site statistics and counters.
                  </p>
                </div>
              ) : (
                stats.map((st) => (
                  <div
                    key={st.id}
                    className="glass-card rounded-2xl p-6 border border-[#14141A]/12 dark:border-white/10 flex flex-col justify-between space-y-4 shadow-sm hover:border-[#374BFF] transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#374BFF]/10 text-[#374BFF] dark:text-[#CFFF04] border border-[#374BFF]/20">
                          {st.section}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openStatModal(st)}
                            className="p-1.5 rounded-lg text-[#374BFF] dark:text-[#CFFF04] hover:bg-[#374BFF]/10 transition-colors cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStat(st.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/15 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-mono text-[#14141A]/50 dark:text-[#F5F6FC]/50">{st.key}</p>
                        <p className="mt-1 text-3xl font-black font-heading text-[#374BFF] dark:text-[#CFFF04] tracking-tight">
                          {st.value}
                        </p>
                        <h4 className="mt-1 font-heading text-sm font-bold text-[#14141A] dark:text-[#F5F6FC]">
                          {st.label}
                        </h4>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#14141A]/10 dark:border-white/10 flex items-center justify-between text-xs text-[#14141A]/60 dark:text-[#F5F6FC]/60 font-mono">
                      <span>Order: #{st.order}</span>
                      <button
                        onClick={() => openStatModal(st)}
                        className="text-xs font-bold text-[#374BFF] hover:underline cursor-pointer"
                      >
                        Edit Stat
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {projectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-heading text-xl font-bold">
                {editingProject ? "Edit Project" : "Add New Project"}
              </h3>
              <button onClick={() => setProjectModalOpen(false)} className="p-1 rounded-lg hover:bg-white/10 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveProject} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider">Project Title</label>
                <input
                  type="text"
                  required
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider">Description</label>
                <textarea
                  required
                  rows={3}
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider">Image URL</label>
                <input
                  type="url"
                  required
                  value={projectForm.imageUrl}
                  onChange={(e) => setProjectForm({ ...projectForm, imageUrl: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider">Live URL (optional)</label>
                <input
                  type="url"
                  value={projectForm.liveUrl}
                  onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  required
                  value={projectForm.tech}
                  onChange={(e) => setProjectForm({ ...projectForm, tech: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider">Status</label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                    className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                  >
                    <option value="Completed" className="bg-[#14141A] text-white">Completed</option>
                    <option value="Active" className="bg-[#14141A] text-white">Active</option>
                    <option value="In Progress" className="bg-[#14141A] text-white">In Progress</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider">Display Order</label>
                  <input
                    type="number"
                    value={projectForm.order}
                    onChange={(e) => setProjectForm({ ...projectForm, order: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                  />
                </div>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#374BFF] text-white font-bold hover:bg-[#14141A] dark:hover:bg-[#CFFF04] dark:hover:text-[#14141A] transition-all cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {teamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-heading text-xl font-bold">
                {editingMember ? "Edit Team Member" : "Add Team Member"}
              </h3>
              <button onClick={() => setTeamModalOpen(false)} className="p-1 rounded-lg hover:bg-white/10 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveTeam} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider">Role Title</label>
                <input
                  type="text"
                  required
                  value={teamForm.role}
                  onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider">Avatar Image URL</label>
                <input
                  type="url"
                  required
                  value={teamForm.avatarUrl}
                  onChange={(e) => setTeamForm({ ...teamForm, avatarUrl: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider">Skills (comma separated)</label>
                <input
                  type="text"
                  required
                  value={teamForm.skills}
                  onChange={(e) => setTeamForm({ ...teamForm, skills: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider">Featured Projects (comma separated)</label>
                <input
                  type="text"
                  value={teamForm.projects}
                  onChange={(e) => setTeamForm({ ...teamForm, projects: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider">GitHub URL</label>
                  <input
                    type="text"
                    value={teamForm.githubUrl}
                    onChange={(e) => setTeamForm({ ...teamForm, githubUrl: e.target.value })}
                    className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider">LinkedIn URL</label>
                  <input
                    type="text"
                    value={teamForm.linkedinUrl}
                    onChange={(e) => setTeamForm({ ...teamForm, linkedinUrl: e.target.value })}
                    className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                    placeholder="https://www.linkedin.com/in/..."
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider">Display Order</label>
                <input
                  type="number"
                  value={teamForm.order}
                  onChange={(e) => setTeamForm({ ...teamForm, order: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTeamModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#374BFF] text-white font-bold hover:bg-[#14141A] dark:hover:bg-[#CFFF04] dark:hover:text-[#14141A] transition-all cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-heading text-xl font-bold">
                {editingService ? "Edit Service" : "Add Service"}
              </h3>
              <button onClick={() => setServiceModalOpen(false)} className="p-1 rounded-lg hover:bg-white/10 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveService} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider">Service Title</label>
                <input
                  type="text"
                  required
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider">Badge Tag</label>
                <input
                  type="text"
                  required
                  value={serviceForm.badge}
                  onChange={(e) => setServiceForm({ ...serviceForm, badge: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider">Description</label>
                <textarea
                  required
                  rows={3}
                  value={serviceForm.desc}
                  onChange={(e) => setServiceForm({ ...serviceForm, desc: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider">Features (comma separated)</label>
                <input
                  type="text"
                  required
                  value={serviceForm.features}
                  onChange={(e) => setServiceForm({ ...serviceForm, features: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider">Icon Name</label>
                  <input
                    type="text"
                    value={serviceForm.iconName}
                    onChange={(e) => setServiceForm({ ...serviceForm, iconName: e.target.value })}
                    className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider">Display Order</label>
                  <input
                    type="number"
                    value={serviceForm.order}
                    onChange={(e) => setServiceForm({ ...serviceForm, order: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                  />
                </div>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#374BFF] text-white font-bold hover:bg-[#14141A] dark:hover:bg-[#CFFF04] dark:hover:text-[#14141A] transition-all cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pricingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-heading text-xl font-bold">
                {editingPricing ? "Edit Pricing Plan" : "Add Pricing Plan"}
              </h3>
              <button onClick={() => setPricingModalOpen(false)} className="p-1 rounded-lg hover:bg-white/10 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSavePricing} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={pricingForm.name}
                    onChange={(e) => setPricingForm({ ...pricingForm, name: e.target.value })}
                    className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider">Price (e.g. ₹999)</label>
                  <input
                    type="text"
                    required
                    value={pricingForm.price}
                    onChange={(e) => setPricingForm({ ...pricingForm, price: e.target.value })}
                    className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider">Category</label>
                <select
                  value={pricingForm.category}
                  onChange={(e) => setPricingForm({ ...pricingForm, category: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                >
                  <option value="websites" className="bg-[#14141A] text-white">Websites</option>
                  <option value="local" className="bg-[#14141A] text-white">Local Business</option>
                  <option value="ecommerce" className="bg-[#14141A] text-white">E-Commerce</option>
                  <option value="maintenance" className="bg-[#14141A] text-white">Maintenance</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider">Description</label>
                <textarea
                  required
                  rows={2}
                  value={pricingForm.desc}
                  onChange={(e) => setPricingForm({ ...pricingForm, desc: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider">Features (comma separated)</label>
                <input
                  type="text"
                  required
                  value={pricingForm.features}
                  onChange={(e) => setPricingForm({ ...pricingForm, features: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider">Badge (e.g. Popular ⭐)</label>
                  <input
                    type="text"
                    value={pricingForm.badge}
                    onChange={(e) => setPricingForm({ ...pricingForm, badge: e.target.value })}
                    className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider">Display Order</label>
                  <input
                    type="number"
                    value={pricingForm.order}
                    onChange={(e) => setPricingForm({ ...pricingForm, order: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={pricingForm.isPopular}
                    onChange={(e) => setPricingForm({ ...pricingForm, isPopular: e.target.checked })}
                    className="rounded text-[#374BFF]"
                  />
                  <span>Highlight as Popular</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={pricingForm.isBestValue}
                    onChange={(e) => setPricingForm({ ...pricingForm, isBestValue: e.target.checked })}
                    className="rounded text-[#374BFF]"
                  />
                  <span>Best Value</span>
                </label>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPricingModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#374BFF] text-white font-bold hover:bg-[#14141A] dark:hover:bg-[#CFFF04] dark:hover:text-[#14141A] transition-all cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {statModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-heading text-xl font-bold">
                {editingStat ? "Edit Site Stat" : "Add New Stat"}
              </h3>
              <button onClick={() => setStatModalOpen(false)} className="p-1 rounded-lg hover:bg-white/10 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveStat} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider">Stat Key (unique id)</label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingStat)}
                    value={statForm.key}
                    onChange={(e) => setStatForm({ ...statForm, key: e.target.value })}
                    className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm disabled:opacity-50"
                    placeholder="e.g. hero_innovators"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider">Section</label>
                  <select
                    value={statForm.section}
                    onChange={(e) => setStatForm({ ...statForm, section: e.target.value })}
                    className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                  >
                    <option value="hero" className="bg-[#14141A] text-white">Hero Section</option>
                    <option value="why_us" className="bg-[#14141A] text-white">Why TrioCore Section</option>
                    <option value="general" className="bg-[#14141A] text-white">General / Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider">Stat Value (e.g. 100%, 24/7, 15+)</label>
                  <input
                    type="text"
                    required
                    value={statForm.value}
                    onChange={(e) => setStatForm({ ...statForm, value: e.target.value })}
                    className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm font-mono font-bold"
                    placeholder="e.g. 24/7"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider">Display Order</label>
                  <input
                    type="number"
                    value={statForm.order}
                    onChange={(e) => setStatForm({ ...statForm, order: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider">Label / Subtitle</label>
                <input
                  type="text"
                  required
                  value={statForm.label}
                  onChange={(e) => setStatForm({ ...statForm, label: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                  placeholder="e.g. Direct Developer Access"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStatModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/20 hover:bg-white/10 cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#374BFF] text-white font-bold hover:bg-[#14141A] dark:hover:bg-[#CFFF04] dark:hover:text-[#14141A] transition-all cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save Stat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
