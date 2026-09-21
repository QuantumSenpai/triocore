"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, ShieldCheck, Search } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export interface FAQSectionProps {
  initialFaqs?: { id: string; question: string; answer: string; category: string; categoryId?: string | null; order?: number }[];
  initialCategories?: { id: string; name: string; slug: string; order?: number }[];
}

const defaultEssentialFaqs = [
  {
    id: "faq-pricing",
    question: "Are your prices fixed or will they increase later?",
    answer: "Our package prices are completely fixed for the features outlined in your agreed project scope. If you decide to add brand-new pages or advanced functionality halfway through, we discuss the exact add-on price upfront before writing a single line of extra code. There are zero hidden fees.",
    category: "Pricing",
  },
  {
    id: "faq-timeline",
    question: "How long does a project typically take to deliver?",
    answer: "Starter and 1-page websites are delivered within 48 to 72 hours. Business websites (3–5 pages) take 4 to 7 days. Complex web applications and custom systems typically take 1 to 3 weeks depending on the feature list.",
    category: "Process",
  },
  {
    id: "faq-ownership",
    question: "Who owns the code after project completion?",
    answer: "Upon final project settlement, you receive 100% full source code ownership. We transfer all project repositories, database credentials, and production deployments directly to you with zero vendor lock-in or recurring license fees.",
    category: "Trust",
  },
  {
    id: "faq-revisions",
    question: "What if I want revisions or changes after seeing the first version?",
    answer: "Every project includes dedicated revision rounds. If you want to tweak colors, swap images, adjust copy, or refine section layouts, we make the changes promptly during the staging review stage until you are 100% satisfied.",
    category: "Process",
  },
  {
    id: "faq-hosting",
    question: "Do you provide hosting, domain setup, and ongoing technical support?",
    answer: "Yes. We handle hosting deployment configuration on top-tier global edge networks (Vercel/Cloudflare), guide you step-by-step through domain purchasing in your name, and provide post-launch support with optional care plans starting at ₹299/month.",
    category: "Support",
  },
];

export function FAQSection({ initialFaqs, initialCategories }: FAQSectionProps) {
  const faqs = (initialFaqs && initialFaqs.length > 0) ? initialFaqs : defaultEssentialFaqs;
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = initialCategories && initialCategories.length > 0
    ? ["All", ...initialCategories.map((c) => c.name)]
    : ["All", "Pricing", "Timeline", "Code Ownership", "Revisions", "Hosting & Support"];

  const filteredFaqs = faqs.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

 return (
 <section id="faq" className="relative py-24 sm:py-32 px-5 sm:px-6 lg:px-8">
 <div className="mx-auto max-w-5xl">
 <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
 <Reveal direction="down">
 <span className="text-xs font-bold uppercase tracking-widest text-[#374BFF] font-heading">
 Frequently Asked Questions
 </span>
 </Reveal>

 <Reveal direction="up" delay={0.08}>
 <h2 className="mt-3 font-heading text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-[#14141A]">
 Simple answers. <br />
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#374BFF] via-[#374BFF] to-[#CFFF04]">
 No confusing terms. No hidden surprises.
 </span>
 </h2>
 </Reveal>

 <Reveal direction="up" delay={0.16}>
 <p className="mt-4 text-sm sm:text-base md:text-lg text-[#2B2B38]  font-sans font-medium">
 Everything you need to know about working with TrioCore, project costs, turnarounds, source code ownership, and ongoing support.
 </p>
 </Reveal>
 </div>

 <Reveal direction="up" delay={0.2}>
 <div className="space-y-4 mb-8">
 <div className="relative max-w-md mx-auto">
 <Search className="absolute left-4 top-3.5 h-4 w-4 text-[#14141A] " />
 <input
 type="text"
 placeholder="Search any question (pricing, revisions, code ownership...)"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full rounded-2xl border border-[#14141A] bg-white pl-11 pr-4 py-3 text-xs sm:text-sm text-[#14141A] placeholder-[#14141A] focus:border-[#374BFF] focus:outline-none transition-all font-medium shadow-sm"
 />
 </div>

 <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
 {categories.map((cat) => (
 <button
 key={cat}
 onClick={() => setSelectedCategory(cat)}
 className={cn(
 "px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
 selectedCategory === cat
 ? "bg-[#374BFF] text-white shadow-sm"
 : "text-[#14141A]  hover:bg-[#14141A] "
 )}
 >
 {cat}
 </button>
 ))}
 </div>
 </div>
 </Reveal>

 <div className="space-y-3.5">
 {filteredFaqs.length === 0 ? (
 <div className="text-center py-12 glass-card rounded-2xl">
 <p className="text-sm font-semibold text-[#14141A] ">
 No matching questions found for &ldquo;{searchQuery}&rdquo;.
 </p>
 </div>
 ) : (
 filteredFaqs.map((item, index) => {
 const isOpen = openId === item.id;

 return (
 <Reveal key={item.id} direction="up" delay={Math.min(index * 0.03, 0.3)}>
 <div
 className={cn(
 "glass-card rounded-2xl sm:rounded-3xl border transition-all duration-300 overflow-hidden",
 isOpen
 ? "border-[#374BFF] shadow-sm"
 : "border-[#14141A]/10 hover:border-[#374BFF]/40 shadow-xs"
 )}
 >
 <button
 onClick={() => toggleFAQ(item.id)}
 aria-expanded={isOpen}
 className="w-full p-5 sm:p-6 flex items-center justify-between text-left gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#374BFF] rounded-2xl sm:rounded-3xl"
 >
 <div className="flex items-center gap-3.5">
 <div
 className={cn(
 "flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-200",
 isOpen
 ? "bg-[#374BFF] text-white"
 : "bg-[#374BFF]/10 text-[#374BFF]"
 )}
 >
 {item.category === "Legal" ? (
 <ShieldCheck className="h-4 w-4" />
 ) : (
 <HelpCircle className="h-4 w-4" />
 )}
 </div>
 <span className="font-heading text-sm sm:text-base font-bold text-[#14141A]">
 {item.question}
 </span>
 </div>

 <ChevronDown
 className={cn(
 "h-5 w-5 shrink-0 text-[#374BFF] transition-transform duration-200",
 isOpen ? "rotate-180" : "rotate-0"
 )}
 />
 </button>

 <AnimatePresence initial={false}>
 {isOpen && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: "auto", opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
 >
 <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-1 text-xs sm:text-sm text-[#2B2B38] font-sans leading-relaxed border-t border-[#14141A] font-medium">
 {item.answer}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </Reveal>
 );
 })
 )}
 </div>
 </div>
 </section>
 );
}
