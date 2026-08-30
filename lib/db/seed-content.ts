import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { db } from "./index";
import {
  showcaseProjects as showcaseProjectsTable,
  teamMembers as teamMembersTable,
  services as servicesTable,
  pricingPlans as pricingPlansTable,
  siteStats as siteStatsTable,
} from "./schema";
import {
  showcaseProjects,
  teamMembers,
  services,
  websiteDevelopmentPlans,
  localBusinessPlans,
  ecommercePlans,
  maintenancePlans,
} from "../data/site-content";
import { eq, and, sql } from "drizzle-orm";

const initialSiteStats = [
  { key: "hero_innovators", value: "3", label: "Core Innovators", section: "hero", order: 1 },
  { key: "hero_services", value: "6", label: "Service Capabilities", section: "hero", order: 2 },
  { key: "hero_projects", value: "15+", label: "Projects Engineered", section: "hero", order: 3 },
  { key: "why_code", value: "100%", label: "Custom Tailored Code", section: "why_us", order: 1 },
  { key: "why_speed", value: "3x", label: "Faster Turnaround Rate", section: "why_us", order: 2 },
  { key: "why_access", value: "24/7", label: "Direct Developer Access", section: "why_us", order: 3 },
  { key: "why_builds", value: "15+", label: "Total Builds Delivered", section: "why_us", order: 4 },
];

