"use client";

import { useState } from "react";
import Link from "next/link";
import { 
 Check, 
 Sparkles, 
 ArrowRight, 
 Flame, 
 HelpCircle, 
 ChevronDown, 
 ChevronUp,
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
 pricingTerms
} from "@/lib/data/site-content";
import { cn } from "@/lib/utils";
import { formatPaise } from "@/lib/money";
import type { LaunchOfferConfig, PricingCategoryItem } from "@/lib/dal/content";
import { CategoryPill } from "@/components/ui/category-pill";
import { WaitlistModal } from "@/components/shared/waitlist-modal";
import { Clock } from "lucide-react";

export interface PlanItem {
  id: string;
  name: string;
  price: string;
  priceType?: string | null;
  originalPrice?: string | null;
  savings?: string | null;
  period?: string | null;
  badge?: string | null;
  isPopular?: boolean;
  isBestValue?: boolean;
  desc?: string;
  features?: string[];
  category?: string;
  order?: number;
}

export interface PricingSectionProps {
  initialPlans?: PlanItem[];
  initialCategories?: PricingCategoryItem[];
  initialLaunchOffer?: LaunchOfferConfig;
}

function formatDisplayPrice(price?: string | null): string {
  if (!price) return "";
  const trimmed = price.trim();
  if (trimmed.startsWith("₹") || trimmed.startsWith("$")) return trimmed;
  if (/^[a-zA-Z\s]+$/.test(trimmed)) return trimmed;
  const cleanNum = trimmed.replace(/[^\d.]/g, "");
  const num = Number(cleanNum);
  if (!isNaN(num) && cleanNum.length > 0) {
    const hasPlus = trimmed.includes("+");
    return `₹${num.toLocaleString("en-IN")}${hasPlus ? "+" : ""}`;
  }
  return `₹${trimmed}`;
}

interface PricingPlanCardProps {
  plan: PlanItem;
  delay?: number;
  expanded: boolean;
  onToggleExpand: () => void;
  ctaText?: string;
  onOpenWaitlist?: (serviceName: string) => void;
}

