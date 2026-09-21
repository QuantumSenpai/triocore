import { db } from "@/lib/db";
import {
  siteContent,
  services,
  pricingPlans,
  showcaseProjects,
  teamMembers,
  employees,
  faqs,
  siteStats,
  legalDocuments,
  contentRevisions,
  auditLogs,
  siteSettings,
} from "@/lib/db/schema";
import {
  services as staticServices,
  showcaseProjects as staticProjects,
  teamMembers as staticTeam,
  ServiceItem,
  ShowcaseProject,
  TeamMember,
} from "@/lib/data/site-content";
import { eq, asc } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "./auth";

// =============================================================================
// Public Read DAL with Graceful Static Fallbacks (Protects deploy-before-migrate)
// =============================================================================

export interface HeroData {
  headline: string;
  subtext: string;
  stats: { key: string; value: string; label: string }[];
}

export async function getHeroContent(): Promise<HeroData> {
  const fallback: HeroData = {
    headline: "Think. Build. Scale.",
    subtext:
      "A forward-engineering digital solutions studio founded by CSE innovators. We craft custom web architectures, Mobile & Web Apps, contactless NFC systems, machine learning pipelines, and robotics hardware across India.",
    stats: [
      { key: "hero_innovators", value: "3", label: "Core Innovators" },
      { key: "hero_services", value: "7", label: "Service Capabilities" },
      { key: "hero_projects", value: "15+", label: "Projects Engineered" },
    ],
  };

  if (!db) return fallback;

  try {
    const contents = await db
      .select()
      .from(siteContent)
      .where(eq(siteContent.section, "hero"));

    const headline = contents.find((c) => c.key === "hero_headline")?.value || fallback.headline;
    const subtext = contents.find((c) => c.key === "hero_subtext")?.value || fallback.subtext;

    const statsRows = await db
      .select()
      .from(siteStats)
      .where(eq(siteStats.section, "hero"))
      .orderBy(asc(siteStats.order));

    const stats = statsRows.length > 0 ? statsRows : fallback.stats;

    return { headline, subtext, stats };
  } catch (error) {
    console.warn("DAL fallback: getHeroContent returned defaults due to error:", (error as Error).message);
    return fallback;
  }
}

export interface AboutData {
  title: string;
  description: string;
}

export async function getAboutContent(): Promise<AboutData> {
  const fallback: AboutData = {
    title: "Built By Engineers. Driven By Innovation.",
    description:
      "We are computer science innovators who build high-performance digital tools, mobile & web apps, and intelligent embedded systems.",
  };

  if (!db) return fallback;

  try {
    const contents = await db
      .select()
      .from(siteContent)
      .where(eq(siteContent.section, "about"));

    const title = contents.find((c) => c.key === "about_title")?.value || fallback.title;
    const description = contents.find((c) => c.key === "about_description")?.value || fallback.description;

    return { title, description };
  } catch {
    return fallback;
  }
}

export async function getServicesContent(): Promise<ServiceItem[]> {
  if (!db) return staticServices;

  try {
    const rows = await db.select().from(services).orderBy(asc(services.order));
    if (rows.length === 0) return staticServices;
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      desc: r.desc,
      badge: r.badge,
      colSpan: r.colSpan,
      features: (r.features as string[]) || [],
      accent: r.accent,
      iconName: r.iconName,
    }));
  } catch (error) {
    console.warn("DAL fallback: getServicesContent returned defaults:", (error as Error).message);
    return staticServices;
  }
}

export async function getShowcaseContent(): Promise<ShowcaseProject[]> {
  if (!db) return staticProjects;

  try {
    const rows = await db
      .select()
      .from(showcaseProjects)
      .where(eq(showcaseProjects.isPublished, true))
      .orderBy(asc(showcaseProjects.order));

    if (rows.length === 0) return staticProjects;
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      imageUrl: r.imageUrl,
      liveUrl: r.liveUrl || "",
      tech: (r.tech as string[]) || [],
      status: (r.status as "Completed" | "Coming Soon") || "Completed",
      order: r.order,
      category: r.category || "Web",
    }));
  } catch (error) {
    console.warn("DAL fallback: getShowcaseContent returned defaults:", (error as Error).message);
    return staticProjects;
  }
}

export async function getTeamContent(): Promise<TeamMember[]> {
  if (!db) return staticTeam;

  try {
    const rows = await db.select().from(teamMembers).orderBy(asc(teamMembers.order));
    if (rows.length === 0) return staticTeam;
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      role: r.role,
      avatarUrl: r.avatarUrl,
      skills: (r.skills as string[]) || [],
      projects: (r.projects as { title: string; desc?: string }[]) || [],
      githubUrl: r.githubUrl || undefined,
      linkedinUrl: r.linkedinUrl || undefined,
      order: r.order,
    }));
  } catch (error) {
    console.warn("DAL fallback: getTeamContent returned defaults:", (error as Error).message);
    return staticTeam;
  }
}

