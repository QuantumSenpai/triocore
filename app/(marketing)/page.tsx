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

export default function MarketingPage() {
  return (
    <div className="relative">
      <HeroSection />
      <AboutSection />
      <TeamBentoSection />
      <ServicesBentoSection />
      <PricingSection />
      <InnovationLabSection />
      <ShowcaseGridSection />
      <WhyUsSection />
      <FAQSection />
      <RoadmapSection />
      <TechMarqueeSection />
      <ContactFormSection />
    </div>
  );
}
