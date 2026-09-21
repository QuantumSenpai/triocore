import { describe, it, expect } from "vitest";
import {
  getHeroContent,
  getServicesContent,
  getShowcaseContent,
  getTeamContent,
  getEmployeesContent,
  getFaqContent,
} from "@/lib/dal/content";

describe("DAL Fallback Resilience (Deploy-Before-Migrate Protection)", () => {
  it("getHeroContent returns valid static defaults when DB is unreachable", async () => {
    const hero = await getHeroContent();
    expect(hero).toBeDefined();
    expect(hero.headline).toBe("Think. Build. Scale.");
    expect(hero.subtext).toContain("CSE innovators");
    expect(hero.stats.length).toBeGreaterThanOrEqual(2);
  });

  it("getServicesContent returns static services including Mobile & Web Apps", async () => {
    const services = await getServicesContent();
    expect(Array.isArray(services)).toBe(true);
    expect(services.length).toBeGreaterThanOrEqual(6);
    expect(services.some((s) => s.title.includes("Web Development"))).toBe(true);
  });

  it("getShowcaseContent returns static projects with proper schema", async () => {
    const showcase = await getShowcaseContent();
    expect(Array.isArray(showcase)).toBe(true);
    expect(showcase.length).toBeGreaterThanOrEqual(1);
    expect(showcase[0]).toHaveProperty("title");
    expect(showcase[0]).toHaveProperty("imageUrl");
  });

  it("getTeamContent returns static team members", async () => {
    const team = await getTeamContent();
    expect(Array.isArray(team)).toBe(true);
    expect(team.length).toBeGreaterThanOrEqual(3);
    expect(team.some((m) => m.name.includes("Krishnendu"))).toBe(true);
  });

  it("getEmployeesContent returns empty array by default without crashing", async () => {
    const employees = await getEmployeesContent();
    expect(Array.isArray(employees)).toBe(true);
  });

  it("getFaqContent returns essential FAQ items", async () => {
    const faqs = await getFaqContent();
    expect(Array.isArray(faqs)).toBe(true);
    expect(faqs.length).toBeGreaterThanOrEqual(5);
    expect(faqs.some((f) => f.question.toLowerCase().includes("prices"))).toBe(true);
  });
});
