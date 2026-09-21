import { HeroSection } from "@/components/sections/hero";
import { AboutSection } from "@/components/sections/about";
import { TeamBentoSection } from "@/components/sections/team-bento";
import { ServicesBentoSection } from "@/components/sections/services-bento";
import { PricingSection } from "@/components/sections/pricing";
import { InnovationLabSection } from "@/components/sections/innovation-lab";
import { ShowcaseGridSection } from "@/components/sections/showcase-grid";
import { WhyUsSection } from "@/components/sections/why-us";
import { FAQSection } from "@/components/sections/faq";
import { RoadmapSection } from "@/components/sections/roadmap";
import { TechMarqueeSection } from "@/components/sections/tech-marquee";
import { ContactFormSection } from "@/components/sections/contact-form";
import { FeedbackSection } from "@/components/sections/feedback-section";
import {
  getHeroContent,
  getServicesContent,
  getShowcaseContent,
  getTeamContent,
  getEmployeesContent,
  getPricingContent,
  getFaqContent,
  getWhyUsStats,
} from "@/lib/dal/content";

export const revalidate = 0;

export default async function MarketingPage() {
  const [
    heroData,
    services,
    showcase,
    team,
    employees,
    pricing,
    faqs,
    whyUsStats,
  ] = await Promise.all([
    getHeroContent(),
    getServicesContent(),
    getShowcaseContent(),
    getTeamContent(),
    getEmployeesContent(),
    getPricingContent(),
    getFaqContent(),
    getWhyUsStats(),
  ]);

  return (
    <div className="relative">
      <HeroSection initialData={heroData} />
      <AboutSection />
      <TeamBentoSection initialTeam={team} initialEmployees={employees} />
      <ServicesBentoSection initialServices={services} />
      <PricingSection initialPlans={pricing} />
      <InnovationLabSection />
      <ShowcaseGridSection initialProjects={showcase} />
      <WhyUsSection initialStats={whyUsStats} />
      <FAQSection initialFaqs={faqs} />
      <RoadmapSection />
      <TechMarqueeSection />
      <ContactFormSection />
      <FeedbackSection />
    </div>
  );
}
