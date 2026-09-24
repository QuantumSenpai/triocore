import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { 
  teamMembers, 
  showcaseProjects, 
  services as staticServices,
  websiteDevelopmentPlans,
  localBusinessPlans,
  ecommercePlans,
  webAppServices,
  designServices,
  seoServices,
  maintenancePlans
} from "@/lib/data/site-content";

const databaseUrl = process.env.DATABASE_URL;

// Cold-start retry wrapper for Neon serverless HTTP queries:
// Absorbs transient compute wake-up timeouts, connection drops, and 5xx responses.
if (typeof neonConfig !== "undefined") {
  const originalFetch = neonConfig.fetchFunction || globalThis.fetch;
  neonConfig.fetchFunction = async (input: RequestInfo | URL, init?: RequestInit) => {
    let lastErr: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await originalFetch(input, init);
        // Retry transient serverless cluster wake-up errors (500, 502, 503, 504, 408)
        if (!res.ok && (res.status >= 500 || res.status === 408) && attempt < 2) {
          const delay = attempt === 0 ? 1200 : 2500;
          console.warn(`[Neon Driver] Transient HTTP ${res.status} during cold start, retrying in ${delay}ms...`);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        return res;
      } catch (err) {
        lastErr = err;
        if (attempt < 2) {
          const delay = attempt === 0 ? 1200 : 2500;
          console.warn(`[Neon Driver] Connection dropped during cold start (${(err as Error)?.message || "fetch failed"}), retrying in ${delay}ms...`);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
      }
    }
    throw lastErr;
  };
}

export const db = databaseUrl ? drizzle(neon(databaseUrl), { schema }) : null;

export const mockTeamMembers = teamMembers;
export const mockShowcaseProjects = showcaseProjects;
export const mockServices = staticServices;
export const mockPricingPlans = [
  ...websiteDevelopmentPlans.map((p, idx) => ({ ...p, desc: p.desc || "", features: p.features || [], category: "websites", order: idx + 1 })),
  ...localBusinessPlans.map((p, idx) => ({ ...p, desc: p.desc || "", features: p.features || [], category: "local", order: idx + 1 })),
  ...ecommercePlans.map((p, idx) => ({ ...p, desc: p.desc || "", features: p.features || [], category: "ecommerce", order: idx + 1 })),
  ...webAppServices.map((p, idx) => ({ id: `app-${idx}`, name: p.name, price: p.price, desc: ("desc" in p ? (p as { desc: string }).desc : ""), features: [], category: "apps", order: idx + 1 })),
  ...designServices.map((p, idx) => ({ id: `design-${idx}`, name: p.name, price: p.price, desc: "", features: [], category: "design-seo", order: idx + 1 })),
  ...seoServices.map((p, idx) => ({ id: `seo-${idx}`, name: p.name, price: p.price, desc: "", features: [], category: "design-seo", order: idx + 10 })),
  ...maintenancePlans.map((p, idx) => ({ ...p, desc: p.desc || "", features: p.features || [], category: "maintenance", order: idx + 1 })),
];
export const mockSiteStats = [
  { id: "stat-1", key: "hero_innovators", value: "3", label: "Core Innovators", section: "hero", order: 1 },
  { id: "stat-2", key: "hero_services", value: "6", label: "Service Capabilities", section: "hero", order: 2 },
  { id: "stat-3", key: "hero_projects", value: "15+", label: "Projects Engineered", section: "hero", order: 3 },
  { id: "stat-4", key: "why_code", value: "100%", label: "Client Code Ownership", section: "why_us", order: 1 },
  { id: "stat-5", key: "why_speed", value: "Direct", label: "Developer Communication", section: "why_us", order: 2 },
  { id: "stat-6", key: "why_access", value: "Fixed", label: "Milestone Pricing", section: "why_us", order: 3 },
  { id: "stat-7", key: "why_builds", value: "15+", label: "Total Builds Delivered", section: "why_us", order: 4 },
];
