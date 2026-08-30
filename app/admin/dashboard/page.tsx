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
  RotateCcw
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

type TabType = "inquiries" | "showcase" | "team" | "services" | "pricing";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("inquiries");
  
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [team, setTeam] = useState<Member[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [pricing, setPricing] = useState<PricingPlanItem[]>([]);
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

  const [submitting, setSubmitting] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [inqRes, projRes, teamRes, srvRes, prcRes] = await Promise.allSettled([
        fetch("/api/admin/inquiries").then((r) => r.json()),
        fetch("/api/admin/projects").then((r) => r.json()),
        fetch("/api/admin/team").then((r) => r.json()),
        fetch("/api/admin/services").then((r) => r.json()),
        fetch("/api/admin/pricing").then((r) => r.json()),
      ]);

      if (inqRes.status === "fulfilled" && inqRes.value.inquiries) {
        setInquiries(inqRes.value.inquiries);
      }
      if (projRes.status === "fulfilled" && projRes.value.projects) {
        setProjects(projRes.value.projects);
      }
      if (teamRes.status === "fulfilled" && teamRes.value.team) {
        setTeam(teamRes.value.team);
      }
      if (srvRes.status === "fulfilled" && srvRes.value.services) {
        setServices(srvRes.value.services);
      }
      if (prcRes.status === "fulfilled" && prcRes.value.plans) {
        setPricing(prcRes.value.plans);
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

  const handleSignOut = () => {
    toast.success("Signed out of Admin Dashboard");
    router.push("/admin/login");
  };

  const handleInquiryStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setInquiries((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status } : item))
        );
        toast.success(`Inquiry marked as ${status}`);
      } else {
        toast.error("Failed to update inquiry status");
      }
    } catch {
      toast.error("Error updating status");
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this inquiry?")) return;
    try {
      const res = await fetch(`/api/admin/inquiries?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setInquiries((prev) => prev.filter((item) => item.id !== id));
        toast.success("Inquiry deleted successfully");
      } else {
        toast.error("Failed to delete inquiry");
      }
    } catch {
      toast.error("Error deleting inquiry");
    }
  };

  const openProjectModal = (proj?: Project) => {
    if (proj) {
      setEditingProject(proj);
      setProjectForm({
        title: proj.title,
        description: proj.description,
        imageUrl: proj.imageUrl,
        liveUrl: proj.liveUrl || "",
        tech: proj.tech.join(", "),
        status: proj.status,
        order: proj.order,
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
        toast.success(editingProject ? "Project updated" : "Project added successfully");
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
        features: plan.features.join(", "),
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

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F6FC] dark:bg-[#14141A] text-[#14141A] dark:text-[#F5F6FC] transition-colors duration-200">
      <header className="sticky top-0 z-30 border-b border-[#14141A]/10 dark:border-[#374BFF]/20 bg-white/90 dark:bg-[#14141A]/90 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#374BFF]/40 bg-[#374BFF]/15 text-[#374BFF] dark:text-[#CFFF04]">
              Studio CMS
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#14141A] dark:text-[#F5F6FC] hover:text-[#374BFF] px-3 py-1.5 rounded-xl border border-[#14141A]/12 dark:border-[#374BFF]/25 bg-[#F5F6FC] dark:bg-[#1C1C26] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Live Site</span>
            </Link>
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 px-3 py-1.5 rounded-xl border border-red-500/20 bg-red-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow mx-auto max-w-7xl w-full p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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
        </div>

        {activeTab === "inquiries" && (
          <div className="space-y-4">
            {loading ? (
              <>
                <AdminInquirySkeleton />
                <AdminInquirySkeleton />
                <AdminInquirySkeleton />
              </>
            ) : inquiries.length === 0 ? (
              <div className="glass-card rounded-3xl p-12 text-center text-sm font-medium text-[#14141A]/60 dark:text-[#F5F6FC]/60">
                No client inquiries recorded yet.
              </div>
            ) : (
              inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="glass-card rounded-2xl p-6 border border-[#14141A]/12 dark:border-[#374BFF]/20 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#14141A]/10 dark:border-white/10">
                    <div>
                      <h3 className="font-heading text-lg font-bold text-[#14141A] dark:text-[#F5F6FC]">
                        {inq.name}
                      </h3>
                      <p className="text-xs text-[#374BFF] font-bold">
                        {inq.email} {inq.phone && `• ${inq.phone}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${
                          inq.status === "Responded"
                            ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : inq.status === "Archived"
                            ? "border-neutral-500/40 bg-neutral-500/15 text-neutral-600 dark:text-neutral-400"
                            : "border-[#374BFF]/40 bg-[#374BFF]/15 text-[#374BFF] dark:text-[#CFFF04]"
                        }`}
                      >
                        {inq.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#14141A]/75 dark:text-[#F5F6FC]/80 font-medium">
                    <p><strong>Requirement:</strong> {inq.service}</p>
                    {inq.budget && <p><strong>Budget:</strong> {inq.budget}</p>}
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F5F6FC] dark:bg-[#14141A] text-xs text-[#14141A] dark:text-[#F5F6FC] leading-relaxed font-sans font-medium">
                    {inq.message}
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleInquiryStatus(inq.id, "Responded")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all cursor-pointer"
                      >
                        <Check className="h-3 w-3" />
                        <span>Responded</span>
                      </button>
                      <button
                        onClick={() => handleInquiryStatus(inq.id, "Archived")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-500/30 bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 text-xs font-bold hover:bg-neutral-500/20 transition-all cursor-pointer"
                      >
                        <Archive className="h-3 w-3" />
                        <span>Archive</span>
                      </button>
                      {inq.status !== "Unread" && (
                        <button
                          onClick={() => handleInquiryStatus(inq.id, "Unread")}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#374BFF]/30 bg-[#374BFF]/10 text-[#374BFF] text-xs font-bold hover:bg-[#374BFF]/20 transition-all cursor-pointer"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${inq.email}?subject=Re: TrioCore Project Inquiry - ${inq.service}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#374BFF] text-white text-xs font-bold shadow-sm hover:bg-[#14141A] dark:hover:bg-[#CFFF04] dark:hover:text-[#14141A] transition-colors"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        <span>Reply via Email</span>
                      </a>
                      <button
                        onClick={() => handleDeleteInquiry(inq.id)}
                        className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "showcase" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3].map((k) => (
                <div key={k} className="glass-card rounded-2xl p-6 border border-[#14141A]/12 dark:border-white/10 space-y-4 animate-pulse">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-6 w-3/4 rounded-lg" />
                  <Skeleton className="h-4 w-full rounded-md" />
                </div>
              ))
            ) : (
              projects.map((proj) => (
                <div
                  key={proj.id}
                  className="glass-card rounded-2xl p-6 border border-[#14141A]/12 dark:border-white/10 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#374BFF]/40 bg-[#374BFF]/15 text-[#374BFF] dark:text-[#CFFF04]">
                        {proj.status}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openProjectModal(proj)}
                          className="p-1.5 rounded-lg text-[#374BFF] hover:bg-[#374BFF]/15 transition-colors cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/15 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-heading text-lg font-bold text-[#14141A] dark:text-[#F5F6FC]">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-[#14141A]/75 dark:text-[#F5F6FC]/75 leading-relaxed font-medium">
                      {proj.description}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {proj.tech.map((t) => (
                        <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#14141A]/5 dark:bg-white/5 border border-[#14141A]/10 dark:border-white/10">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#14141A]/10 dark:border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-[#14141A]/60 dark:text-[#F5F6FC]/60 font-mono font-bold">
                      Order: #{proj.order}
                    </span>
                    <a
                      href={proj.liveUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#374BFF]"
                    >
                      <span>View URL</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "team" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3].map((k) => (
                <div key={k} className="glass-card rounded-2xl p-6 border border-[#14141A]/12 dark:border-white/10 space-y-4 animate-pulse">
                  <Skeleton className="h-6 w-32 rounded-lg" />
                  <Skeleton className="h-4 w-24 rounded-md" />
                </div>
              ))
            ) : (
              team.map((m) => (
                <div
                  key={m.id}
                  className="glass-card rounded-2xl p-6 border border-[#14141A]/12 dark:border-white/10 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={m.avatarUrl} alt={m.name} className="h-10 w-10 rounded-xl object-cover" />
                        <div>
                          <h3 className="font-heading text-base font-bold text-[#14141A] dark:text-[#F5F6FC]">
                            {m.name}
                          </h3>
                          <p className="text-xs text-[#374BFF] font-bold">{m.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openTeamModal(m)}
                          className="p-1.5 rounded-lg text-[#374BFF] hover:bg-[#374BFF]/15 transition-colors cursor-pointer"
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
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#14141A]/60 dark:text-[#F5F6FC]/60">
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {m.skills.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#14141A]/10 dark:border-white/10 bg-[#F5F6FC] dark:bg-[#14141A]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#14141A]/10 dark:border-white/10 flex items-center justify-between text-xs text-[#14141A]/60 dark:text-[#F5F6FC]/60 font-medium">
                    <span>Order: #{m.order}</span>
                    {m.githubUrl && (
                      <a href={m.githubUrl} target="_blank" rel="noreferrer" className="text-[#374BFF] font-bold">
                        GitHub
                      </a>
                    )}
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
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#374BFF]/40 bg-[#374BFF]/15 text-[#374BFF] dark:text-[#CFFF04]">
                        {srv.badge}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openServiceModal(srv)}
                          className="p-1.5 rounded-lg text-[#374BFF] hover:bg-[#374BFF]/15 transition-colors cursor-pointer"
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
                    <h3 className="font-heading text-lg font-bold text-[#14141A] dark:text-[#F5F6FC]">
                      {srv.title}
                    </h3>
                    <p className="text-xs text-[#14141A]/75 dark:text-[#F5F6FC]/75 leading-relaxed font-medium">
                      {srv.desc}
                    </p>
                    <div className="space-y-1 pt-2">
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
                    <span>{srv.iconName}</span>
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
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#374BFF]/40 bg-[#374BFF]/15 text-[#374BFF] dark:text-[#CFFF04]">
                        {plan.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openPricingModal(plan)}
                          className="p-1.5 rounded-lg text-[#374BFF] hover:bg-[#374BFF]/15 transition-colors cursor-pointer"
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
                      {plan.features.map((f) => (
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
                  type="text"
                  required
                  value={projectForm.imageUrl}
                  onChange={(e) => setProjectForm({ ...projectForm, imageUrl: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider">Live URL (optional)</label>
                <input
                  type="text"
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
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Coming Soon">Coming Soon</option>
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
                {editingMember ? "Edit Member" : "Add Team Member"}
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
                <label className="font-bold uppercase tracking-wider">Role / Title</label>
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
                  type="text"
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
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider">GitHub URL</label>
                  <input
                    type="text"
                    value={teamForm.githubUrl}
                    onChange={(e) => setTeamForm({ ...teamForm, githubUrl: e.target.value })}
                    className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                  />
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
                {editingService ? "Edit Service" : "Add New Service"}
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
                <label className="font-bold uppercase tracking-wider">Description</label>
                <textarea
                  required
                  rows={3}
                  value={serviceForm.desc}
                  onChange={(e) => setServiceForm({ ...serviceForm, desc: e.target.value })}
                  className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider">Badge (e.g. Popular)</label>
                  <input
                    type="text"
                    required
                    value={serviceForm.badge}
                    onChange={(e) => setServiceForm({ ...serviceForm, badge: e.target.value })}
                    className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider">Icon (Globe/QrCode/CreditCard)</label>
                  <input
                    type="text"
                    required
                    value={serviceForm.iconName}
                    onChange={(e) => setServiceForm({ ...serviceForm, iconName: e.target.value })}
                    className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider">Key Features (comma separated)</label>
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
                  <label className="font-bold uppercase tracking-wider">Grid Width</label>
                  <select
                    value={serviceForm.colSpan}
                    onChange={(e) => setServiceForm({ ...serviceForm, colSpan: e.target.value })}
                    className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                  >
                    <option value="lg:col-span-1">1 Column</option>
                    <option value="lg:col-span-2">2 Columns</option>
                    <option value="lg:col-span-3">Full Width (3 Cols)</option>
                  </select>
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
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider">Price (e.g. ₹1,999)</label>
                  <input
                    type="text"
                    required
                    value={pricingForm.price}
                    onChange={(e) => setPricingForm({ ...pricingForm, price: e.target.value })}
                    className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wider">Category</label>
                  <select
                    value={pricingForm.category}
                    onChange={(e) => setPricingForm({ ...pricingForm, category: e.target.value })}
                    className="w-full rounded-xl border border-white/20 bg-white/5 dark:bg-black/20 p-2.5 text-sm"
                  >
                    <option value="websites">Websites</option>
                    <option value="local">Local Business</option>
                    <option value="ecommerce">E-Commerce</option>
                    <option value="combos">Combos</option>
                    <option value="apps">Web Apps / SaaS</option>
                    <option value="design-seo">Design & SEO</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
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
                <label className="font-bold uppercase tracking-wider">Features Included (comma separated)</label>
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
    </div>
  );
}