function PricingPlanCard({
  plan,
  delay = 0,
  expanded,
  onToggleExpand,
  ctaText,
  onOpenWaitlist,
}: PricingPlanCardProps) {
  const features = plan.features || [];
  const isComingSoon =
    Boolean(plan.badge?.toLowerCase().includes("coming soon")) ||
    Boolean(plan.price?.toLowerCase().includes("coming"));
  const hasMore = features.length > 3;
  const visibleFeatures = expanded || !hasMore ? features : features.slice(0, 3);

  const formattedPrice = formatDisplayPrice(plan.price);
  const formattedOriginalPrice = plan.originalPrice ? formatDisplayPrice(plan.originalPrice) : null;
  const formattedPeriod = plan.period
    ? (plan.period.startsWith("/") ? plan.period : `/${plan.period}`)
    : null;

  return (
    <Reveal direction="up" delay={delay}>
      <div
        className={cn(
          "glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between h-full relative group transition-all duration-300",
          plan.isPopular && "border-2 border-[#374BFF] shadow-xl shadow-[#374BFF]/20",
          plan.isBestValue && "border-2 border-[#CFFF04] shadow-xl shadow-[#CFFF04]/20"
        )}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="font-heading text-xl font-bold text-[#14141A]">
              {plan.name}
            </h3>
            {plan.badge && (
              <span
                className={cn(
                  "text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1",
                  isComingSoon
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : "bg-[#CFFF04] text-[#14141A]"
                )}
              >
                {isComingSoon && <Clock className="h-3 w-3 text-amber-600" />}
                <span>{plan.badge}</span>
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-heading text-3xl sm:text-4xl font-black text-[#374BFF]">
              {plan.price.toLowerCase().includes("coming") ? "Coming Soon" : formattedPrice}
            </span>
            {formattedOriginalPrice && (
              <span className="text-xs sm:text-sm text-[#2B2B38] line-through font-medium">
                {formattedOriginalPrice}
              </span>
            )}
            {formattedPeriod && (
              <span className="text-xs font-bold text-[#2B2B38] uppercase tracking-wider">
                {formattedPeriod}
              </span>
            )}
            {plan.savings && (
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-sans">
                {plan.savings}
              </span>
            )}
          </div>

          {plan.desc && (
            <p className="text-xs text-[#2B2B38] font-medium leading-relaxed">
              {plan.desc}
            </p>
          )}

          {features.length > 0 && (
            <div className="space-y-2.5 pt-3 border-t border-[#14141A]/10">
              {visibleFeatures.map((feat: string, fIdx: number) => (
                <div key={fIdx} className="flex items-start gap-2.5 text-xs text-[#14141A] font-semibold">
                  <Check className="h-4 w-4 text-[#374BFF] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}

              {hasMore && (
                <button
                  type="button"
                  onClick={onToggleExpand}
                  className="text-xs font-bold text-[#374BFF] hover:underline cursor-pointer pt-1 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#374BFF] rounded"
                  aria-expanded={expanded}
                >
                  {expanded ? (
                    <>
                      <span>Show less features</span>
                      <ChevronUp className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      <span>+{features.length - 3} more features</span>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="pt-6 mt-6 border-t border-[#14141A]/10">
          {isComingSoon ? (
            <button
              type="button"
              onClick={() => onOpenWaitlist?.(plan.name)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#14141A] py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#374BFF] transition-all cursor-pointer"
            >
              <Clock className="h-4 w-4 text-amber-400" />
              <span>Join Priority Waitlist</span>
            </button>
          ) : (
            <Link
              href="#contact"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#374BFF] py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#374BFF]/20 hover:bg-[#14141A] transition-all"
            >
              <span>{ctaText || `Choose ${plan.name}`}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </Reveal>
  );
}

export function PricingSection({ initialPlans, initialCategories, initialLaunchOffer }: PricingSectionProps) {
  const defaultCategories: PricingCategoryItem[] = [
    { id: "websites", slug: "websites", label: "Web Development", order: 0, isPublished: true },
    { id: "local", slug: "local", label: "Local Business", order: 1, isPublished: true },
    { id: "ecommerce", slug: "ecommerce", label: "E-Commerce", order: 2, isPublished: true },
    { id: "combos", slug: "combos", label: "Combo Packages", order: 3, isPublished: true },
    { id: "apps", slug: "apps", label: "Web Apps & SaaS", order: 4, isPublished: true },
    { id: "design-seo", slug: "design-seo", label: "Design & SEO", order: 5, isPublished: true },
    { id: "maintenance", slug: "maintenance", label: "Maintenance", order: 6, isPublished: true },
  ];

  const categories = (initialCategories && initialCategories.length > 0)
    ? initialCategories.filter((c) => c.slug !== "addons")
    : defaultCategories;

  const [activeCategory, setActiveCategory] = useState<string>("websites");
  const [showTerms, setShowTerms] = useState(false);
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());
  const [waitlistService, setWaitlistService] = useState<string | null>(null);

  const togglePlan = (id: string) => {
    setExpandedPlans((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const list = (initialPlans && initialPlans.length > 0) ? initialPlans : [];
  const webFromProp = list.filter((p: PlanItem) => p.category === "websites");
  const locFromProp = list.filter((p: PlanItem) => p.category === "local");
  const ecomFromProp = list.filter((p: PlanItem) => p.category === "ecommerce");
  const comboFromProp = list.filter((p: PlanItem) => p.category === "combos");
  const appsFromProp = list.filter((p: PlanItem) => p.category === "apps");
  const designSeoFromProp = list.filter((p: PlanItem) => p.category === "design-seo" || p.category === "design" || p.category === "seo");
  const mainFromProp = list.filter((p: PlanItem) => p.category === "maintenance");
  const addonsFromProp = list.filter((p: PlanItem) => p.category === "addons");

  const websitePlans = webFromProp.length > 0 ? webFromProp : staticWebsitePlans;
  const localPlans = locFromProp.length > 0 ? locFromProp : staticLocalPlans;
  const ecomPlans = ecomFromProp.length > 0 ? ecomFromProp : staticEcommercePlans;
  const comboList: PlanItem[] = comboFromProp.length > 0
    ? comboFromProp
    : comboPackages.map((combo, idx) => ({
        id: `combo-${idx}`,
        name: combo.title,
        price: combo.comboPrice,
        originalPrice: combo.originalPrice,
        desc: combo.desc,
        badge: "Combo Value",
        category: "combos",
      }));
  const maintenanceList = mainFromProp.length > 0 ? mainFromProp : maintenancePlans;

  const appsList = appsFromProp.length > 0
    ? appsFromProp
    : webAppServices.map((srv, idx) => ({
        id: `app-${idx}`,
        name: srv.name,
        price: srv.price,
        category: "apps",
        priceType: "flat",
      }));

  const designList = designSeoFromProp.filter((p) => p.category === "design" || p.badge === "Design").length > 0
    ? designSeoFromProp.filter((p) => p.category === "design" || p.badge === "Design")
    : designServices.map((srv, idx) => ({
        id: `design-${idx}`,
        name: srv.name,
        price: srv.price,
        category: "design-seo",
        badge: "Design",
        priceType: "flat",
      }));

  const seoList = designSeoFromProp.filter((p) => p.category === "seo" || p.badge === "SEO").length > 0
    ? designSeoFromProp.filter((p) => p.category === "seo" || p.badge === "SEO")
    : seoServices.map((srv, idx) => ({
        id: `seo-${idx}`,
        name: srv.name,
        price: srv.price,
        category: "design-seo",
        badge: "SEO",
        priceType: "flat",
      }));

  const addonsList = addonsFromProp.length > 0
    ? addonsFromProp
    : addOns.map((addon, idx) => ({
        id: `addon-${idx}`,
        name: addon.name,
        price: addon.price,
        category: "addons",
        priceType: "flat",
      }));

 return (
 <section id="pricing" className="relative py-24 sm:py-32 px-5 sm:px-6 lg:px-8">
 <div className="mx-auto max-w-7xl">
 <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <Reveal direction="down">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#374BFF] text-xs font-bold uppercase tracking-widest text-white font-heading mb-3 shadow-sm shadow-[#374BFF]/20">
            <Tag className="h-3.5 w-3.5 text-white" /> Pricing
          </span>
        </Reveal>

 <Reveal direction="up" delay={0.08}>
 <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-[#14141A]">
 Affordable Engineering. <br />
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#374BFF] via-[#374BFF] to-[#CFFF04]">
 Built for Indian Businesses.
 </span>
 </h2>
 </Reveal>

 <Reveal direction="up" delay={0.16}>
 <p className="mt-4 text-sm sm:text-base md:text-lg text-[#2B2B38]  font-sans font-medium">
 Transparent, student-friendly rates with zero agency markups. From rapid ₹999 launch pages to scalable Next.js enterprise web applications.
 </p>
 </Reveal>
 </div>

 {initialLaunchOffer?.isActive !== false && (
 <Reveal direction="up" delay={0.2}>
 <div id="launch-offer-banner" className="mb-12 sm:mb-16 rounded-3xl border-2 border-[#CFFF04] bg-gradient-to-br from-[#374BFF] via-[#FFFFFF] to-[#CFFF04] p-6 sm:p-8 shadow-xl relative overflow-hidden">
 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
 <div className="space-y-2">
 <div className="flex items-center gap-2">
 <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#CFFF04] text-[#14141A]">
 <Flame className="h-4 w-4" />
 </span>
 <span className="text-xs font-black uppercase tracking-wider text-[#14141A] font-heading">
 {initialLaunchOffer?.tag || "Launch Offer — First 10 Clients Only 🎉"}
 </span>
 </div>
 <h3 className="font-heading text-xl sm:text-2xl font-black text-[#14141A]">
 {initialLaunchOffer?.headline || "Lock In Special Early-Bird Discounts"}
 </h3>
 <p className="text-xs sm:text-sm text-[#2B2B38] font-medium max-w-xl">
 {initialLaunchOffer?.subtext || "Kickstart your digital presence at direct student-developer rates. Limited to the first 10 projects onboarded this season."}
 </p>
 </div>

 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
 {(initialLaunchOffer?.items && initialLaunchOffer.items.length > 0
   ? initialLaunchOffer.items.map((item) => ({
       title: item.label,
       originalPrice: formatPaise(item.original_price_paise),
       launchPrice: formatPaise(item.offer_price_paise),
       savings: item.savings_label,
     }))
   : launchOffers
 ).map((offer, idx) => (
 <div
 key={offer.title + idx}
 className="rounded-2xl border border-[#14141A] bg-white p-3 sm:p-3.5 text-center shadow-sm"
 >
 <p className="text-[11px] font-bold text-[#14141A] truncate">
 {offer.title}
 </p>
 <div className="mt-1 flex items-center justify-center gap-1.5">
 <span className="text-[11px] text-[#14141A] line-through">
 {offer.originalPrice}
 </span>
 <span className="font-heading text-sm font-black text-[#374BFF]">
 {offer.launchPrice}
 </span>
 </div>
 {offer.savings && (
 <span className="mt-1 inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
 {offer.savings}
 </span>
 )}
 </div>
 ))}
 </div>
 </div>
 </div>
 </Reveal>
 )}

 <Reveal direction="down">
 <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
					{categories.map((tab) => (
						<CategoryPill
							key={tab.slug}
							active={activeCategory === tab.slug}
							onClick={() => setActiveCategory(tab.slug)}
							badge={
								tab.isComingSoon ? (
									<span className="ml-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
										Soon
									</span>
								) : undefined
							}
						>
							{tab.label}
						</CategoryPill>
					))}
 </div>
 </Reveal>

        <div className="min-h-[500px]">
        {activeCategory === "websites" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {websitePlans.map((plan, idx) => {
              const planId = plan.id || plan.name;
              return (
                <PricingPlanCard
                  key={planId}
                  plan={plan}
                  delay={idx * 0.06}
                  expanded={expandedPlans.has(planId)}
                  onToggleExpand={() => togglePlan(planId)}
                  ctaText={`Choose ${plan.name}`}
                />
              );
            })}
          </div>
        )}

        {activeCategory === "local" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {localPlans.map((plan, idx) => {
              const planId = plan.id || plan.name;
              return (
                <PricingPlanCard
                  key={planId}
                  plan={plan}
                  delay={idx * 0.08}
                  expanded={expandedPlans.has(planId)}
                  onToggleExpand={() => togglePlan(planId)}
                  ctaText={`Get ${plan.name}`}
                />
              );
            })}
          </div>
        )}

        {activeCategory === "ecommerce" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ecomPlans.map((plan, idx) => {
              const planId = plan.id || plan.name;
              return (
                <PricingPlanCard
                  key={planId}
                  plan={plan}
                  delay={idx * 0.08}
                  expanded={expandedPlans.has(planId)}
                  onToggleExpand={() => togglePlan(planId)}
                  ctaText="Build Online Store"
                />
              );
            })}
          </div>
        )}

        {activeCategory === "combos" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comboList.map((plan, idx) => {
              const planId = plan.id || plan.name;
              return (
                <PricingPlanCard
                  key={planId}
                  plan={plan}
                  delay={idx * 0.06}
                  expanded={expandedPlans.has(planId)}
                  onToggleExpand={() => togglePlan(planId)}
                  ctaText="Inquire Combo"
                />
              );
            })}
          </div>
        )}

        {activeCategory === "apps" && (
          <div className="space-y-8">
            <div className="glass-card rounded-3xl p-6 sm:p-8">
              <div className="mb-6">
                <h3 className="font-heading text-xl font-bold text-[#14141A]">
                  Web Applications & Custom Engineering Rates
                </h3>
                <p className="text-xs text-[#2B2B38] mt-1 font-medium">
                  Modular software components, APIs, database architectures, and custom workflows.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {appsList.map((srv) => {
                  const displayPrice = srv.priceType === "starting_from" && !srv.price.includes("+")
                    ? `${srv.price}+`
                    : srv.price;
                  return (
                    <div
                      key={srv.id || srv.name}
                      className="flex items-center justify-between p-3.5 rounded-2xl border border-[#14141A]/10 bg-[#F5F6FC]"
                    >
                      <span className="text-xs font-bold text-[#14141A]">
                        {srv.name}
                      </span>
                      <span className="font-heading text-sm font-black text-[#374BFF] ml-2 shrink-0">
                        {displayPrice}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-[#14141A]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-[#2B2B38] font-semibold">
                  Need a full custom enterprise platform? We provide detailed architectural scopes.
                </span>
                <Link
                  href="#contact"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#374BFF] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#14141A] transition-all"
                >
                  <span>Request Custom Quote</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeCategory === "design-seo" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-[#14141A]">
                      Design & Branding
                    </h3>
                    <p className="text-xs text-[#2B2B38] mt-1 font-medium">
                      Visual identity assets, logos, and responsive Figma prototypes.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {designList.map((item) => {
                      const displayPrice = item.priceType === "starting_from" && !item.price.includes("+")
                        ? `${item.price}+`
                        : item.price;
                      return (
                        <div
                          key={item.id || item.name}
                          className="flex items-center justify-between p-3 rounded-xl border border-[#14141A]/10 bg-[#F5F6FC] text-xs"
                        >
                          <span className="font-bold text-[#14141A]">{item.name}</span>
                          <span className="font-heading font-black text-[#374BFF]">{displayPrice}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-[#14141A]/10">
                  <Link
                    href="#contact"
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#374BFF] py-2.5 text-xs font-bold text-white hover:bg-[#14141A] transition-all"
                  >
                    <span>Order Design Work</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-[#14141A]">
                      SEO & Digital Setup
                    </h3>
                    <p className="text-xs text-[#2B2B38] mt-1 font-medium">
                      Search engine indexing, Google Business verification, and Core Web Vitals speed tuning.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {seoList.map((item) => {
                      const displayPrice = item.priceType === "starting_from" && !item.price.includes("+")
                        ? `${item.price}+`
                        : item.price;
                      return (
                        <div
                          key={item.id || item.name}
                          className="flex items-center justify-between p-3 rounded-xl border border-[#14141A]/10 bg-[#F5F6FC] text-xs"
                        >
                          <span className="font-bold text-[#14141A]">{item.name}</span>
                          <span className="font-heading font-black text-[#374BFF]">{displayPrice}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-[#14141A]/10">
                  <Link
                    href="#contact"
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#374BFF] py-2.5 text-xs font-bold text-white hover:bg-[#14141A] transition-all"
                  >
                    <span>Optimize Website SEO</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeCategory === "maintenance" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {maintenanceList.map((plan, idx) => {
              const planId = plan.id || plan.name;
              return (
                <PricingPlanCard
                  key={planId}
                  plan={{
                    ...plan,
                    period: plan.period || "/month",
                  }}
                  delay={idx * 0.08}
                  expanded={expandedPlans.has(planId)}
                  onToggleExpand={() => togglePlan(planId)}
                  ctaText="Subscribe Plan"
                />
              );
            })}
          </div>
        )}

        {!["websites", "local", "ecommerce", "combos", "apps", "design-seo", "maintenance"].includes(activeCategory) && (
          <div>
            {list.filter((p) => p.category === activeCategory).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {list
                  .filter((p) => p.category === activeCategory)
                  .map((plan, idx) => {
                    const planId = plan.id || plan.name;
                    return (
                      <PricingPlanCard
                        key={planId}
                        plan={plan}
                        delay={idx * 0.06}
                        expanded={expandedPlans.has(planId)}
                        onToggleExpand={() => togglePlan(planId)}
                        ctaText="Inquire Plan"
                        onOpenWaitlist={(name) => setWaitlistService(name)}
                      />
                    );
                  })}
              </div>
            ) : (
              <div className="max-w-2xl mx-auto glass-card rounded-3xl p-8 sm:p-10 text-center space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  <span>Under Active Development</span>
                </div>
                <h3 className="font-heading text-2xl sm:text-3xl font-black text-[#14141A]">
                  {categories.find((c) => c.slug === activeCategory)?.label || "Upcoming Capability"}
                </h3>
                <p className="text-xs sm:text-sm text-[#2B2B38] font-medium max-w-lg mx-auto leading-relaxed">
                  We are actively engineering tailored solutions for this category. Reserve your spot on our priority waitlist to get early-bird access and launch discounts.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setWaitlistService(
                        categories.find((c) => c.slug === activeCategory)?.label || "Upcoming Service"
                      )
                    }
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#374BFF] text-white text-xs sm:text-sm font-bold hover:bg-[#2A3DE0] shadow-md transition-all cursor-pointer"
                  >
                    <span>Join Priority Waitlist</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

 <Reveal direction="up" delay={0.1}>
 <div className="mt-16 sm:mt-20 glass-card rounded-3xl p-6 sm:p-8">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#14141A] ">
 <div>
 <h3 className="font-heading text-lg sm:text-xl font-bold text-[#14141A] flex items-center gap-2">
 <Layers className="h-5 w-5 text-[#374BFF]" />
 <span>Modular Engineering Add-Ons</span>
 </h3>
 <p className="text-xs text-[#2B2B38] mt-1 font-medium">
 Plug-and-play extensions to add power and capability to any web build.
 </p>
 </div>
 <span className="text-xs font-bold px-3 py-1 rounded-full border border-[#374BFF]/20 bg-[#374BFF]/10 text-[#374BFF] self-start sm:self-auto">
 Flat INR Add-On Rates
 </span>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
 {addonsList.map((addon) => {
   const displayPrice = addon.priceType === "starting_from" && !addon.price.includes("+")
     ? `${addon.price}+`
     : addon.price;
   return (
     <div
       key={addon.id || addon.name}
       className="p-4 rounded-2xl border border-[#14141A]/10 bg-white flex items-center justify-between gap-3 shadow-xs"
     >
       <span className="text-xs font-bold text-[#14141A]">
         {addon.name}
       </span>
       <span className="text-xs font-bold text-[#374BFF] bg-[#374BFF]/10 px-2 py-0.5 rounded-md">
         {displayPrice}
       </span>
     </div>
   );
 })}
 </div>
 </div>
 </Reveal>

 <Reveal direction="up" delay={0.15}>
 <div className="mt-12 text-center">
 <button
 onClick={() => setShowTerms(!showTerms)}
 className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#2B2B38] hover:text-[#374BFF] transition-colors cursor-pointer"
 >
 <span>View All Commercial Terms & Service Guarantees</span>
 <ChevronDown className={cn("h-4 w-4 transition-transform", showTerms && "rotate-180")} />
 </button>

 {showTerms && (
 <div className="mt-6 glass-card rounded-3xl p-6 sm:p-8 text-left max-w-4xl mx-auto space-y-4 animate-in fade-in duration-300">
 <h4 className="font-heading text-base font-bold text-[#14141A] flex items-center gap-2">
 <ShieldCheck className="h-4 w-4 text-[#374BFF]" />
 <span>Transparent TrioCore Terms & Conditions</span>
 </h4>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#2B2B38] font-medium leading-relaxed">
 {pricingTerms.map((term, i) => (
 <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/50 border border-[#14141A]/10">
 <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#374BFF] text-white text-[10px] font-bold">
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
 <WaitlistModal
        serviceName={waitlistService}
        isOpen={Boolean(waitlistService)}
        onClose={() => setWaitlistService(null)}
      />
    </section>
 );
}
