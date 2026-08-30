"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { ShowcaseCardSkeleton } from "@/components/ui/skeleton";
import { showcaseProjects } from "@/lib/data/site-content";
import { cn } from "@/lib/utils";

interface ShowcaseGridSectionProps {
  isLoading?: boolean;
}

export function ShowcaseGridSection({ isLoading = false }: ShowcaseGridSectionProps) {
  const [activeTab, setActiveTab] = useState<"All" | "Completed" | "Coming Soon">("All");

  const filteredProjects = showcaseProjects.filter((item) => {
    if (activeTab === "All") return true;
    return item.status === activeTab;
  });

  return (
    <section id="showcase" className="relative py-24 sm:py-32 px-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <Reveal direction="down">
            <span className="text-xs font-bold uppercase tracking-widest text-[#374BFF] dark:text-[#CFFF04] font-heading">
              Our Portfolio
            </span>
          </Reveal>
          <Reveal direction="up" delay={0.08}>
            <h2 className="mt-3 font-heading text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-[#14141A] dark:text-[#F5F6FC]">
              Featured Projects & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#374BFF] via-[#374BFF] to-[#CFFF04]">
                Digital Deployments
              </span>
            </h2>
          </Reveal>
          <Reveal direction="up" delay={0.16}>
            <p className="mt-4 text-sm sm:text-base md:text-lg text-[#2B2B38] dark:text-[#F5F6FC]/85 font-sans font-medium">
              Explore web apps, dynamic portals, and product templates engineered by the TrioCore development team.
            </p>
          </Reveal>

          <Reveal direction="up" delay={0.24}>
            <div className="mt-8 inline-flex p-1.5 rounded-2xl border border-[#14141A]/15 dark:border-[#374BFF]/25 bg-white dark:bg-[#1C1C26] shadow-sm">
              {(["All", "Completed", "Coming Soon"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#374BFF]",
                    activeTab === tab
                      ? "bg-[#374BFF] text-white shadow-md shadow-[#374BFF]/25"
                      : "text-[#14141A] dark:text-[#F5F6FC]/75 hover:text-[#374BFF] dark:hover:text-[#CFFF04]"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((key) => (
              <ShowcaseCardSkeleton key={key} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProjects.map((project, index) => {
              const isComingSoon = project.status === "Coming Soon";

              return (
                <Reveal key={project.id} direction="up" delay={index * 0.08}>
                  <div className="group relative rounded-3xl glass-card border border-[#14141A]/14 dark:border-[#374BFF]/20 overflow-hidden flex flex-col justify-between h-full transition-all duration-300 hover:border-[#374BFF] hover:shadow-xl hover:shadow-[#374BFF]/15">
                    <div>
                      <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-[#14141A]">
                        <Image
                          src={project.imageUrl}
                          alt={project.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#14141A] via-transparent to-transparent opacity-80" />

                        <div className="absolute top-3.5 right-3.5">
                          <span
                            className={cn(
                              "text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border backdrop-blur-md shadow-sm",
                              isComingSoon
                                ? "border-amber-500/40 bg-amber-500/20 text-amber-300"
                                : "border-[#CFFF04]/50 bg-[#14141A]/90 text-[#CFFF04]"
                            )}
                          >
                            {project.status}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 sm:p-7 space-y-3.5">
                        <h3 className="font-heading text-xl font-bold text-[#14141A] dark:text-[#F5F6FC] group-hover:text-[#374BFF] transition-colors">
                          {project.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-[#2B2B38] dark:text-[#D5D7E6] leading-relaxed font-sans font-medium">
                          {project.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {project.tech.map((t) => (
                            <span
                              key={t}
                              className="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[#14141A]/15 dark:border-white/10 bg-[#F5F6FC] dark:bg-[#14141A] text-[#14141A] dark:text-[#F5F6FC]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="px-6 sm:px-7 pb-6 sm:pb-7 pt-2 border-t border-[#14141A]/10 dark:border-white/10 flex items-center justify-between">
                      {isComingSoon ? (
                        <span className="text-xs font-bold text-[#14141A]/75 dark:text-[#F5F6FC]/60 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-amber-500" /> In Active Development
                        </span>
                      ) : (
                        <a
                          href={project.liveUrl || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#374BFF] dark:text-[#CFFF04] group-hover:underline"
                        >
                          <span>View Live Demo</span>
                          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </a>
                      )}
                      <span className="text-xs font-heading font-black text-stroke-blue">
                        0{index + 1}
                      </span>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
