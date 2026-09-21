"use client";

import { Cpu, ShieldAlert, Navigation2, Flame, Terminal, Activity, BrainCircuit } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { innovationProjects } from "@/lib/data/site-content";

const iconMap: Record<string, typeof ShieldAlert> = {
  ShieldAlert,
  BrainCircuit,
  Cpu,
  Flame,
  Navigation2,
};

export interface InnovationLabSectionProps {
  showBenchmarks?: boolean;
}

export function InnovationLabSection({ showBenchmarks = true }: InnovationLabSectionProps) {
  return (
    <section id="innovation" className="relative py-24 sm:py-32 px-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <Reveal direction="down">
            <span className="text-xs font-bold uppercase tracking-widest text-[#374BFF] font-heading">
              R&D & Engineering
            </span>
          </Reveal>
          <Reveal direction="up" delay={0.08}>
            <h2 className="mt-3 font-heading text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-[#14141A]">
              TrioCore Innovation Lab <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#374BFF] via-[#374BFF] to-[#CFFF04]">
                Where Code Meets Hardware
              </span>
            </h2>
          </Reveal>
          <Reveal direction="up" delay={0.16}>
            <p className="mt-4 text-sm sm:text-base md:text-lg text-[#2B2B38] font-sans font-medium">
              Beyond software interfaces, we design and assemble hardware prototypes, IoT safety systems, and algorithmic ML models to tackle real-world challenges.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {innovationProjects.map((proj, index) => {
            const Icon = iconMap[proj.iconName] || Cpu;
            return (
              <Reveal key={proj.id} direction="up" delay={index * 0.08} className={proj.colSpan}>
                <div className="glass-card h-full p-6 sm:p-8 flex flex-col justify-between group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="space-y-5 sm:space-y-6">
                    <div className="flex items-center justify-between">
                      <div className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${proj.accent} text-white shadow-md shadow-black/15 group-interactive-lift transition-transform duration-300`}>
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#FFFFFF]" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-xs ${proj.statusColor}`}>
                          {proj.status}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#374BFF]">
                        {proj.category}
                      </span>
                      <h3 className="mt-1 font-heading text-xl sm:text-2xl font-bold text-[#14141A] group-hover:text-[#374BFF] transition-colors">
                        {proj.title}
                      </h3>
                      <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-[#2B2B38] leading-relaxed font-sans font-medium">
                        {proj.desc}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-[#14141A]/10">
                      {showBenchmarks && proj.metric && (
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-[#14141A] flex items-center gap-1.5 font-bold">
                            <Activity className="h-4 w-4 text-[#374BFF]" /> Benchmark
                          </span>
                          <span className="font-heading font-black text-[#14141A]">
                            {proj.metric}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1.5">
                        {proj.tech.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-[#14141A]/10 bg-[#F5F6FC] text-[#14141A]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 sm:pt-5 mt-4 sm:mt-5 border-t border-[#14141A]/10 flex items-center justify-between text-xs font-bold text-[#14141A]">
                    <span className="flex items-center gap-1.5 text-[#374BFF]">
                      <Terminal className="h-3.5 w-3.5" /> R&D Prototype
                    </span>
                    <span className="uppercase tracking-wider">TrioCore Labs</span>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
