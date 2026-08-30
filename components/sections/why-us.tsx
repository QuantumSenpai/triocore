"use client";

import { 
  Zap, 
  Palette, 
  BadgePercent, 
  GraduationCap, 
  HeartHandshake, 
  ShieldCheck 
} from "lucide-react";
import { Counter } from "@/components/motion/counter";
import { Reveal } from "@/components/motion/reveal";
import { whyUsValues, whyUsStats } from "@/lib/data/site-content";

const iconMap: Record<string, typeof Zap> = {
  Zap,
  Palette,
  BadgePercent,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
};

export function WhyUsSection() {
  return (
    <section className="relative py-24 sm:py-32 px-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <Reveal direction="down">
            <span className="text-xs font-bold uppercase tracking-widest text-[#374BFF] dark:text-[#CFFF04] font-heading">
              Why TrioCore
            </span>
          </Reveal>
          <Reveal direction="up" delay={0.08}>
            <h2 className="mt-3 font-heading text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-[#14141A] dark:text-[#F5F6FC]">
              The TrioCore Advantage: <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#374BFF] via-[#374BFF] to-[#CFFF04]">
                Speed, Polish & Reliability
              </span>
            </h2>
          </Reveal>
          <Reveal direction="up" delay={0.16}>
            <p className="mt-4 text-sm sm:text-base md:text-lg text-[#2B2B38] dark:text-[#F5F6FC]/85 font-sans font-medium">
              Discover why founders, educators, and creators across India trust TrioCore to bring their digital concepts into production reality.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-16 sm:mb-20">
          {whyUsValues.map((v, index) => {
            const Icon = iconMap[v.iconName] || Zap;
            return (
              <Reveal key={v.title} direction="up" delay={index * 0.06}>
                <div className="glass-card rounded-3xl p-6 sm:p-8 h-full flex flex-col justify-between group hover:border-[#374BFF] transition-all">
                  <div className="space-y-4">
                    <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-[#374BFF]/15 text-[#374BFF] dark:text-[#CFFF04] group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <h3 className="font-heading text-lg sm:text-xl font-bold text-[#14141A] dark:text-[#F5F6FC] group-hover:text-[#374BFF] transition-colors">
                      {v.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#2B2B38] dark:text-[#D5D7E6] leading-relaxed font-sans font-medium">
                      {v.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal direction="up" delay={0.25}>
          <div className="rounded-3xl bg-gradient-to-br from-[#14141A] via-[#1C1C26] to-[#14141A] p-6 sm:p-14 text-white shadow-2xl relative overflow-hidden border border-[#374BFF]/25">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#374BFF]/25 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-white/15">
              {whyUsStats.map((stat, i) => (
                <div key={stat.label} className={i > 0 ? "pt-4 sm:pt-0" : ""}>
                  <p className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black text-[#F5F6FC] tracking-tighter">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#CFFF04]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