export async function getEmployeesContent(): Promise<TeamMember[]> {
  if (!db) return [];

  try {
    const rows = await db.select().from(employees).orderBy(asc(employees.order));
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      role: r.role,
      avatarUrl: r.avatarUrl,
      skills: (r.skills as string[]) || [],
      projects: (r.projects as { title: string; desc?: string }[]) || [],
      githubUrl: r.githubUrl || undefined,
      linkedinUrl: r.linkedinUrl || undefined,
      order: r.order,
    }));
  } catch {
    return [];
  }
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export async function getFaqContent(): Promise<FaqItem[]> {
  const fallback: FaqItem[] = [
    {
      id: "faq-pricing",
      question: "Are your prices fixed or will they increase later?",
      answer:
        "Our package prices are completely fixed for the features outlined in your agreed project scope. If you decide to add brand-new pages or advanced functionality halfway through, we discuss the exact add-on price upfront before writing a single line of extra code. There are zero hidden fees.",
      category: "Pricing",
      order: 1,
    },
    {
      id: "faq-timeline",
      question: "How long does a project typically take to deliver?",
      answer:
        "Starter and 1-page websites are delivered within 48 to 72 hours. Business websites (3–5 pages) take 4 to 7 days. Complex web applications and custom systems typically take 1 to 3 weeks depending on the feature list.",
      category: "Timeline",
      order: 2,
    },
    {
      id: "faq-ownership",
      question: "Who owns the code after project completion?",
      answer:
        "Upon final project settlement, you receive 100% full source code ownership. We transfer all project repositories, database credentials, and production deployments directly to you with zero vendor lock-in or recurring license fees.",
      category: "Trust",
      order: 3,
    },
    {
      id: "faq-revisions",
      question: "What if I want revisions or changes after seeing the first version?",
      answer:
        "Every project includes dedicated revision rounds. If you want to tweak colors, swap images, adjust copy, or refine section layouts, we make the changes promptly during the staging review stage until you are 100% satisfied.",
      category: "Process",
      order: 4,
    },
    {
      id: "faq-hosting",
      question: "Do you provide hosting, domain setup, and ongoing technical support?",
      answer:
        "Yes. We handle hosting deployment configuration on top-tier global edge networks (Vercel/Cloudflare), guide you step-by-step through domain purchasing in your name, and provide post-launch support with optional care plans starting at ₹299/month.",
      category: "Support",
      order: 5,
    },
  ];

  if (!db) return fallback;

  try {
    const rows = await db
      .select()
      .from(faqs)
      .where(eq(faqs.isHome, true))
      .orderBy(asc(faqs.order));

    if (rows.length === 0) return fallback;
    return rows.map((r) => ({
      id: r.id,
      question: r.question,
      answer: r.answer,
      category: r.category,
      order: r.order,
    }));
  } catch (error) {
    console.warn("DAL fallback: getFaqContent returned defaults:", (error as Error).message);
    return fallback;
  }
}

export async function getPricingContent() {
  if (!db) return [];

  try {
    return await db.select().from(pricingPlans).orderBy(asc(pricingPlans.order));
  } catch {
    return [];
  }
}

export async function getLegalDocument(slug: string) {
  if (!db) return null;

  try {
    const rows = await db
      .select()
      .from(legalDocuments)
      .where(eq(legalDocuments.slug, slug))
      .limit(1);

    if (rows.length > 0) return rows[0];
    return null;
  } catch {
    return null;
  }
}

export async function getSiteSettings(key: string) {
  if (!db) return null;

  try {
    const rows = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, key))
      .limit(1);

    if (rows.length > 0) return rows[0].value;
    return null;
  } catch {
    return null;
  }
}

export async function getWhyUsStats() {
  const fallback = [
    { value: 100, suffix: "%", label: "Transparent Execution" },
    { staticDisplay: "24/7", label: "Founder-Level Support" },
    { value: 48, suffix: "h", label: "First Prototype Turnaround" },
    { value: 99, suffix: ".9%", label: "Architecture Uptime SLA" },
  ];

  if (!db) return fallback;

  try {
    const whyStatsFromDb = await db
      .select()
      .from(siteStats)
      .where(eq(siteStats.section, "why_us"))
      .orderBy(asc(siteStats.order));

    if (whyStatsFromDb.length >= 1) {
      return whyStatsFromDb.map((s) => {
        const val = (s.value || "").trim();
        if (val === "24/7" || val === "24 / 7" || val.includes("/")) {
          return { staticDisplay: val, label: s.label };
        }
        const parsedNum = parseInt(val, 10);
        if (!isNaN(parsedNum)) {
          const suffix = val.replace(String(parsedNum), "");
          return { value: parsedNum, suffix, label: s.label };
        }
        return { staticDisplay: val, label: s.label };
      });
    }
    return fallback;
  } catch {
    return fallback;
  }
}

// =============================================================================
// Mutating Admin DAL with Audit Log, Revisions, & Instant Revalidation
// =============================================================================

export async function saveSiteContent(
  key: string,
  value: string,
  section: string,
  label: string
) {
  const auth = await requireAdmin();
  if (!auth.authorized || !auth.user) {
    throw new Error("Unauthorized");
  }

  if (!db) throw new Error("Database not connected");

  const now = new Date();

  // 1. Upsert site_content
  await db
    .insert(siteContent)
    .values({
      id: key,
      key,
      value,
      section,
      label,
      updatedBy: auth.user.email,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: siteContent.key,
      set: {
        value,
        updatedBy: auth.user.email,
        updatedAt: now,
      },
    });

  // 2. Insert content_revisions
  try {
    await db.insert(contentRevisions).values({
      section,
      data: { key, value, label },
      createdBy: auth.user.email,
      createdAt: now,
    });
  } catch {}

  // 3. Insert audit_logs
  try {
    await db.insert(auditLogs).values({
      userId: auth.user.id,
      action: "UPDATE_SITE_CONTENT",
      entityType: "site_content",
      entityId: key,
      details: { key, section, label },
      createdAt: now,
    });
  } catch {}

  // 4. Instant revalidation
  revalidatePath("/", "layout");
  revalidatePath("/(marketing)", "layout");
  try {
    revalidateTag("site-content", "default");
  } catch {}

  return { success: true, key, value };
}