async function main() {
  if (!db) {
    console.error("Database connection unavailable. Verify DATABASE_URL in .env.local");
    process.exit(1);
  }

  const isForce = process.argv.includes("--force");
  console.log(`Starting content seed${isForce ? " (FORCE CLEAR ENABLED)" : " (IDEMPOTENT SAFE)"}...\n`);

  console.log("Ensuring database tables and columns exist in Neon...");
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "team_members" (
      "id" text PRIMARY KEY,
      "name" text NOT NULL,
      "role" text NOT NULL,
      "avatar_url" text NOT NULL,
      "skills" jsonb NOT NULL,
      "projects" jsonb NOT NULL,
      "github_url" text,
      "linkedin_url" text,
      "order" integer DEFAULT 0 NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  await db.execute(sql`
    ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "linkedin_url" text;
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "showcase_projects" (
      "id" text PRIMARY KEY,
      "title" text NOT NULL,
      "description" text NOT NULL,
      "image_url" text NOT NULL,
      "live_url" text,
      "tech" jsonb NOT NULL,
      "status" text DEFAULT 'Completed' NOT NULL,
      "order" integer DEFAULT 0 NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "services" (
      "id" text PRIMARY KEY,
      "title" text NOT NULL,
      "desc" text NOT NULL,
      "badge" text NOT NULL,
      "col_span" text DEFAULT 'lg:col-span-1' NOT NULL,
      "features" jsonb NOT NULL,
      "accent" text DEFAULT 'from-[#374BFF] to-[#14141A]' NOT NULL,
      "icon_name" text DEFAULT 'Globe' NOT NULL,
      "order" integer DEFAULT 0 NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "pricing_plans" (
      "id" text PRIMARY KEY,
      "name" text NOT NULL,
      "price" text NOT NULL,
      "original_price" text,
      "savings" text,
      "period" text,
      "badge" text,
      "is_popular" boolean DEFAULT false NOT NULL,
      "is_best_value" boolean DEFAULT false NOT NULL,
      "desc" text NOT NULL,
      "features" jsonb NOT NULL,
      "category" text DEFAULT 'websites' NOT NULL,
      "order" integer DEFAULT 0 NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "site_stats" (
      "id" text PRIMARY KEY,
      "section" text DEFAULT 'hero' NOT NULL,
      "key" text UNIQUE NOT NULL,
      "value" text NOT NULL,
      "label" text NOT NULL,
      "order" integer DEFAULT 0 NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  await db.execute(sql`
    ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'Unread' NOT NULL;
  `);

  console.log("Database tables verified.\n");

  if (isForce) {
    console.log("Clearing existing table records...");
    await db.delete(showcaseProjectsTable);
    await db.delete(teamMembersTable);
    await db.delete(servicesTable);
    await db.delete(pricingPlansTable);
    await db.delete(siteStatsTable);
    console.log("Tables cleared successfully.\n");
  }

  console.log("--- Seeding Showcase Projects ---");
  for (const project of showcaseProjects) {
    try {
      const existing = await db
        .select()
        .from(showcaseProjectsTable)
        .where(eq(showcaseProjectsTable.title, project.title));

      if (existing.length > 0) {
        console.log(`[SKIPPED] Showcase project "${project.title}" already exists`);
      } else {
        await db.insert(showcaseProjectsTable).values({
          title: project.title,
          description: project.description,
          imageUrl: project.imageUrl,
          liveUrl: project.liveUrl,
          tech: project.tech,
          status: project.status,
          order: project.order,
        });
        console.log(`[INSERTED] Showcase project "${project.title}"`);
      }
    } catch (error) {
      console.error(`[ERROR] Failed to seed project "${project.title}":`, (error as Error).message);
    }
  }

  console.log("\n--- Seeding Team Members ---");
  for (const member of teamMembers) {
    try {
      const existing = await db
        .select()
        .from(teamMembersTable)
        .where(eq(teamMembersTable.name, member.name));

      if (existing.length > 0) {
        console.log(`[SKIPPED] Team member "${member.name}" already exists`);
      } else {
        await db.insert(teamMembersTable).values({
          name: member.name,
          role: member.role,
          avatarUrl: member.avatarUrl,
          skills: member.skills,
          projects: member.projects,
          githubUrl: member.githubUrl,
          linkedinUrl: member.linkedinUrl || null,
          order: member.order,
        });
        console.log(`[INSERTED] Team member "${member.name}"`);
      }
    } catch (error) {
      console.error(`[ERROR] Failed to seed team member "${member.name}":`, (error as Error).message);
    }
  }

  console.log("\n--- Seeding Services ---");
  for (let i = 0; i < services.length; i++) {
    const service = services[i];
    try {
      const existing = await db
        .select()
        .from(servicesTable)
        .where(eq(servicesTable.title, service.title));

      if (existing.length > 0) {
        console.log(`[SKIPPED] Service "${service.title}" already exists`);
      } else {
        await db.insert(servicesTable).values({
          title: service.title,
          desc: service.desc,
          badge: service.badge,
          colSpan: service.colSpan || "lg:col-span-1",
          features: service.features,
          accent: service.accent || "from-[#374BFF] to-[#14141A]",
          iconName: service.iconName || "Globe",
          order: i + 1,
        });
        console.log(`[INSERTED] Service "${service.title}"`);
      }
    } catch (error) {
      console.error(`[ERROR] Failed to seed service "${service.title}":`, (error as Error).message);
    }
  }

  console.log("\n--- Seeding Pricing Plans ---");
  const allPricingPlans = [
    ...websiteDevelopmentPlans.map((p, idx) => ({ ...p, category: "websites", order: idx + 1 })),
    ...localBusinessPlans.map((p, idx) => ({ ...p, category: "local", order: idx + 1 })),
    ...ecommercePlans.map((p, idx) => ({ ...p, category: "ecommerce", order: idx + 1 })),
    ...maintenancePlans.map((p, idx) => ({ ...p, category: "maintenance", order: idx + 1 })),
  ];

  for (const plan of allPricingPlans) {
    try {
      const existing = await db
        .select()
        .from(pricingPlansTable)
        .where(
          and(
            eq(pricingPlansTable.name, plan.name),
            eq(pricingPlansTable.category, plan.category)
          )
        );

      if (existing.length > 0) {
        console.log(`[SKIPPED] Pricing plan "${plan.name}" (${plan.category}) already exists`);
      } else {
        await db.insert(pricingPlansTable).values({
          name: plan.name,
          price: plan.price,
          originalPrice: plan.originalPrice || null,
          savings: plan.savings || null,
          period: plan.period || null,
          badge: plan.badge || null,
          isPopular: plan.isPopular || false,
          isBestValue: plan.isBestValue || false,
          desc: plan.desc || "",
          features: plan.features || [],
          category: plan.category,
          order: plan.order,
        });
        console.log(`[INSERTED] Pricing plan "${plan.name}" (${plan.category})`);
      }
    } catch (error) {
      console.error(`[ERROR] Failed to seed pricing plan "${plan.name}":`, (error as Error).message);
    }
  }

  console.log("\n--- Seeding Site Stats ---");
  for (const stat of initialSiteStats) {
    try {
      const existing = await db
        .select()
        .from(siteStatsTable)
        .where(eq(siteStatsTable.key, stat.key));

      if (existing.length > 0) {
        console.log(`[SKIPPED] Site stat "${stat.key}" already exists`);
      } else {
        await db.insert(siteStatsTable).values({
          key: stat.key,
          value: stat.value,
          label: stat.label,
          section: stat.section,
          order: stat.order,
        });
        console.log(`[INSERTED] Site stat "${stat.key}" (${stat.value} - ${stat.label})`);
      }
    } catch (error) {
      console.error(`[ERROR] Failed to seed site stat "${stat.key}":`, (error as Error).message);
    }
  }

  console.log("\nContent seeding complete.");
  process.exit(0);
}

main();
