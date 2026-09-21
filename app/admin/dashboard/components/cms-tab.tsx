"use client";

import { useState } from "react";
import { 
  Sparkles, 
  ExternalLink, 
  Pencil, 
  Trash2, 
  Plus, 
  Check, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff,
  Save,
  Globe,
  X
} from "lucide-react";
import { toast } from "sonner";
import type {
  AdminSiteContent,
  AdminService,
  AdminPricingPlan,
  AdminStat,
  AdminShowcaseProject,
  AdminTeamMember,
  AdminEmployee,
  AdminFaq,
  AdminFaqCategory,
  AdminLegalDoc,
} from "@/types/admin";

type CmsSection = "hero" | "services" | "pricing" | "stats" | "projects" | "team-emp" | "faqs" | "legal" | "seo";

interface CmsTabProps {
  initialContent: AdminSiteContent[];
  services: AdminService[];
  pricing: AdminPricingPlan[];
  stats: AdminStat[];
  projects: AdminShowcaseProject[];
  team: AdminTeamMember[];
  employees: AdminEmployee[];
  faqs: AdminFaq[];
  faqCategories: AdminFaqCategory[];
  legalDocs: AdminLegalDoc[];
  onRefresh: () => Promise<void>;
}

export function CmsTab({
  initialContent,
  services,
  pricing,
  stats,
  projects,
  team,
  employees,
  faqs,
  faqCategories = [],
  legalDocs,
  onRefresh,
}: CmsTabProps) {
  const [activeSection, setActiveSection] = useState<CmsSection>("hero");

  // Hero form
  const heroHeadline = initialContent.find((c) => c.key === "hero_headline")?.value || "Think. Build. Scale.";
  const heroSubtext = initialContent.find((c) => c.key === "hero_subtext")?.value || "A forward-engineering digital solutions studio founded by CSE innovators.";
  const [headline, setHeadline] = useState(heroHeadline);
  const [subtext, setSubtext] = useState(heroSubtext);

  // SEO form
  const seoTitle = initialContent.find((c) => c.key === "seo_title")?.value || "TrioCore — Think. Build. Scale.";
  const seoDesc = initialContent.find((c) => c.key === "seo_description")?.value || "Digital Solutions studio India.";
  const [metaTitle, setMetaTitle] = useState(seoTitle);
  const [metaDesc, setMetaDesc] = useState(seoDesc);

  // "Saved · Live" banner state
  const [savedLiveInfo, setSavedLiveInfo] = useState<{ liveUrl: string; label: string } | null>(null);

  // Modals
  const [serviceModal, setServiceModal] = useState<AdminService | Partial<AdminService> | null>(null);
  const [pricingModal, setPricingModal] = useState<AdminPricingPlan | Partial<AdminPricingPlan> | null>(null);
  const [statModal, setStatModal] = useState<AdminStat | Partial<AdminStat> | null>(null);
  const [projectModal, setProjectModal] = useState<AdminShowcaseProject | Partial<AdminShowcaseProject> | null>(null);
  const [employeeModal, setEmployeeModal] = useState<AdminEmployee | Partial<AdminEmployee> | null>(null);
  const [faqModal, setFaqModal] = useState<AdminFaq | Partial<AdminFaq> | null>(null);
  const [categoryModal, setCategoryModal] = useState<AdminFaqCategory | Partial<AdminFaqCategory> | null>(null);
  const [legalModal, setLegalModal] = useState<AdminLegalDoc | Partial<AdminLegalDoc> | null>(null);

  const showSavedLive = (liveUrl: string, label: string) => {
    setSavedLiveInfo({ liveUrl, label });
    toast.success("Saved · Live! Instant cache revalidation triggered.");
  };

  // 1. Save Hero
  const handleSaveHero = async () => {
    try {
      await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "hero_headline", value: headline, section: "hero", label: "Hero Headline" }),
      });
      await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "hero_subtext", value: subtext, section: "hero", label: "Hero Subtext" }),
      });
      showSavedLive("/#", "Hero Section");
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // 2. Save SEO
  const handleSaveSeo = async () => {
    try {
      await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "seo_title", value: metaTitle, section: "seo", label: "SEO Title" }),
      });
      await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "seo_description", value: metaDesc, section: "seo", label: "SEO Description" }),
      });
      showSavedLive("/#", "Home Page SEO");
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // 3. Service Save
  const handleSaveService = async (serviceData: Partial<AdminService>) => {
    try {
      const method = serviceData.id ? "PUT" : "POST";
      const res = await fetch("/api/admin/services", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceData),
      });
      if (!res.ok) throw new Error("Failed to save service");
      setServiceModal(null);
      showSavedLive("/#services", "Services Section");
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // 4. Pricing Save
  const handleSavePricing = async (planData: Partial<AdminPricingPlan>) => {
    try {
      const method = planData.id ? "PUT" : "POST";
      const res = await fetch("/api/admin/pricing", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(planData),
      });
      if (!res.ok) throw new Error("Failed to save plan");
      setPricingModal(null);
      showSavedLive("/#pricing", "Pricing Section");
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // 5. Stat Save
  const handleSaveStat = async (statData: Partial<AdminStat>) => {
    try {
      const method = statData.id ? "PUT" : "POST";
      const res = await fetch("/api/admin/stats", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(statData),
      });
      if (!res.ok) throw new Error("Failed to save stat");
      setStatModal(null);
      showSavedLive("/#", "Stats Counter");
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // 6. Project Reorder / Status
  const handleUpdateProjectStatus = async (proj: AdminShowcaseProject, newStatus: string) => {
    try {
      await fetch("/api/admin/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...proj, status: newStatus }),
      });
      showSavedLive("/#showcase", "Showcase Projects");
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleReorderProject = async (proj: AdminShowcaseProject, delta: number) => {
    try {
      const newOrder = Math.max(0, (proj.order || 0) + delta);
      await fetch("/api/admin/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...proj, order: newOrder }),
      });
      showSavedLive("/#showcase", "Showcase Projects");
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // 7. Employee Add / Delete
  const handleSaveEmployee = async (empData: Partial<AdminEmployee>) => {
    try {
      const method = empData.id ? "PUT" : "POST";
      const res = await fetch("/api/admin/employees", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(empData),
      });
      if (!res.ok) throw new Error("Failed to save employee");
      setEmployeeModal(null);
      showSavedLive("/#team", "Employees Section");
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await fetch(`/api/admin/employees?id=${id}`, { method: "DELETE" });
      showSavedLive("/#team", "Employees Section");
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // 8. FAQ Save / Delete
  const handleSaveFaq = async (faqData: Partial<AdminFaq>) => {
    try {
      const method = faqData.id ? "PUT" : "POST";
      const res = await fetch("/api/admin/faqs", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(faqData),
      });
      if (!res.ok) throw new Error("Failed to save FAQ");
      setFaqModal(null);
      showSavedLive("/#faq", "FAQ Section");
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    try {
      await fetch(`/api/admin/faqs?id=${id}`, { method: "DELETE" });
      showSavedLive("/#faq", "FAQ Section");
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // 8b. FAQ Category Save / Delete
  const handleSaveCategory = async (catData: Partial<AdminFaqCategory>) => {
    try {
      const method = catData.id ? "PUT" : "POST";
      const res = await fetch("/api/admin/faq-categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(catData),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save category");
      }
      setCategoryModal(null);
      toast.success("FAQ category saved");
      showSavedLive("/faq", "FAQ Categories");
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? FAQs using it will revert to general.")) return;
    try {
      const res = await fetch(`/api/admin/faq-categories?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete category");
      }
      toast.success("FAQ category deleted");
      showSavedLive("/faq", "FAQ Categories");
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  // 9. Legal Document Save
  const handleSaveLegal = async (legalData: Partial<AdminLegalDoc>) => {
    try {
      const res = await fetch("/api/admin/legal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(legalData),
      });
      if (!res.ok) throw new Error("Failed to save document");
      setLegalModal(null);
      showSavedLive(`/${legalData.slug}`, `${legalData.slug} Page`);
      await onRefresh();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* "Saved · Live" Notification Banner */}
      {savedLiveInfo && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 text-emerald-900">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold">
              Saved · Live ({savedLiveInfo.label})
            </span>
          </div>
          <a
            href={savedLiveInfo.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#374BFF] hover:underline"
          >
            <span>View live</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      {/* CMS Sub-sections navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white border border-black/10 shadow-xs">
        {[
          { id: "hero", label: "Hero" },
          { id: "services", label: "Services" },
          { id: "pricing", label: "Pricing" },
          { id: "stats", label: "Counters" },
          { id: "projects", label: "Showcase" },
          { id: "team-emp", label: "Team & Employees" },
          { id: "faqs", label: "FAQs" },
          { id: "legal", label: "Legal Policies" },
          { id: "seo", label: "SEO & Meta" },
        ].map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id as CmsSection)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSection === sec.id
                ? "bg-[#374BFF] text-white shadow-xs"
                : "text-[#14141A] hover:text-[#374BFF]"
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* SECTION: HERO */}
      {activeSection === "hero" && (
        <div className="rounded-3xl bg-white border border-black/10 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-bold text-[#14141A]">Hero Headline & Subtext</h3>
            <button
              onClick={handleSaveHero}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" /> Save Hero
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-[#14141A]">Main Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-black/15 bg-[#F5F6FC] text-sm font-bold font-heading focus:outline-none focus:border-[#374BFF]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#14141A]">Subtext / Mission Statement</label>
              <textarea
                rows={3}
                value={subtext}
                onChange={(e) => setSubtext(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs sm:text-sm font-medium focus:outline-none focus:border-[#374BFF] resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION: SERVICES */}
      {activeSection === "services" && (
        <div className="rounded-3xl bg-white border border-black/10 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-[#14141A]">Studio Services</h3>
              <p className="text-xs text-[#2B2B38]">Includes "Mobile & Web Apps" service</p>
            </div>
            <button
              onClick={() => setServiceModal({ title: "", desc: "", badge: "NEW CAPABILITY", colSpan: "lg:col-span-1", iconName: "Globe" })}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Service
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s) => (
              <div key={s.id} className="p-5 rounded-2xl bg-[#F5F6FC] border border-black/10 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#374BFF] uppercase">{s.badge}</span>
                  <h4 className="font-heading text-sm font-bold text-[#14141A] mt-1">{s.title}</h4>
                  <p className="text-xs text-[#2B2B38] mt-2 line-clamp-2">{s.desc}</p>
                </div>
                <div className="pt-3 border-t border-black/5 mt-3 flex justify-end">
                  <button
                    onClick={() => setServiceModal(s)}
                    className="p-1.5 rounded-lg text-[#374BFF] hover:bg-white text-xs font-bold flex items-center gap-1"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: PRICING */}
      {activeSection === "pricing" && (
        <div className="rounded-3xl bg-white border border-black/10 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-bold text-[#14141A]">Pricing Plans</h3>
            <button
              onClick={() => setPricingModal({ name: "", price: "₹4,999", desc: "", category: "websites" })}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Plan
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pricing.map((p) => (
              <div key={p.id} className="p-5 rounded-2xl bg-[#F5F6FC] border border-black/10 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#374BFF] uppercase">{p.category}</span>
                  <div className="flex justify-between items-baseline mt-1">
                    <h4 className="font-heading text-sm font-bold text-[#14141A]">{p.name}</h4>
                    <span className="font-mono font-bold text-[#14141A]">{p.price}</span>
                  </div>
                  <p className="text-xs text-[#2B2B38] mt-2 line-clamp-2">{p.desc}</p>
                </div>
                <div className="pt-3 border-t border-black/5 mt-3 flex justify-end">
                  <button
                    onClick={() => setPricingModal(p)}
                    className="p-1.5 rounded-lg text-[#374BFF] hover:bg-white text-xs font-bold flex items-center gap-1"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: STATS COUNTERS */}
      {activeSection === "stats" && (
        <div className="rounded-3xl bg-white border border-black/10 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-bold text-[#14141A]">Stats & Impact Counters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.id} className="p-5 rounded-2xl bg-[#F5F6FC] border border-black/10 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xl font-black text-[#374BFF]">{s.value}</span>
                  <h4 className="font-heading text-xs font-bold text-[#14141A]">{s.label}</h4>
                  <span className="text-[10px] text-[#2B2B38]">{s.section}</span>
                </div>
                <button
                  onClick={() => setStatModal(s)}
                  className="p-1.5 rounded-lg text-[#374BFF] hover:bg-white text-xs font-bold flex items-center gap-1"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: SHOWCASE PROJECTS */}
      {activeSection === "projects" && (
        <div className="rounded-3xl bg-white border border-black/10 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-[#14141A]">Showcase Projects</h3>
              <p className="text-xs text-[#2B2B38]">Reorder sequence • Publish/Unpublish toggle</p>
            </div>
          </div>

          <div className="space-y-3">
            {projects.map((p, idx) => (
              <div key={p.id} className="p-4 rounded-2xl bg-[#F5F6FC] border border-black/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#2B2B38] w-6">
                    #{p.order !== undefined ? p.order : idx}
                  </span>
                  <div>
                    <h4 className="font-heading text-sm font-bold text-[#14141A]">{p.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.status === "Completed" ? "bg-emerald-100 text-emerald-700" : p.status === "Coming Soon" ? "bg-amber-100 text-amber-800" : "bg-zinc-200 text-zinc-700"
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReorderProject(p, -1)}
                    className="p-1 rounded-lg border border-black/10 hover:bg-white text-[#14141A]"
                    title="Move up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleReorderProject(p, 1)}
                    className="p-1 rounded-lg border border-black/10 hover:bg-white text-[#14141A]"
                    title="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleUpdateProjectStatus(p, p.status === "Archived" ? "Completed" : "Archived")}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      p.status === "Archived" ? "bg-emerald-600 text-white" : "border border-black/15 text-[#2B2B38] hover:bg-white"
                    }`}
                  >
                    {p.status === "Archived" ? "Publish" : "Unpublish"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: TEAM & EMPLOYEES */}
      {activeSection === "team-emp" && (
        <div className="rounded-3xl bg-white border border-black/10 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-[#14141A]">Employees Management</h3>
              <p className="text-xs text-[#2B2B38]">
                Hidden while empty • Appears after adding one • Hides again after delete
              </p>
            </div>
            <button
              onClick={() => setEmployeeModal({ name: "", role: "Engineering Associate", skills: "React, Node.js" })}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Employee
            </button>
          </div>

          <div className="space-y-3">
            {employees.length > 0 ? (
              employees.map((emp) => (
                <div key={emp.id} className="p-4 rounded-2xl bg-[#F5F6FC] border border-black/10 flex items-center justify-between">
                  <div>
                    <h4 className="font-heading text-sm font-bold text-[#14141A]">{emp.name}</h4>
                    <p className="text-xs text-[#374BFF] font-semibold">{emp.role}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteEmployee(emp.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-white"
                    title="Delete employee"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-[#2B2B38] bg-[#F5F6FC] rounded-2xl p-4 border border-black/5">
                No employees registered. The public Employees section on the website is currently <strong>hidden</strong>.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION: FAQS */}
      {activeSection === "faqs" && (
        <div className="rounded-3xl bg-white border border-black/10 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-[#14141A]">Frequently Asked Questions</h3>
              <p className="text-xs text-[#2B2B38]">Categorized essentials • Add / Edit / Reorder / Delete</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCategoryModal({ name: "", slug: "", order: faqCategories.length + 1 })}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/15 bg-white text-[#14141A] text-xs font-bold hover:bg-[#F5F6FC] transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add Category
              </button>
              <button
                onClick={() => setFaqModal({ question: "", answer: "", category: faqCategories[0]?.name || "General", categoryId: faqCategories[0]?.id || null, isHome: true })}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add FAQ
              </button>
            </div>
          </div>

          {/* FAQ Categories Management */}
          <div className="p-4 rounded-2xl bg-[#F5F6FC] border border-black/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#14141A]">Categories ({faqCategories.length})</span>
              <span className="text-[11px] text-[#2B2B38]">Click edit or delete to manage tabs</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {faqCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-black/10 text-xs font-medium text-[#14141A]"
                >
                  <span>{cat.name}</span>
                  <button
                    onClick={() => setCategoryModal(cat)}
                    className="p-0.5 hover:text-[#374BFF] cursor-pointer"
                    title="Edit category"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-0.5 hover:text-red-500 cursor-pointer"
                    title="Delete category"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {faqCategories.length === 0 && (
                <span className="text-xs text-[#2B2B38] italic">No categories created yet.</span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {faqs.map((f, idx) => (
              <div key={f.id} className="p-4 rounded-2xl bg-[#F5F6FC] border border-black/10 flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-[#374BFF] uppercase">{f.category}</span>
                  <h4 className="font-heading text-xs sm:text-sm font-bold text-[#14141A] mt-0.5">{f.question}</h4>
                  <p className="text-xs text-[#2B2B38] mt-1 line-clamp-2">{f.answer}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFaqModal(f)}
                    className="p-1 rounded-lg text-[#374BFF] hover:bg-white text-xs font-bold"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteFaq(f.id)}
                    className="p-1 rounded-lg text-red-500 hover:bg-white text-xs font-bold"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: LEGAL POLICIES */}
      {activeSection === "legal" && (
        <div className="rounded-3xl bg-white border border-black/10 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-[#14141A]">Legal Compliance Documents</h3>
              <p className="text-xs text-[#2B2B38]">Privacy Policy, Terms of Service, Cookie Policy</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {["privacy-policy", "terms", "cookie-policy"].map((slug) => {
              const doc = legalDocs.find((d) => d.slug === slug);
              return (
                <div key={slug} className="p-5 rounded-2xl bg-[#F5F6FC] border border-black/10 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-heading text-sm font-bold text-[#14141A] capitalize">
                      {slug.replace("-", " ")}
                    </h4>
                    <span className="text-[11px] text-[#374BFF] font-medium block">
                      Version: {doc?.version || "1.0"}
                    </span>
                    <span className="text-[10px] text-[#2B2B38] block mt-0.5">
                      Last updated: {doc?.lastUpdated ? new Date(doc.lastUpdated).toLocaleDateString("en-IN") : "Default"}
                    </span>
                  </div>
                  <button
                    onClick={() => setLegalModal(doc || { slug, title: slug, content: "" })}
                    className="w-full py-2 rounded-xl bg-white border border-black/15 text-xs font-bold text-[#374BFF] hover:bg-[#374BFF] hover:text-white transition-all cursor-pointer"
                  >
                    Edit Policy
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION: SEO */}
      {activeSection === "seo" && (
        <div className="rounded-3xl bg-white border border-black/10 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-bold text-[#14141A]">SEO Metadata & Site Defaults</h3>
            <button
              onClick={handleSaveSeo}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" /> Save SEO
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-[#14141A]">Meta Title Tag</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#14141A]">Meta Description</label>
              <textarea
                rows={3}
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-medium focus:outline-none focus:border-[#374BFF] resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT SERVICE */}
      {serviceModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-black/10 space-y-3">
            <h4 className="font-heading text-base font-bold">Edit Service</h4>
            <input
              type="text"
              placeholder="Title"
              value={serviceModal.title}
              onChange={(e) => setServiceModal({ ...serviceModal, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs"
            />
            <textarea
              rows={3}
              placeholder="Description"
              value={serviceModal.desc}
              onChange={(e) => setServiceModal({ ...serviceModal, desc: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs"
            />
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setServiceModal(null)} className="px-3 py-1.5 rounded-xl border text-xs">Cancel</button>
              <button onClick={() => handleSaveService(serviceModal)} className="px-3 py-1.5 rounded-xl bg-[#374BFF] text-white font-bold text-xs">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT LEGAL */}
      {legalModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-black/10 space-y-3">
            <h4 className="font-heading text-base font-bold">Edit Legal Policy: {legalModal.slug}</h4>
            <input
              type="text"
              placeholder="Title"
              value={legalModal.title}
              onChange={(e) => setLegalModal({ ...legalModal, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-bold"
            />
            <textarea
              rows={8}
              placeholder="Markdown content"
              value={legalModal.content}
              onChange={(e) => setLegalModal({ ...legalModal, content: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-mono"
            />
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setLegalModal(null)} className="px-3 py-1.5 rounded-xl border text-xs">Cancel</button>
              <button onClick={() => handleSaveLegal(legalModal)} className="px-3 py-1.5 rounded-xl bg-[#374BFF] text-white font-bold text-xs">Save & Publish</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT STAT */}
      {statModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-black/10 space-y-3">
            <h4 className="font-heading text-base font-bold">Edit Counter: {statModal.key}</h4>
            <input
              type="text"
              placeholder="Value (e.g. 15+)"
              value={statModal.value}
              onChange={(e) => setStatModal({ ...statModal, value: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-bold"
            />
            <input
              type="text"
              placeholder="Label"
              value={statModal.label}
              onChange={(e) => setStatModal({ ...statModal, label: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs"
            />
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setStatModal(null)} className="px-3 py-1.5 rounded-xl border text-xs">Cancel</button>
              <button onClick={() => handleSaveStat(statModal)} className="px-3 py-1.5 rounded-xl bg-[#374BFF] text-white font-bold text-xs">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT FAQ */}
      {faqModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-black/10 space-y-3">
            <h4 className="font-heading text-base font-bold text-[#14141A]">FAQ Item</h4>
            <div>
              <label className="block text-[11px] font-bold text-[#2B2B38] mb-1">Category</label>
              <select
                value={faqModal.categoryId || (faqCategories.find(c => c.name.toLowerCase() === faqModal.category?.toLowerCase())?.id || "")}
                onChange={(e) => {
                  const catId = e.target.value;
                  const cat = faqCategories.find(c => c.id === catId);
                  setFaqModal({
                    ...faqModal,
                    categoryId: catId || null,
                    category: cat ? cat.name : (faqModal.category || "General"),
                  });
                }}
                className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-bold text-[#14141A]"
              >
                <option value="">-- Choose Category --</option>
                {faqCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#2B2B38] mb-1">Question</label>
              <input
                type="text"
                placeholder="Question"
                value={faqModal.question || ""}
                onChange={(e) => setFaqModal({ ...faqModal, question: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#2B2B38] mb-1">Answer</label>
              <textarea
                rows={4}
                placeholder="Answer"
                value={faqModal.answer || ""}
                onChange={(e) => setFaqModal({ ...faqModal, answer: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setFaqModal(null)} className="px-3 py-1.5 rounded-xl border text-xs cursor-pointer">Cancel</button>
              <button onClick={() => handleSaveFaq(faqModal)} className="px-3 py-1.5 rounded-xl bg-[#374BFF] text-white font-bold text-xs cursor-pointer">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT FAQ CATEGORY */}
      {categoryModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-black/10 space-y-3">
            <h4 className="font-heading text-base font-bold text-[#14141A]">
              {categoryModal.id ? "Edit Category" : "New FAQ Category"}
            </h4>
            <div>
              <label className="block text-[11px] font-bold text-[#2B2B38] mb-1">Category Name</label>
              <input
                type="text"
                placeholder="e.g. Hosting & Support"
                value={categoryModal.name || ""}
                onChange={(e) => {
                  const name = e.target.value;
                  const autoSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                  setCategoryModal({
                    ...categoryModal,
                    name,
                    slug: categoryModal.slug || autoSlug,
                  });
                }}
                className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#2B2B38] mb-1">Slug</label>
              <input
                type="text"
                placeholder="e.g. hosting-support"
                value={categoryModal.slug || ""}
                onChange={(e) => setCategoryModal({ ...categoryModal, slug: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#2B2B38] mb-1">Display Order</label>
              <input
                type="number"
                value={categoryModal.order ?? 0}
                onChange={(e) => setCategoryModal({ ...categoryModal, order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setCategoryModal(null)} className="px-3 py-1.5 rounded-xl border text-xs cursor-pointer">
                Cancel
              </button>
              <button
                onClick={() => handleSaveCategory(categoryModal)}
                disabled={!categoryModal.name?.trim()}
                className="px-3 py-1.5 rounded-xl bg-[#374BFF] text-white font-bold text-xs disabled:opacity-50 cursor-pointer"
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT EMPLOYEE */}
      {employeeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-black/10 space-y-3">
            <h4 className="font-heading text-base font-bold">Add / Edit Employee</h4>
            <input
              type="text"
              placeholder="Full Name"
              value={employeeModal.name}
              onChange={(e) => setEmployeeModal({ ...employeeModal, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs font-bold"
            />
            <input
              type="text"
              placeholder="Role / Title"
              value={employeeModal.role}
              onChange={(e) => setEmployeeModal({ ...employeeModal, role: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-black/15 bg-[#F5F6FC] text-xs"
            />
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setEmployeeModal(null)} className="px-3 py-1.5 rounded-xl border text-xs">Cancel</button>
              <button onClick={() => handleSaveEmployee(employeeModal)} className="px-3 py-1.5 rounded-xl bg-[#374BFF] text-white font-bold text-xs">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
