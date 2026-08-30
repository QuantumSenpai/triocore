"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles, FolderGit2, Code, RotateCw, UserPlus } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/shared/icons";
import { Reveal } from "@/components/motion/reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { teamMembers } from "@/lib/data/site-content";
import { cn } from "@/lib/utils";

export function TeamBentoSection() {
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [loadedAvatars, setLoadedAvatars] = useState<Record<string, boolean>>({});

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAvatarLoaded = (id: string) => {
    setLoadedAvatars((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  return (
    <section id="team" className="relative py-24 sm:py-32 px-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <Reveal direction="down">
            <span className="text-xs font-bold uppercase tracking-widest text-[#374BFF] dark:text-[#CFFF04] font-heading">
              The Innovators
            </span>
          </Reveal>
          <Reveal direction="up" delay={0.08}>
            <h2 className="mt-3 font-heading text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-[#14141A] dark:text-[#F5F6FC]">
              The Minds Behind <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#374BFF] via-[#374BFF] to-[#CFFF04]">
                TrioCore Digital
              </span>
            </h2>
          </Reveal>
          <Reveal direction="up" delay={0.16}>
            <p className="mt-4 text-sm sm:text-base md:text-lg text-[#2B2B38] dark:text-[#F5F6FC]/85 font-sans font-medium">
              Multidisciplinary CSE engineers combining full-stack architectures, embedded robotics, and machine learning models. Tap cards to inspect specialties and projects.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => {
            const isFlipped = Boolean(flippedCards[member.id]);
            const isPlaceholder = member.isPlaceholder;
            const isAvatarLoaded = Boolean(loadedAvatars[member.id]);

            return (
              <Reveal key={member.id} direction="up" delay={index * 0.08}>
                <div
                  className="group relative h-[480px] sm:h-[500px] w-full cursor-pointer select-none"
                  onClick={() => toggleFlip(member.id)}
                >
                  <div
                    className={cn(
                      "relative h-full w-full rounded-3xl glass-card border p-6 sm:p-7 transition-all duration-300 overflow-hidden",
                      isFlipped ? "border-[#374BFF] shadow-xl shadow-[#374BFF]/20" : "hover:border-[#374BFF]"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute inset-0 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300",
                        isFlipped ? "opacity-0 pointer-events-none scale-95" : "opacity-100 scale-100"
                      )}
                    >
                      <div className="space-y-4 sm:space-y-5">
                        <div className="relative mx-auto w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden p-[2px] bg-gradient-to-br from-[#374BFF] via-[#374BFF] to-[#14141A] shadow-lg shadow-black/10">
                          <div className="relative w-full h-full rounded-[14px] overflow-hidden bg-[#14141A]">
                            {isPlaceholder ? (
                              <div className="flex h-full w-full flex-col items-center justify-center bg-[#1C1C26] text-[#F5F6FC] p-4 text-center">
                                <UserPlus className="h-10 w-10 mb-2 text-[#374BFF]" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Slot Available</span>
                              </div>
                            ) : (
                              <>
                                {!isAvatarLoaded && (
                                  <Skeleton className="absolute inset-0 z-10 w-full h-full rounded-[14px] bg-[#14141A]/20 dark:bg-white/10" />
                                )}
                                <Image
                                  src={member.avatarUrl}
                                  alt={member.name}
                                  fill
                                  sizes="(max-width: 768px) 128px, 144px"
                                  onLoad={() => handleAvatarLoaded(member.id)}
                                  className={cn(
                                    "object-cover transition-all duration-500 group-hover:scale-105",
                                    isAvatarLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
                                  )}
                                />
                              </>
                            )}
                          </div>
                        </div>

                        <div className="text-center space-y-1">
                          <h3 className="font-heading text-lg sm:text-xl font-black tracking-tight text-[#14141A] dark:text-[#F5F6FC]">
                            {member.name}
                          </h3>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-[#374BFF] font-sans">
                            {member.role}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {member.skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[#14141A]/15 dark:border-white/10 bg-[#F5F6FC] dark:bg-[#14141A] text-[#14141A] dark:text-[#F5F6FC]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div className="pt-3 border-t border-[#14141A]/10 dark:border-white/10 flex items-center justify-between text-xs text-[#14141A] dark:text-[#F5F6FC]/70 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-[#374BFF]" /> Details
                          </span>
                          <RotateCw className="h-3.5 w-3.5 text-[#374BFF] transition-transform group-hover:rotate-180 duration-500" />
                        </div>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "absolute inset-0 p-6 sm:p-7 flex flex-col justify-between bg-white dark:bg-[#14141A] transition-all duration-300",
                        isFlipped ? "opacity-100 scale-100" : "opacity-0 pointer-events-none scale-95"
                      )}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-[#14141A]/10 dark:border-white/10">
                          <div>
                            <h4 className="font-heading text-base sm:text-lg font-black text-[#14141A] dark:text-[#F5F6FC]">
                              {member.name}
                            </h4>
                            <p className="text-[11px] text-[#374BFF] font-bold">
                              {isPlaceholder ? "Candidate Profile" : "Specializations & Builds"}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#374BFF]/30 bg-[#374BFF]/10 text-[#374BFF] dark:text-[#CFFF04]">
                            {isPlaceholder ? "Incoming" : "Verified"}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-xs font-black uppercase tracking-wider text-[#14141A] dark:text-[#F5F6FC] flex items-center gap-1.5">
                            <Code className="h-3.5 w-3.5 text-[#374BFF]" /> Tech Proficiencies
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {member.skills.map((skill) => (
                              <span
                                key={skill}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#14141A]/15 dark:border-white/10 bg-[#F5F6FC] dark:bg-[#1C1C26] text-[#14141A] dark:text-[#F5F6FC]"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-xs font-black uppercase tracking-wider text-[#14141A] dark:text-[#F5F6FC] flex items-center gap-1.5">
                            <FolderGit2 className="h-3.5 w-3.5 text-[#374BFF]" /> Featured Projects
                          </p>
                          <div className="space-y-1.5">
                            {member.projects.map((proj) => (
                              <div
                                key={proj.title}
                                className="p-2 rounded-xl border border-[#14141A]/15 dark:border-white/10 bg-[#F5F6FC] dark:bg-[#1C1C26]"
                              >
                                <p className="text-xs font-bold text-[#14141A] dark:text-[#F5F6FC]">
                                  {proj.title}
                                </p>
                                {proj.desc && (
                                  <p className="text-[10px] text-[#2B2B38] dark:text-[#D5D7E6]">
                                    {proj.desc}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#14141A]/10 dark:border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {member.githubUrl && (
                            <a
                              href={member.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#14141A]/15 dark:border-white/15 bg-[#F5F6FC] dark:bg-[#1C1C26] text-[#14141A] dark:text-[#F5F6FC] hover:text-[#374BFF] hover:border-[#374BFF] transition-all"
                              aria-label={`${member.name} GitHub profile`}
                            >
                              <GithubIcon className="h-3.5 w-3.5" />
                            </a>
                          )}
                          {member.linkedinUrl && (
                            <a
                              href={member.linkedinUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#14141A]/15 dark:border-white/15 bg-[#F5F6FC] dark:bg-[#1C1C26] text-[#14141A] dark:text-[#F5F6FC] hover:text-[#374BFF] hover:border-[#374BFF] transition-all"
                              aria-label={`${member.name} LinkedIn profile`}
                            >
                              <LinkedinIcon className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                        <span className="text-[11px] text-[#14141A] dark:text-[#F5F6FC]/70 font-semibold flex items-center gap-1">
                          <RotateCw className="h-3 w-3 text-[#374BFF]" /> Tap to close
                        </span>
                      </div>
                    </div>
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
