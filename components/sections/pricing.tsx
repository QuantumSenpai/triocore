"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Check, 
  Sparkles, 
  ArrowRight, 
  Flame, 
  HelpCircle, 
  ChevronDown, 
  ShieldCheck, 
  Tag, 
  Layers 
} from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { 
  launchOffers, 
  comboPackages, 
  websiteDevelopmentPlans as staticWebsitePlans, 
  localBusinessPlans as staticLocalPlans, 
  ecommercePlans as staticEcommercePlans, 
  webAppServices, 
  designServices, 
  seoServices, 
  maintenancePlans, 
  addOns, 
  pricingTerms,
  PricingPlan
} from "@/lib/data/site-content";
import { cn } from "@/lib/utils";

type PricingCategory = 
  | "websites" 
  | "local" 
  | "ecommerce" 
  | "combos" 
  | "apps" 
  | "design-seo" 
  | "maintenance";

export function PricingSection() {
  const [activeCategory, setActiveCategory] = useState<PricingCategory>("websites");
  const [showTerms, setShowTerms] = useState(false);
  const [websitePlans, setWebsitePlans] = useState<PricingPlan[]>(staticWebsitePlans);
  const [localPlans, setLocalPlans] = useState<PricingPlan[]>(staticLocalPlans);
  const [ecomPlans, setEcomPlans] = useState<PricingPlan[]>(staticEcommercePlans);

  useEffect(() => {
    fetch("/api/admin/pricing")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.plans && data.plans.length > 0) {
          const web = data.plans.filter((p: any) => p.category === "websites");
          const loc = data.plans.filter((p: any) => p.category === "local");
          const ecom = data.plans.filter((p: any) => p.category === "ecommerce");

          if (web.length > 0) setWebsitePlans(web);
          if (loc.length > 0) setLocalPlans(loc);
          if (ecom.length > 0) setEcomPlans(ecom);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="pricing" className="relative py-24 sm:py-32 px-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <Reveal direction="down">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#374BFF]/30 bg-[#374BFF]/10 text-xs font-bold uppercase tracking-widest text-[#374BFF] dark:text-[#CFFF04] font-heading mb-3">
              <Tag className="h-3.5 w-3.5" /> Direct INR Pricing • India 🇮🇳
            </span>
          </Reveal>

          <Reveal direction="up" delay={0.08}>
            <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-[#14141A] dark:text-[#F5F6FC]">
              Affordable Engineering. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#374BFF] via-[#374BFF] to-[#CFFF04]">
                Built for Indian Businesses.
              </span>
            </h2>
          </Reveal>

          <Reveal direction="up" delay={0.16}>
            <p className="mt-4 text-sm sm:text-base md:text-lg text-[#2B2B38] dark:text-[#F5F6FC]/85 font-sans font-medium">
              Transparent, student-friendly rates with zero agency markups. From rapid ₹999 launch pages to scalable Next.js 15 enterprise web applications.
            </p>
          </Reveal>
        </div>

        <Reveal direction="up" delay={0.2}>
          <div className="mb-12 sm:mb-16 rounded-3xl border-2 border-[#CFFF04]/80 dark:border-[#CFFF04]/60 bg-gradient-to-br from-[#374BFF]/15 via-[#FFFFFF] to-[#CFFF04]/20 dark:from-[#1C1C26] dark:via-[#14141A] dark:to-[#1C1C26] p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#CFFF04] text-[#14141A]">
                    <Flame className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-[#14141A] dark:text-[#CFFF04] font-heading">
                    Launch Offer — First 10 Clients Only 🎉
                  </span>
                </div>
                <h3 className="font-heading text-xl sm:text-2xl font-black text-[#14141A] dark:text-[#F5F6FC]">
                  Lock In Special Early-Bird Discounts
                </h3>
                <p className="text-xs sm:text-sm text-[#2B2B38] dark:text-[#D5D7E6] font-medium max-w-xl">
                  Kickstart your digital presence at direct student-developer rates. Limited to the first 10 projects onboarded this season.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {launchOffers.map((offer) => (
                  <div
                    key={offer.title}
                    className="rounded-2xl border border-[#14141A]/15 dark:border-[#374BFF]/30 bg-white dark:bg-[#14141A] p-3 sm:p-3.5 text-center shadow-sm"
                  >
                    <p className="text-[11px] font-bold text-[#14141A] dark:text-[#F5F6FC] truncate">
                      {offer.title}
                    </p>
                    <div className="mt-1 flex items-center justify-center gap-1.5">
                      <span className="text-[11px] text-[#14141A]/50 dark:text-[#F5F6FC]/50 line-through">
                        {offer.originalPrice}
                      </span>
                      <span className="font-heading text-sm font-black text-[#374BFF] dark:text-[#CFFF04]">
                        {offer.launchPrice}
                      </span>
                    </div>
                    <span className="mt-1 inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      {offer.savings}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal direction="down">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {(
              [
                { id: "websites", label: "Web Development" },
                { id: "local", label: "Local Business" },
                { id: "ecommerce", label: "E-Commerce" },
                { id: "combos", label: "Combo Packages" },
                { id: "apps", label: "Web Apps & SaaS" },
                { id: "design-seo", label: "Design & SEO" },
                { id: "maintenance", label: "Maintenance" },
              ] as { id: PricingCategory; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={cn(
                  "px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer",
                  activeCategory === tab.id
                    ? "bg-[#374BFF] text-white shadow-lg shadow-[#374BFF]/25 scale-105"
                    : "border border-[#14141A]/12 dark:border-[#374BFF]/20 bg-white dark:bg-[#1C1C26] text-[#2B2B38] dark:text-[#F5F6FC]/80 hover:border-[#374BFF]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </Reveal>

        {activeCategory === "websites" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {websitePlans.map((plan, idx) => (
              <Reveal key={plan.id} direction="up" delay={idx * 0.06}>
                <div
                  className={cn(
                    "glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between h-full relative group",
                    plan.isPopular && "border-2 border-[#374BFF] shadow-xl shadow-[#374BFF]/15",
                    plan.isBestValue && "border-2 border-[#CFFF04] shadow-xl shadow-[#CFFF04]/15"
                  )}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-xl font-bold text-[#14141A] dark:text-[#F5F6FC]">
                        {plan.name}
                      </h3>
                      {plan.badge && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#CFFF04] text-[#14141A] shadow-sm">
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="font-heading text-3xl sm:text-4xl font-black text-[#374BFF] dark:text-[#F5F6FC]">
                        {plan.price}
                      </span>
                    </div>

                    <p className="text-xs text-[#2B2B38] dark:text-[#D5D7E6] font-medium leading-relaxed">
                      {plan.desc}
                    </p>

                    <div className="space-y-2.5 pt-3 border-t border-[#14141A]/10 dark:border-white/10">
                      {(plan.features || []).map((feat) => (
                        <div key={feat} className="flex items-start gap-2.5 text-xs text-[#14141A] dark:text-[#F5F6FC] font-semibold">
                          <Check className="h-4 w-4 text-[#374BFF] dark:text-[#CFFF04] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#14141A]/10 dark:border-white/10">
                    <Link
                      href="#contact"
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#374BFF] py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#374BFF]/20 hover:bg-[#14141A] dark:hover:bg-[#CFFF04] dark:hover:text-[#14141A] transition-all"
                    >
                      <span>Choose {plan.name}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {activeCategory === "local" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {localPlans.map((plan, idx) => (
              <Reveal key={plan.id} direction="up" delay={idx * 0.08}>
                <div
                  className={cn(
                    "glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between h-full relative group",
                    plan.isPopular && "border-2 border-[#374BFF] shadow-xl shadow-[#374BFF]/15"
                  )}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-xl font-bold text-[#14141A] dark:text-[#F5F6FC]">
                        {plan.name}
                      </h3>
                      {plan.badge && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#CFFF04] text-[#14141A] shadow-sm">
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="font-heading text-3xl sm:text-4xl font-black text-[#374BFF] dark:text-[#F5F6FC]">
                        {plan.price}
                      </span>
                    </div>

                    <p className="text-xs text-[#2B2B38] dark:text-[#D5D7E6] font-medium leading-relaxed">
                      {plan.desc}
                    </p>

                    <div className="space-y-2.5 pt-3 border-t border-[#14141A]/10 dark:border-white/10">
                      {(plan.features || []).map((feat) => (
                        <div key={feat} className="flex items-start gap-2.5 text-xs text-[#14141A] dark:text-[#F5F6FC] font-semibold">
                          <Check className="h-4 w-4 text-[#374BFF] dark:text-[#CFFF04] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#14141A]/10 dark:border-white/10">
                    <Link
                      href="#contact"
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#374BFF] py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#374BFF]/20 hover:bg-[#14141A] dark:hover:bg-[#CFFF04] dark:hover:text-[#14141A] transition-all"
                    >
                      <span>Get {plan.name}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {activeCategory === "ecommerce" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ecomPlans.map((plan, idx) => (
              <Reveal key={plan.id} direction="up" delay={idx * 0.08}>
                <div
                  className={cn(
                    "glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between h-full relative group",
                    plan.isPopular && "border-2 border-[#374BFF] shadow-xl shadow-[#374BFF]/15"
                  )}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-xl font-bold text-[#14141A] dark:text-[#F5F6FC]">
                        {plan.name}
                      </h3>
                      {plan.badge && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#CFFF04] text-[#14141A] shadow-sm">
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="font-heading text-3xl sm:text-4xl font-black text-[#374BFF] dark:text-[#F5F6FC]">
                        {plan.price}
                      </span>
                    </div>

                    <p className="text-xs text-[#2B2B38] dark:text-[#D5D7E6] font-medium leading-relaxed">
                      {plan.desc}
                    </p>

                    <div className="space-y-2.5 pt-3 border-t border-[#14141A]/10 dark:border-white/10">
                      {(plan.features || []).map((feat) => (
                        <div key={feat} className="flex items-start gap-2.5 text-xs text-[#14141A] dark:text-[#F5F6FC] font-semibold">
                          <Check className="h-4 w-4 text-[#374BFF] dark:text-[#CFFF04] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#14141A]/10 dark:border-white/10">
                    <Link
                      href="#contact"
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#374BFF] py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#374BFF]/20 hover:bg-[#14141A] dark:hover:bg-[#CFFF04] dark:hover:text-[#14141A] transition-all"
                    >
                      <span>Build Online Store</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {activeCategory === "combos" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comboPackages.map((combo, idx) => (
              <Reveal key={combo.title} direction="up" delay={idx * 0.06}>
                <div className="glass-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between h-full relative group hover:border-[#374BFF]">
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#374BFF]/15 text-[#374BFF] dark:text-[#CFFF04]">
                        Combo Value
                      </span>
                      <span className="text-xs text-[#14141A]/60 dark:text-[#F5F6FC]/50 line-through">
                        {combo.originalPrice}
                      </span>
                    </div>

                    <h3 className="font-heading text-lg font-bold text-[#14141A] dark:text-[#F5F6FC]">
                      {combo.title}
                    </h3>

                    <div>
                      <span className="font-heading text-3xl font-black text-[#374BFF] dark:text-[#CFFF04]">
                        {combo.comboPrice}
                      </span>
                    </div>

                    <p className="text-xs text-[#2B2B38] dark:text-[#D5D7E6] font-medium leading-relaxed">
                      {combo.desc}
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-[#14141A]/10 dark:border-white/10">
                    <Link
                      href="#contact"
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#374BFF] py-2.5 text-xs font-bold text-white hover:bg-[#14141A] dark:hover:bg-[#CFFF04] dark:hover:text-[#14141A] transition-all"
                    >
                      <span>Inquire Combo</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {activeCategory === "apps" && (
          <div className="glass-card rounded-3xl p-6 sm:p-8">
            <div className="mb-6">
              <h3 className="font-heading text-xl font-bold text-[#14141A] dark:text-[#F5F6FC]">
                Web Applications & Custom Engineering Rates
              </h3>
              <p className="text-xs text-[#2B2B38] dark:text-[#D5D7E6] mt-1 font-medium">
                Modular software components, APIs, database architectures, and custom workflows.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {webAppServices.map((srv) => (
                <div
                  key={srv.name}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-[#14141A]/14 dark:border-white/10 bg-[#F5F6FC] dark:bg-[#14141A]"
                >
                  <span className="text-xs font-bold text-[#14141A] dark:text-[#F5F6FC]">
                    {srv.name}
                  </span>
                  <span className="font-heading text-sm font-black text-[#374BFF] dark:text-[#CFFF04] ml-2 shrink-0">
                    {srv.price}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-[#14141A]/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-[#2B2B38] dark:text-[#D5D7E6] font-semibold">
                Need a full custom enterprise platform? We provide detailed architectural scopes.
              </span>
              <Link
                href="#contact"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#374BFF] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#14141A] dark:hover:bg-[#CFFF04] dark:hover:text-[#14141A] transition-all"
              >
                <span>Request Custom Quote</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}

        {activeCategory === "design-seo" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="font-heading text-xl font-bold text-[#14141A] dark:text-[#F5F6FC]">
                    Design & Branding
                  </h3>
                  <p className="text-xs text-[#2B2B38] dark:text-[#D5D7E6] mt-1 font-medium">
                    Visual identity assets, logos, and responsive Figma prototypes.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {designServices.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-3 rounded-xl border border-[#14141A]/14 dark:border-white/10 bg-[#F5F6FC] dark:bg-[#14141A] text-xs"
                    >
                      <span className="font-bold text-[#14141A] dark:text-[#F5F6FC]">{item.name}</span>
                      <span className="font-heading font-black text-[#374BFF] dark:text-[#CFFF04]">{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-[#14141A]/10 dark:border-white/10">
                <Link
                  href="#contact"
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#374BFF] py-2.5 text-xs font-bold text-white hover:bg-[#14141A] dark:hover:bg-[#CFFF04] dark:hover:text-[#14141A] transition-all"
                >
                  <span>Order Design Work</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="font-heading text-xl font-bold text-[#14141A] dark:text-[#F5F6FC]">
                    SEO & Digital Setup
                  </h3>
                  <p className="text-xs text-[#2B2B38] dark:text-[#D5D7E6] mt-1 font-medium">
                    Search engine indexing, Google Business verification, and Core Web Vitals speed tuning.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {seoServices.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-3 rounded-xl border border-[#14141A]/14 dark:border-white/10 bg-[#F5F6FC] dark:bg-[#14141A] text-xs"
                    >
                      <span className="font-bold text-[#14141A] dark:text-[#F5F6FC]">{item.name}</span>
                      <span className="font-heading font-black text-[#374BFF] dark:text-[#CFFF04]">{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-[#14141A]/10 dark:border-white/10">
                <Link
                  href="#contact"
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#374BFF] py-2.5 text-xs font-bold text-white hover:bg-[#14141A] dark:hover:bg-[#CFFF04] dark:hover:text-[#14141A] transition-all"
                >
                  <span>Optimize Website SEO</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeCategory === "maintenance" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {maintenancePlans.map((plan, idx) => (
              <Reveal key={plan.name} direction="up" delay={idx * 0.08}>
                <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between h-full relative group">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-xl font-bold text-[#14141A] dark:text-[#F5F6FC]">
                        {plan.name}
                      </h3>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#374BFF]/15 text-[#374BFF] dark:text-[#CFFF04]">
                        Monthly Care
                      </span>
                    </div>

                    <div>
                      <span className="font-heading text-3xl sm:text-4xl font-black text-[#374BFF] dark:text-[#F5F6FC]">
                        {plan.price}
                      </span>
                      <span className="text-xs text-[#14141A]/60 dark:text-[#F5F6FC]/60 ml-1">/ month</span>
                    </div>

                    <p className="text-xs text-[#2B2B38] dark:text-[#D5D7E6] font-medium leading-relaxed">
                      {plan.desc}
                    </p>

                    <div className="space-y-2.5 pt-3 border-t border-[#14141A]/10 dark:border-white/10">
                      {(plan.features || []).map((feat) => (
                        <div key={feat} className="flex items-start gap-2.5 text-xs text-[#14141A] dark:text-[#F5F6FC] font-semibold">
                          <Check className="h-4 w-4 text-[#374BFF] dark:text-[#CFFF04] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#14141A]/10 dark:border-white/10">
                    <Link
                      href="#contact"
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#374BFF] py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#374BFF]/20 hover:bg-[#14141A] dark:hover:bg-[#CFFF04] dark:hover:text-[#14141A] transition-all"
                    >
                      <span>Subscribe Plan</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        <Reveal direction="up" delay={0.1}>
          <div className="mt-16 sm:mt-20 glass-card rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#14141A]/10 dark:border-white/10">
              <div>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-[#14141A] dark:text-[#F5F6FC] flex items-center gap-2">
                  <Layers className="h-5 w-5 text-[#374BFF] dark:text-[#CFFF04]" />
                  <span>Modular Engineering Add-Ons</span>
                </h3>
                <p className="text-xs text-[#2B2B38] dark:text-[#D5D7E6] mt-1 font-medium">
                  Plug-and-play extensions to add power and capability to any web build.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#374BFF]/10 text-[#374BFF] dark:text-[#CFFF04] self-start sm:self-auto">
                Flat INR Add-On Rates
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {addOns.map((addon) => (
                <div
                  key={addon.name}
                  className="p-4 rounded-2xl border border-[#14141A]/12 dark:border-white/10 bg-white dark:bg-[#14141A] flex items-center justify-between gap-3 shadow-sm"
                >
                  <span className="text-xs font-bold text-[#14141A] dark:text-[#F5F6FC]">
                    {addon.name}
                  </span>
                  <span className="font-heading text-xs font-black text-[#374BFF] dark:text-[#CFFF04] shrink-0">
                    {addon.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal direction="up" delay={0.15}>
          <div className="mt-12 text-center">
            <button
              onClick={() => setShowTerms(!showTerms)}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#14141A]/70 dark:text-[#F5F6FC]/70 hover:text-[#374BFF] transition-colors cursor-pointer py-2 px-4 rounded-xl hover:bg-[#374BFF]/10"
            >
              <HelpCircle className="h-4 w-4" />
              <span>{showTerms ? "Hide Payment & Delivery Terms" : "View Payment & Delivery Terms"}</span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", showTerms && "rotate-180")} />
            </button>

            {showTerms && (
              <div className="mt-6 glass-card rounded-3xl p-6 sm:p-8 text-left max-w-4xl mx-auto space-y-4 animate-in fade-in duration-300">
                <h4 className="font-heading text-base font-bold text-[#14141A] dark:text-[#F5F6FC] flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#374BFF]" />
                  <span>Transparent TrioCore Terms & Conditions</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#2B2B38] dark:text-[#D5D7E6] font-medium leading-relaxed">
                  {pricingTerms.map((term, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/50 dark:bg-[#14141A]/50 border border-[#14141A]/8 dark:border-white/5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#374BFF]/15 text-[#374BFF] dark:text-[#CFFF04] text-[10px] font-bold">
                        {i + 1}
                      </span>
                      <span>{term}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
