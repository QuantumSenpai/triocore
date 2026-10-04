"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, Target, Rocket, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { roadmapData, RoadmapPhase } from "@/lib/data/site-content";

interface RoadmapSectionProps {
  initialData?: RoadmapPhase[];
}

export function RoadmapSection({ initialData }: RoadmapSectionProps) {
  const data = initialData && initialData.length > 0 ? initialData : roadmapData;

  return (
    <section id="roadmap" className="relative py-20 sm:py-28 lg:py-32 px-3.5 sm:px-6 lg:px-8 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 lg:mb-20">
          <Reveal direction="down">
            <span className="text-xs font-bold uppercase tracking-widest text-[#374BFF] font-heading">
              Strategic Vision
            </span>
          </Reveal>
          <Reveal direction="up" delay={0.08}>
            <h2 className="mt-3 font-heading text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-[#14141A] leading-tight">
              The Evolution of <br />
              <span className="text-[#374BFF]">
                TrioCore Digital
              </span>
            </h2>
          </Reveal>
          <Reveal direction="up" delay={0.16}>
            <p className="mt-4 text-sm sm:text-base md:text-lg text-[#14141A]/80 font-sans font-medium">
              A transparent, milestone-driven progression path from student startup foundation to an intelligent SaaS and robotics engineering collective.
            </p>
          </Reveal>
        </div>

        {/* Desktop Layout (>= 1024px) */}
        <div className="hidden lg:block relative">
          {/* Horizontal Track Line */}
          <div className="absolute top-12 left-12 right-12 h-1.5 rounded-full bg-[#14141A]/10 z-0 overflow-hidden">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 0.52 }}
              viewport={{ once: true }}
              style={{ transformOrigin: "left" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full w-full bg-[#374BFF] rounded-full"
            />
          </div>

          <div className="grid grid-cols-3 gap-8 relative z-10">
            {data.map((node, nodeIdx) => {
              const isActive = node.statusType === "active";
              const badgeBg = node.badgeBg || (isActive 
                ? "border-[#374BFF]/30 bg-[#374BFF]/10 text-[#374BFF]" 
                : "border-[#14141A]/20 bg-[#F5F6FC] text-[#14141A]");
              const nodeBorder = node.nodeBorder || (isActive 
                ? "border-[#374BFF] shadow-sm" 
                : "border-2 border-dashed border-[#14141A]/30 shadow-none");

              return (
                <div key={node.phase || nodeIdx} className="flex flex-col items-center">
                  <Reveal direction="down" delay={nodeIdx * 0.1} className="relative z-20">
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className={`relative flex h-24 w-24 items-center justify-center rounded-3xl bg-white ${nodeBorder} mb-8 transition-all shadow-md`}
                    >
                      <span className={`font-heading text-2xl tracking-tight ${isActive ? "font-black text-[#374BFF]" : "font-bold text-[#14141A]"}`}>
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

                  <Reveal direction="up" delay={nodeIdx * 0.1 + 0.08} className="w-full relative z-10 h-full">
                    <div className="glass-card rounded-3xl p-7 w-full h-full flex flex-col justify-between group hover:border-[#374BFF] transition-colors duration-200">
                      <div className="space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-[#14141A]/10">
                          <span className="text-xs font-mono font-bold tracking-wider text-[#374BFF]">
                            {node.phase}
                          </span>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-sm ${badgeBg}`}>
                            {node.status}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-heading text-xl font-bold tracking-tight text-[#14141A]">
                            {node.title}
                          </h3>
                        </div>

                        <div className="space-y-3 pt-2">
                          {node.milestones.map((m, mIdx) => (
                            <motion.div
                              key={`${m.text}-${mIdx}`}
                              initial={{ opacity: 0, x: -6 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.25, delay: nodeIdx * 0.1 + mIdx * 0.05, ease: "easeOut" }}
                              className="flex items-start gap-3 text-sm font-medium"
                            >
                              {m.status === "completed" ? (
                                <CheckCircle2 className="h-4 w-4 text-[#374BFF] shrink-0 mt-0.5" />
                              ) : m.status === "in-progress" ? (
                                <Clock className="h-4 w-4 text-[#374BFF] shrink-0 mt-0.5 animate-pulse" />
                              ) : (
                                <Target className="h-4 w-4 text-[#14141A]/40 shrink-0 mt-0.5" />
                              )}
                              <span
                                className={
                                  m.status === "completed"
                                    ? "text-[#14141A] line-through decoration-[#374BFF] opacity-80"
                                    : m.status === "in-progress"
                                    ? "text-[#374BFF] font-bold"
                                    : "text-[#14141A]/80"
                                }
                              >
                                {m.text}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 mt-6 border-t border-[#14141A]/10 flex items-center justify-between text-xs font-bold text-[#14141A]/70">
                        <span className="flex items-center gap-1.5 text-[#14141A]/80">
                          <Rocket className="h-3.5 w-3.5 text-[#374BFF]" /> Milestone 0{nodeIdx + 1}
                        </span>
                        <span className="text-[#374BFF] inline-flex items-center gap-1">
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

        {/* Mobile & Tablet Responsive Layout (< 1024px) */}
        <div className="lg:hidden relative pl-6 sm:pl-8 md:pl-10 space-y-6 sm:space-y-8">
          {/* Vertical Timeline Spine Line */}
          <div className="absolute left-2.5 sm:left-3.5 md:left-4 top-4 bottom-8 w-1 rounded-full bg-[#14141A]/10 z-0 overflow-hidden">
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 0.52 }}
              viewport={{ once: true }}
              style={{ transformOrigin: "top" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full h-full bg-[#374BFF] rounded-full"
            />
          </div>

          {data.map((node, nodeIdx) => {
            const isActive = node.statusType === "active";
            const badgeBg = node.badgeBg || (isActive 
              ? "border-[#374BFF]/30 bg-[#374BFF]/10 text-[#374BFF]" 
              : "border-[#14141A]/20 bg-[#F5F6FC] text-[#14141A]");
            const nodeBorder = node.nodeBorder || (isActive 
              ? "border-[#374BFF] shadow-sm" 
              : "border border-dashed border-[#14141A]/30 shadow-none");

            return (
              <div key={node.phase || nodeIdx} className="relative z-10">
                {/* Node Spine Marker */}
                <div className="absolute -left-6 sm:-left-8 md:-left-10 top-5 -translate-x-1/2 flex items-center justify-center">
                  <div
                    className={`relative flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-white ${nodeBorder} shadow-sm transition-all`}
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${isActive ? "bg-[#374BFF]" : "bg-[#14141A]/30"}`}
                    />
                    {isActive && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CFFF04] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#CFFF04]" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Card */}
                <Reveal direction="up" delay={nodeIdx * 0.08} className="w-full">
                  <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full flex flex-col justify-between group hover:border-[#374BFF] transition-colors duration-200">
                    <div className="space-y-4">
                      {/* Top Bar: Phase, Year, Badge */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#14141A]/10">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold tracking-wider text-[#374BFF]">
                            {node.phase}
                          </span>
                          <span className="text-[11px] font-bold text-[#14141A]/50">
                            • {node.year}
                          </span>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-sm ${badgeBg}`}>
                          {node.status}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-heading text-base sm:text-lg font-bold tracking-tight text-[#14141A]">
                          {node.title}
                        </h3>
                      </div>

                      {/* Milestones list */}
                      <div className="space-y-2.5 pt-1">
                        {node.milestones.map((m, mIdx) => (
                          <div
                            key={`${m.text}-${mIdx}`}
                            className="flex items-start gap-2.5 text-xs sm:text-sm font-medium"
                          >
                            {m.status === "completed" ? (
                              <CheckCircle2 className="h-4 w-4 text-[#374BFF] shrink-0 mt-0.5" />
                            ) : m.status === "in-progress" ? (
                              <Clock className="h-4 w-4 text-[#374BFF] shrink-0 mt-0.5 animate-pulse" />
                            ) : (
                              <Target className="h-4 w-4 text-[#14141A]/40 shrink-0 mt-0.5" />
                            )}
                            <span
                              className={
                                m.status === "completed"
                                  ? "text-[#14141A] line-through decoration-[#374BFF] opacity-80"
                                  : m.status === "in-progress"
                                  ? "text-[#374BFF] font-bold"
                                  : "text-[#14141A]/80"
                              }
                            >
                              {m.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Card Footer */}
                    <div className="pt-4 mt-4 border-t border-[#14141A]/10 flex items-center justify-between text-xs font-bold text-[#14141A]/70">
                      <span className="flex items-center gap-1.5 text-[#14141A]/80">
                        <Rocket className="h-3.5 w-3.5 text-[#374BFF]" /> Milestone 0{nodeIdx + 1}
                      </span>
                      <span className="text-[#374BFF] inline-flex items-center gap-1">
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
    </section>
  );
}
