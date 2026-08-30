"use client";

import { Reveal } from "@/components/motion/reveal";
import { Lightbulb, Users2, Rocket, Briefcase, Sparkles } from "lucide-react";
import { aboutTags, aboutTimeline } from "@/lib/data/site-content";

const iconMap: Record<string, typeof Lightbulb> = {
  Lightbulb,
  Users2,
  Rocket,
  Briefcase,
  Sparkles,
};

export function AboutSection() {
  return (
    <section id="about" className="relative py-24 sm:py-32 px-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <Reveal direction="down">
            <span className="text-xs font-bold uppercase tracking-widest text-[#374BFF] dark:text-[#CFFF04] font-heading">
              Who We Are
            </span>
          </Reveal>
          <Reveal direction="up" delay={0.08}>
            <h2 className="mt-3 font-heading text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-[#14141A] dark:text-[#F5F6FC]">
              Driven by Curiosity. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#374BFF] via-[#374BFF] to-[#CFFF04]">
                Engineered for Impact.
              </span>
            </h2>
          </Reveal>
          <Reveal direction="up" delay={0.16}>
            <p className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg text-[#2B2B38] dark:text-[#F5F6FC]/85 font-sans leading-relaxed font-medium">
              TrioCore is a forward-thinking digital solutions studio founded by Computer Science and Engineering innovators in India with a shared mission: delivering high-performance, custom-crafted digital solutions with speed and transparency.
            </p>
          </Reveal>
        </div>

        <Reveal direction="up" delay={0.24}>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-4xl mx-auto mb-16 sm:mb-24">
            {aboutTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#14141A]/15 dark:border-[#374BFF]/25 bg-white dark:bg-[#1C1C26] px-3.5 sm:px-4.5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-[#14141A] dark:text-[#F5F6FC] shadow-sm transition-all hover:scale-105 hover:border-[#374BFF] hover:text-[#374BFF]"
              >
                {tag}
              </span>
            ))}
          </div>
        </Reveal>

        <div className="mt-8 sm:mt-12">
          <Reveal direction="up">
            <div className="text-center mb-10 sm:mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-[#374BFF] dark:text-[#CFFF04] font-heading">
                Our Evolution
              </span>
              <h3 className="mt-2 text-2xl sm:text-4xl font-black font-heading tracking-tight text-[#14141A] dark:text-[#F5F6FC]">
                From Concept to Production
              </h3>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {aboutTimeline.map((item, index) => {
              const Icon = iconMap[item.iconName] || Lightbulb;
              return (
                <Reveal key={item.step} direction="up" delay={index * 0.06}>
                  <div className="glass-card rounded-3xl p-5 sm:p-6 h-full flex flex-col justify-between relative group hover:border-[#374BFF]">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-heading text-2xl sm:text-3xl font-black text-stroke-blue">
                          {item.step}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border shadow-sm ${
                            item.status === "Completed"
                              ? "border-[#374BFF]/30 bg-[#374BFF]/10 text-[#374BFF] dark:text-[#CFFF04]"
                              : item.status === "Active"
                              ? "border-[#CFFF04]/50 bg-[#CFFF04]/20 text-[#14141A] dark:text-[#CFFF04]"
                              : "border-[#14141A]/12 dark:border-white/10 bg-[#F5F6FC] dark:bg-[#14141A] text-[#14141A]/60 dark:text-[#F5F6FC]/50"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#374BFF]/15 text-[#374BFF]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <h4 className="font-heading text-base sm:text-lg font-bold text-[#14141A] dark:text-[#F5F6FC]">
                          {item.title}
                        </h4>
                      </div>

                      <p className="text-xs text-[#2B2B38] dark:text-[#D5D7E6] leading-relaxed font-sans font-medium">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
