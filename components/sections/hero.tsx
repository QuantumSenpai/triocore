"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Code2, Cpu, Rocket, CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Counter } from "@/components/motion/counter";
import { Reveal } from "@/components/motion/reveal";
import { AnimatedGridBg } from "@/components/shared/animated-grid-bg";

interface StatRecord {
  id: string;
  key: string;
  value: string;
  label: string;
  section: string;
  order: number;
}

const defaultHeroStats = [
  { key: "hero_innovators", value: "3", label: "Core Innovators", icon: Code2 },
  { key: "hero_services", value: "6", label: "Service Capabilities", icon: Cpu },
  { key: "hero_projects", value: "15+", label: "Projects Engineered", icon: Rocket },
];

export interface HeroSectionProps {
  initialData?: {
    headline: string;
    subtext: string;
    stats: { key: string; value: string; label: string }[];
  };
}

export function HeroSection({ initialData }: HeroSectionProps) {
  const statsFromProp = initialData?.stats?.map((s) => ({
    key: s.key,
    value: s.value,
    label: s.label,
    icon: s.key.includes("innovator") ? Code2 : s.key.includes("service") ? Cpu : Rocket,
  }));

  // Guarantee all 3 canonical hero tiles always render, incorporating dynamic DB/CMS overrides
  const statsData = defaultHeroStats.map((defaultStat) => {
    const fromProp = statsFromProp?.find((s) => s.key === defaultStat.key);
    return fromProp || defaultStat;
  });
  const headline = initialData?.headline || "Think. Build. Scale.";
  const subtext = initialData?.subtext || "A forward-engineering digital solutions studio founded by CSE innovators. We craft custom web architectures, Mobile & Web Apps, contactless NFC systems, machine learning pipelines, and robotics hardware across India.";
  const headlineParts = headline.split(" ");

  const renderStatValue = (valStr: string) => {
    const trimmed = (valStr || "").trim();
    const parsedNum = parseInt(trimmed, 10);
    if (!isNaN(parsedNum) && !trimmed.includes("/")) {
      const suffix = trimmed.replace(String(parsedNum), "");
      return <Counter value={parsedNum} suffix={suffix} />;
    }
    return <span className="tabular-nums">{trimmed}</span>;
  };

  return (
    <section className="relative min-h-[94vh] flex items-center justify-center pt-36 sm:pt-40 pb-24 sm:pb-28 px-5 sm:px-6 lg:px-8 overflow-hidden">
      <AnimatedGridBg showGrid={true} showOrbs={true} />

      <div className="absolute top-[44%] sm:top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none -z-0 opacity-[0.03] font-heading font-black text-[16vw] sm:text-[20vw] leading-none tracking-tighter text-stroke-subtle whitespace-nowrap uppercase">
        TRIOCORE
      </div>

      <div className="relative z-10 mx-auto max-w-6xl w-full text-center">
        <div className="flex flex-wrap items-center justify-center gap-x-3.5 sm:gap-x-6 gap-y-1.5">
          <motion.span
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[1.05] sm:leading-[0.95] text-[#14141A]"
          >
            {headlineParts[0] || "Think."}
          </motion.span>

          <motion.span
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[1.05] sm:leading-[0.95] text-[#374BFF]"
          >
            {headlineParts[1] || "Build."}
          </motion.span>

          <motion.span
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[1.05] sm:leading-[0.95] text-[#374BFF]"
          >
            {headlineParts.slice(2).join(" ") || "Scale."}
          </motion.span>
        </div>

        <Reveal direction="up" delay={0.25} duration={0.5}>
          <p className="mx-auto mt-8 sm:mt-10 max-w-xl text-base sm:text-lg md:text-xl text-[#14141A] font-sans leading-relaxed font-medium px-2 sm:px-0">
            {subtext}
          </p>
        </Reveal>

        <Reveal direction="up" delay={0.35} duration={0.5}>
          <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 w-full max-w-md sm:max-w-none mx-auto">
            <Link
              href="#pricing"
              className={buttonVariants({ variant: "primary", size: "lg", className: "w-full sm:w-auto" })}
            >
              <span>View Pricing</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-150 group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="#showcase"
              className={buttonVariants({ variant: "outline", size: "lg", className: "w-full sm:w-auto" })}
            >
              <span>View Our Work</span>
            </Link>
          </div>
        </Reveal>

        <Reveal direction="up" delay={0.45} duration={0.6}>
          <div className="mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {statsData.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.key}
                  className="glass-card rounded-3xl p-6 text-center border border-[#14141A]/10 hover:-translate-y-1.5 transition-transform duration-300"
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Icon className="h-5 w-5 text-[#374BFF]" />
                    <span className="font-heading text-2xl sm:text-3xl font-black text-[#14141A] tracking-tight">
                      {renderStatValue(stat.value)}
                    </span>
                  </div>
                  <p className="text-xs uppercase tracking-widest font-bold text-[#14141A]">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </Reveal>

        <Reveal direction="up" delay={0.55} duration={0.6}>
          <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-bold text-[#14141A]">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#374BFF]" /> Full Code Ownership
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#374BFF]" /> Interactive Staging Previews
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#374BFF]" /> Serving Clients Across India 🇮🇳
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
