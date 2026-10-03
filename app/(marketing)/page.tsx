import dynamic from "next/dynamic";
import { HeroSection } from "@/components/sections/hero";
import { AboutSection } from "@/components/sections/about";
import { TeamBentoSection } from "@/components/sections/team-bento";
import { ServicesBentoSection } from "@/components/sections/services-bento";

const PricingSection = dynamic(() =>
  import("@/components/sections/pricing").then((mod) => mod.PricingSection)
);
const InnovationLabSection = dynamic(() =>
  import("@/components/sections/innovation-lab").then((mod) => mod.InnovationLabSection)
);
const ShowcaseGridSection = dynamic(() =>
  import("@/components/sections/showcase-grid").then((mod) => mod.ShowcaseGridSection)
);
const WhyUsSection = dynamic(() =>
  import("@/components/sections/why-us").then((mod) => mod.WhyUsSection)
);
const FAQSection = dynamic(() =>
  import("@/components/sections/faq").then((mod) => mod.FAQSection)
);
const RoadmapSection = dynamic(() =>
  import("@/components/sections/roadmap").then((mod) => mod.RoadmapSection)
);
const TechMarqueeSection = dynamic(() =>
  import("@/components/sections/tech-marquee").then((mod) => mod.TechMarqueeSection)
);
const ContactFormSection = dynamic(() =>
  import("@/components/sections/contact-form").then((mod) => mod.ContactFormSection)
);
const FeedbackSection = dynamic(() =>
  import("@/components/sections/feedback-section").then((mod) => mod.FeedbackSection)
);
import {
  getHeroContent,
  getServicesContent,
  getShowcaseContent,
  getTeamContent,
  getEmployeesContent,
  getPricingContent,
  getPricingCategories,
  getFaqContent,
  getWhyUsStats,
  getFaqCategories,
  getLaunchOfferContent,
} from "@/lib/dal/content";

export const revalidate = 60;

export default async function MarketingPage() {
  const [
    heroData,
    services,
    showcase,
    team,
    employees,
    pricing,
    pricingCategories,
    faqs,
    whyUsStats,
    faqCategories,
    launchOffer,
  ] = await Promise.all([
    getHeroContent(),
    getServicesContent(),
    getShowcaseContent(),
    getTeamContent(),
    getEmployeesContent(),
    getPricingContent(),
    getPricingCategories(),
    getFaqContent(),
    getWhyUsStats(),
    getFaqCategories(),
    getLaunchOfferContent(),
  ]);

  return (
    <div className="relative">
      <HeroSection initialData={heroData} />
      <AboutSection />
      <TeamBentoSection initialTeam={team} initialEmployees={employees} />
      <ServicesBentoSection initialServices={services} />
      <PricingSection
        initialPlans={pricing}
        initialCategories={pricingCategories}
        initialLaunchOffer={launchOffer}
      />
      <InnovationLabSection />
      <ShowcaseGridSection initialProjects={showcase} />
      <WhyUsSection initialStats={whyUsStats} />
      <FAQSection initialFaqs={faqs} initialCategories={faqCategories} />
      <RoadmapSection />
      <TechMarqueeSection />
      <ContactFormSection />
      <FeedbackSection />
    </div>
  );
}
