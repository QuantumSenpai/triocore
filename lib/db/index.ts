import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { neon } from "@neondatabase/serverless";
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

export const db = databaseUrl ? drizzle(neon(databaseUrl), { schema }) : null;

export const mockTeamMembers = teamMembers;
export const mockShowcaseProjects = showcaseProjects;
export const mockServices = staticServices;
export const mockPricingPlans = [
  ...websiteDevelopmentPlans.map((p, idx) => ({ ...p, desc: p.desc || "", features: p.features || [], category: "websites", order: idx + 1 })),
  ...localBusinessPlans.map((p, idx) => ({ ...p, desc: p.desc || "", features: p.features || [], category: "local", order: idx + 1 })),
  ...ecommercePlans.map((p, idx) => ({ ...p, desc: p.desc || "", features: p.features || [], category: "ecommerce", order: idx + 1 })),
  ...webAppServices.map((p, idx) => ({ id: `app-${idx}`, name: p.name, price: p.price, desc: (p as any).desc || "", features: [], category: "apps", order: idx + 1 })),
  ...designServices.map((p, idx) => ({ id: `design-${idx}`, name: p.name, price: p.price, desc: "", features: [], category: "design-seo", order: idx + 1 })),
  ...seoServices.map((p, idx) => ({ id: `seo-${idx}`, name: p.name, price: p.price, desc: "", features: [], category: "design-seo", order: idx + 10 })),
  ...maintenancePlans.map((p, idx) => ({ ...p, desc: p.desc || "", features: p.features || [], category: "maintenance", order: idx + 1 })),
];
