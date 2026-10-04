"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Clock, Circle, Rocket, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { roadmapData, RoadmapPhase } from "@/lib/data/site-content";

interface RoadmapSectionProps {
  initialData?: RoadmapPhase[];
}

export function RoadmapSection({ initialData }: RoadmapSectionProps) {
  const data = initialData && initialData.length > 0 ? initialData : roadmapData;
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="roadmap" className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
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
              A transparent, milestone-driven progression path from studio foundation to an intelligent SaaS and robotics engineering collective.
            </p>
          </Reveal>
        </div>

        {/* Desktop Layout (>= 1024px) */}
        <div className="hidden lg:block relative">
          {/* Horizontal Track Line */}
          <div className="absolute top-12 left-12 right-12 h-1.5 rounded-full bg-[#14141A]/10 z-0 overflow-hidden">
            <motion.div
              initial={{ scaleX: shouldReduceMotion ? 0.36 : 0 }}
              whileInView={{ scaleX: 0.36 }}
              viewport={{ once: true }}
              style={{ transformOrigin: "left" }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}
              className="h-full w-full bg-[#374BFF] rounded-full"
            />
          </div>

          <div className="grid grid-cols-3 gap-8 relative z-10">
            {data.map((node, nodeIdx) => {
              const isActive = node.statusType === "active";
              const badgeBg = node.badgeBg || (isActive 
                ? "border-[#374BFF]/30 bg-[#374BFF]/10 text-[#374BFF] font-black" 
                : "border-[#14141A]/15 bg-[#14141A]/5 text-[#14141A]/65 font-bold");
              const nodeBorder = node.nodeBorder || (isActive 
                ? "border-2 border-[#374BFF] shadow-sm" 
                : "border-2 border-dashed border-[#14141A]/25 shadow-none");

              return (
                <div key={node.phase || nodeIdx} className="flex flex-col items-center">
                  <Reveal direction="down" delay={nodeIdx * 0.1} className="relative z-20">
                    <motion.div
                      whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className={`relative flex h-24 w-24 items-center justify-center rounded-3xl ${
                        isActive ? "bg-white" : "bg-[#F9FAFC]"
                      } ${nodeBorder} mb-8 transition-all shadow-md`}
                    >
                      <span className={`font-heading text-2xl tracking-tight ${isActive ? "font-black text-[#374BFF]" : "font-bold text-[#14141A]/70"}`}>
                        {node.year}
                      </span>
                      {isActive && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#374BFF] opacity-75" />
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-[#374BFF]" />
                        </span>
                      )}
                    </motion.div>
                  </Reveal>

                  <Reveal direction="up" delay={nodeIdx * 0.1 + 0.08} className="w-full relative z-10 h-full">
                    <div
                      className={`rounded-3xl p-6 sm:p-7 w-full h-full flex flex-col justify-between transition-all duration-200 ${
                        isActive
                          ? "glass-card bg-white border border-[#374BFF]/25 shadow-md shadow-[#374BFF]/[0.03] group hover:border-[#374BFF]"
                          : "bg-[#F8F9FB]/60 border border-dashed border-[#14141A]/20 hover:bg-white/80 hover:border-[#14141A]/35"
                      }`}
                    >
                      <div className="space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-[#14141A]/10">
                          <span className={`text-xs font-mono font-bold tracking-wider ${isActive ? "text-[#374BFF]" : "text-[#14141A]/55"}`}>
                            {node.phase}
                          </span>
                          <span className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border shadow-sm ${badgeBg}`}>
                            {node.status}
                          </span>
                        </div>

                        <div>
                          <h3 className={`font-heading text-xl font-bold tracking-tight ${isActive ? "text-[#14141A]" : "text-[#14141A]/85"}`}>
                            {node.title}
                          </h3>
                        </div>

                        <div className="space-y-3 pt-2">
                          {node.milestones.map((m, mIdx) => (
                            <motion.div
                              key={`${m.text}-${mIdx}`}
                              initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.25, delay: nodeIdx * 0.1 + mIdx * 0.05, ease: "easeOut" }}
                              className="flex items-start gap-3 text-sm font-medium"
                            >
                              {m.status === "completed" ? (
                                <CheckCircle2 className="h-4 w-4 text-[#374BFF] shrink-0 mt-0.5" />
                              ) : m.status === "in-progress" ? (
                                <Clock className="h-4 w-4 text-[#374BFF] shrink-0 mt-0.5 animate-pulse" />
                              ) : (
                                <Circle className="h-3.5 w-3.5 text-[#14141A]/35 shrink-0 mt-0.5 stroke-[1.75]" />
                              )}
                              <span
                                className={
                                  m.status === "completed"
                                    ? "text-[#14141A]/90 line-through decoration-[#374BFF]/60 font-medium"
                                    : m.status === "in-progress"
                                    ? "text-[#374BFF] font-bold"
                                    : "text-[#14141A]/65 font-normal"
                                }
                              >
                                {m.text}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 mt-6 border-t border-[#14141A]/10 flex items-center justify-between text-xs font-semibold text-[#14141A]/70">
                        <span className="flex items-center gap-1.5 text-[#14141A]/70 font-mono text-[11px]">
                          <Rocket className={`h-3.5 w-3.5 ${isActive ? "text-[#374BFF]" : "text-[#14141A]/40"}`} /> Milestone 0{nodeIdx + 1}
                        </span>
                        {isActive ? (
                          <a
                            href="#showcase"
                            className="text-[#374BFF] hover:text-[#14141A] inline-flex items-center gap-1 font-bold transition-colors group/link cursor-pointer"
                          >
                            <span>Explore Deliverables</span>
                            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                          </a>
                        ) : (
                          <span className="text-[#14141A]/50 font-mono text-[11px] font-medium">
                            {node.year} Horizon Target
                          </span>
                        )}
                      </div>
                    </div>
                  </Reveal>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile & Tablet Responsive Layout (< 1024px) */}
        <div className="lg:hidden relative pl-12 sm:pl-14 md:pl-16 space-y-7 sm:space-y-9">
          {/* Vertical Timeline Spine Line */}
          <div className="absolute left-6 sm:left-7 md:left-8 top-7 bottom-8 w-[2px] rounded-full bg-[#14141A]/10 z-0 overflow-hidden">
            <motion.div
              initial={{ scaleY: shouldReduceMotion ? 0.36 : 0 }}
              whileInView={{ scaleY: 0.36 }}
              viewport={{ once: true }}
              style={{ transformOrigin: "top" }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}
              className="w-full h-full bg-[#374BFF] rounded-full"
            />
          </div>

          {data.map((node, nodeIdx) => {
            const isActive = node.statusType === "active";
            const badgeBg = node.badgeBg || (isActive 
              ? "border-[#374BFF]/30 bg-[#374BFF]/10 text-[#374BFF] font-black" 
              : "border-[#14141A]/15 bg-[#14141A]/5 text-[#14141A]/65 font-bold");
            const nodeBorder = node.nodeBorder || (isActive 
              ? "border-2 border-[#374BFF] shadow-sm" 
              : "border border-dashed border-[#14141A]/30 shadow-none");

            return (
              <div key={node.phase || nodeIdx} className="relative z-10">
                {/* Horizontal Connector Line from Spine Dot to Card Left Border */}
                <div
                  aria-hidden="true"
                  className={`absolute -left-6 sm:-left-7 md:-left-8 top-7 w-6 sm:w-7 md:w-8 h-[1.5px] -translate-y-1/2 z-10 transition-colors ${
                    isActive ? "bg-[#374BFF]" : "border-t border-dashed border-[#14141A]/25"
                  }`}
                />

                {/* Node Spine Marker (Centered exactly on the vertical spine line) */}
                <div className="absolute -left-6 sm:-left-7 md:-left-8 top-7 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center">
                  {isActive ? (
                    <div className="relative flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-white border-2 border-[#374BFF] shadow-sm transition-all">
                      <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#374BFF]" />
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#374BFF] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#374BFF]" />
                      </span>
                    </div>
                  ) : (
                    <div className="relative flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-[#F5F6FC] border border-dashed border-[#14141A]/30 transition-all">
                      <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#14141A]/20" />
                    </div>
                  )}
                </div>

                {/* Content Card with Generous Rhythm */}
                <Reveal direction="up" delay={nodeIdx * 0.08} className="w-full">
                  <div
                    className={`rounded-3xl p-5 sm:p-7 md:p-8 w-full flex flex-col justify-between transition-all duration-200 ${
                      isActive
                        ? "glass-card bg-white border border-[#374BFF]/30 shadow-md shadow-[#374BFF]/[0.03] group hover:border-[#374BFF]"
                        : "bg-[#F8F9FB]/60 border border-dashed border-[#14141A]/20 hover:bg-white/80 hover:border-[#14141A]/35"
                    }`}
                  >
                    <div className="space-y-4 sm:space-y-5">
                      {/* Top Bar: Phase, Year, Badge */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3.5 border-b border-[#14141A]/10">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-mono font-bold tracking-wider ${isActive ? "text-[#374BFF]" : "text-[#14141A]/60"}`}>
                            {node.phase}
                          </span>
                          <span className="text-[11px] font-semibold text-[#14141A]/40">
                            • {node.year}
                          </span>
                        </div>
                        <span className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-sm ${badgeBg}`}>
                          {node.status}
                        </span>
                      </div>

                      <div>
                        <h3 className={`font-heading text-lg sm:text-xl font-bold tracking-tight ${isActive ? "text-[#14141A]" : "text-[#14141A]/85"}`}>
                          {node.title}
                        </h3>
                      </div>

                      {/* Milestones list with clear status icons */}
                      <div className="space-y-3 pt-1">
                        {node.milestones.map((m, mIdx) => (
                          <div
                            key={`${m.text}-${mIdx}`}
                            className="flex items-start gap-3 text-xs sm:text-sm"
                          >
                            {m.status === "completed" ? (
                              <CheckCircle2 className="h-4 w-4 text-[#374BFF] shrink-0 mt-0.5" />
                            ) : m.status === "in-progress" ? (
                              <Clock className="h-4 w-4 text-[#374BFF] shrink-0 mt-0.5 animate-pulse" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 text-[#14141A]/35 shrink-0 mt-0.5 stroke-[1.75]" />
                            )}
                            <span
                              className={
                                m.status === "completed"
                                  ? "text-[#14141A]/90 line-through decoration-[#374BFF]/60 font-medium"
                                  : m.status === "in-progress"
                                  ? "text-[#374BFF] font-bold"
                                  : "text-[#14141A]/65 font-normal"
                              }
                            >
                              {m.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Card Footer */}
                    <div className="pt-4 sm:pt-5 mt-4 sm:mt-5 border-t border-[#14141A]/10 flex items-center justify-between text-xs font-semibold text-[#14141A]/70">
                      <span className="flex items-center gap-1.5 text-[#14141A]/70 font-mono text-[11px]">
                        <Rocket className={`h-3.5 w-3.5 ${isActive ? "text-[#374BFF]" : "text-[#14141A]/40"}`} /> Milestone 0{nodeIdx + 1}
                      </span>
                      {isActive ? (
                        <a
                          href="#showcase"
                          className="text-[#374BFF] hover:text-[#14141A] inline-flex items-center gap-1 font-bold transition-colors group/link cursor-pointer"
                        >
                          <span>Explore Deliverables</span>
                          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                        </a>
                      ) : (
                        <span className="text-[#14141A]/50 font-mono text-[11px] font-medium">
                          {node.year} Horizon Target
                        </span>
                      )}
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
