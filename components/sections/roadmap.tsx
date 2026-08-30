"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, Target, Rocket, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { roadmapData } from "@/lib/data/site-content";

export function RoadmapSection() {
  return (
    <section id="roadmap" className="relative py-24 sm:py-32 px-5 sm:px-6 lg:px-8 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <Reveal direction="down">
            <span className="text-xs font-bold uppercase tracking-widest text-[#374BFF] dark:text-[#CFFF04] font-heading">
              Strategic Vision
            </span>
          </Reveal>
          <Reveal direction="up" delay={0.08}>
            <h2 className="mt-3 font-heading text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-[#14141A] dark:text-[#F5F6FC] leading-tight">
              The Evolution of <br />
              <span className="text-[#374BFF]">
                TrioCore Digital
              </span>
            </h2>
          </Reveal>
          <Reveal direction="up" delay={0.16}>
            <p className="mt-4 text-sm sm:text-base md:text-lg text-[#14141A] dark:text-[#F5F6FC]/85 font-sans font-medium">
              A transparent, milestone-driven progression path from student startup foundation to an intelligent SaaS and robotics engineering collective.
            </p>
          </Reveal>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-12 left-4 right-4 h-2 -translate-y-1/2 rounded-full bg-[#14141A]/12 dark:bg-white/12 z-0 overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              whileInView={{ width: "52%" }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="h-full bg-[#374BFF] rounded-full"
            />
          </div>

          <div className="lg:hidden absolute top-6 bottom-20 left-1/2 -translate-x-1/2 w-2 rounded-full bg-[#14141A]/12 dark:bg-white/12 z-0 overflow-hidden">
            <motion.div
              initial={{ height: "0%" }}
              whileInView={{ height: "52%" }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="w-full bg-[#374BFF] rounded-full"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-8 relative z-10">
            {roadmapData.map((node, nodeIdx) => {
              const isActive = node.statusType === "active";

              return (
                <div key={node.year} className="flex flex-col items-center">
                  <Reveal direction="down" delay={nodeIdx * 0.12} className="relative z-20">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl bg-white dark:bg-[#1C1C26] ${node.nodeBorder} mb-6 sm:mb-8 cursor-pointer transition-all shadow-md`}
                    >
                      <span className={`font-heading text-xl sm:text-2xl tracking-tight ${isActive ? "font-black text-[#374BFF]" : "font-bold text-[#14141A] dark:text-[#F5F6FC]"}`}>
                        {node.year}
                      </span>
                      {isActive && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CFFF04] opacity-75" />
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-[#CFFF04]" />
                        </span>
                      )}
                    </motion.div>
                  </Reveal>

                  <Reveal direction="up" delay={nodeIdx * 0.12 + 0.08} className="w-full relative z-10">
                    <div className="glass-card rounded-3xl p-6 sm:p-7 w-full h-full flex flex-col justify-between group hover:border-[#374BFF] transition-all">
                      <div className="space-y-4 sm:space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-[#14141A]/10 dark:border-white/10">
                          <span className="text-xs font-mono font-bold tracking-wider text-[#374BFF] dark:text-[#CFFF04]">
                            {node.phase}
                          </span>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-sm ${node.badgeBg}`}>
                            {node.status}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-heading text-lg sm:text-xl font-bold tracking-tight text-[#14141A] dark:text-[#F5F6FC]">
                            {node.title}
                          </h3>
                        </div>

                        <div className="space-y-2.5 sm:space-y-3 pt-2">
                          {node.milestones.map((m, mIdx) => (
                            <motion.div
                              key={m.text}
                              initial={{ opacity: 0, x: -8 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.3, delay: nodeIdx * 0.12 + mIdx * 0.06 }}
                              className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm font-medium"
                            >
                              {m.status === "completed" ? (
                                <CheckCircle2 className="h-4 w-4 text-[#374BFF] dark:text-[#CFFF04] shrink-0 mt-0.5" />
                              ) : m.status === "in-progress" ? (
                                <Clock className="h-4 w-4 text-[#374BFF] shrink-0 mt-0.5 animate-pulse" />
                              ) : (
                                <Target className="h-4 w-4 text-[#374BFF] dark:text-[#374BFF] shrink-0 mt-0.5" />
                              )}
                              <span
                                className={
                                  m.status === "completed"
                                    ? "text-[#14141A] dark:text-[#F5F6FC] line-through decoration-[#374BFF]/50 opacity-80"
                                    : m.status === "in-progress"
                                    ? "text-[#374BFF] dark:text-[#CFFF04] font-bold"
                                    : "text-[#14141A] dark:text-[#F5F6FC]"
                                }
                              >
                                {m.text}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-5 sm:pt-6 mt-5 sm:mt-6 border-t border-[#14141A]/10 dark:border-white/10 flex items-center justify-between text-xs font-bold text-[#14141A] dark:text-[#F5F6FC]">
                        <span className="flex items-center gap-1.5 text-[#14141A] dark:text-[#F5F6FC]/70">
                          <Rocket className="h-3.5 w-3.5 text-[#374BFF]" /> Milestone 0{nodeIdx + 1}
                        </span>
                        <span className="text-[#374BFF] dark:text-[#CFFF04] inline-flex items-center gap-1">
                          <span>Track Output</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </Reveal>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
