"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, ShieldCheck, Search } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { faqItems } from "@/lib/data/site-content";
import { cn } from "@/lib/utils";

export function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(faqItems[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "About TrioCore", "Process", "Pricing", "Technical", "Trust", "Support", "Legal"];

  const filteredFaqs = faqItems.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
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
            <span className="text-xs font-bold uppercase tracking-widest text-[#374BFF] dark:text-[#CFFF04] font-heading">
              Frequently Asked Questions
            </span>
          </Reveal>

          <Reveal direction="up" delay={0.08}>
            <h2 className="mt-3 font-heading text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-[#14141A] dark:text-[#F5F6FC]">
              Simple answers. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#374BFF] via-[#374BFF] to-[#CFFF04]">
                No confusing terms. No hidden surprises.
              </span>
            </h2>
          </Reveal>

          <Reveal direction="up" delay={0.16}>
            <p className="mt-4 text-sm sm:text-base md:text-lg text-[#2B2B38] dark:text-[#F5F6FC]/85 font-sans font-medium">
              Everything you need to know about working with TrioCore, project costs, turnarounds, source code ownership, and ongoing support.
            </p>
          </Reveal>
        </div>

        <Reveal direction="up" delay={0.2}>
          <div className="space-y-4 mb-8">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-[#14141A]/60 dark:text-[#F5F6FC]/50" />
              <input
                type="text"
                placeholder="Search any question (pricing, revisions, code ownership...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-[#14141A]/15 dark:border-[#374BFF]/25 bg-white dark:bg-[#1C1C26] pl-11 pr-4 py-3 text-xs sm:text-sm text-[#14141A] dark:text-[#F5F6FC] placeholder-[#14141A]/50 dark:placeholder-[#F5F6FC]/40 focus:border-[#374BFF] focus:outline-none transition-all font-medium shadow-sm"
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
                      : "text-[#14141A] dark:text-[#F5F6FC]/70 hover:bg-[#14141A]/8 dark:hover:bg-white/10"
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
              <p className="text-sm font-semibold text-[#14141A] dark:text-[#F5F6FC]/70">
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
                      "glass-card rounded-2xl sm:rounded-3xl border transition-all duration-200 overflow-hidden",
                      isOpen
                        ? "border-[#374BFF] shadow-lg shadow-[#374BFF]/10 dark:shadow-[#374BFF]/20"
                        : "border-[#14141A]/14 dark:border-[#374BFF]/15 hover:border-[#374BFF]/50"
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
                              : "bg-[#374BFF]/15 text-[#374BFF] dark:text-[#CFFF04]"
                          )}
                        >
                          {item.category === "Legal" ? (
                            <ShieldCheck className="h-4 w-4" />
                          ) : (
                            <HelpCircle className="h-4 w-4" />
                          )}
                        </div>
                        <span className="font-heading text-sm sm:text-base font-bold text-[#14141A] dark:text-[#F5F6FC]">
                          {item.question}
                        </span>
                      </div>

                      <ChevronDown
                        className={cn(
                          "h-5 w-5 shrink-0 text-[#374BFF] dark:text-[#CFFF04] transition-transform duration-200",
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
                          <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-1 text-xs sm:text-sm text-[#2B2B38] dark:text-[#D5D7E6] font-sans leading-relaxed border-t border-[#14141A]/10 dark:border-white/10 font-medium">
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
