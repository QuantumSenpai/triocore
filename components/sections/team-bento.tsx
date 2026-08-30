"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FolderGit2, Code, RotateCw, UserPlus, ArrowUpRight } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/shared/icons";
import { Reveal } from "@/components/motion/reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { teamMembers as staticTeamMembers, TeamMember } from "@/lib/data/site-content";
import { cn } from "@/lib/utils";

export function TeamBentoSection() {
  const [teamList, setTeamList] = useState<TeamMember[]>(staticTeamMembers);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [loadedAvatars, setLoadedAvatars] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/admin/team")
      .then((r) => r.json())
      .then((data) => {
        const list = data?.members || data?.team;
        if (list && Array.isArray(list) && list.length > 0) {
          setTeamList(list);
        }
      })
      .catch(() => {});
  }, []);

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
          {teamList.map((member, index) => {
            const isFlipped = Boolean(flippedCards[member.id]);
            const isPlaceholder = member.isPlaceholder;
            const isAvatarLoaded = Boolean(loadedAvatars[member.id]);

            return (
              <Reveal key={member.id} direction="up" delay={index * 0.08}>
                <div
                  className="group relative h-[490px] sm:h-[510px] w-full select-none [perspective:1200px]"
                >
                  <div
                    className={cn(
                      "relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d]",
                      isFlipped ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]"
                    )}
                  >
                    <div
                      onClick={() => toggleFlip(member.id)}
                      className={cn(
                        "absolute inset-0 p-6 sm:p-7 flex flex-col justify-between rounded-3xl glass-card border border-[#14141A]/12 dark:border-[#374BFF]/25 shadow-xl transition-all duration-300 overflow-hidden [backface-visibility:hidden] cursor-pointer",
                        "hover:border-[#374BFF] hover:shadow-2xl hover:shadow-[#374BFF]/20",
                        isFlipped ? "pointer-events-none z-0 opacity-0" : "pointer-events-auto z-10 opacity-100"
                      )}
                    >
                      <div className="absolute -top-14 -right-14 w-32 h-32 bg-[#374BFF]/15 dark:bg-[#374BFF]/25 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                      
                      <div className="space-y-4 text-center relative z-10">
                        <div className="relative mx-auto w-28 h-28 sm:w-32 sm:h-32">
                          <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-[#374BFF] via-[#374BFF]/50 to-[#CFFF04]/50 opacity-40 blur-sm group-hover:opacity-100 group-hover:blur-md transition-all duration-500" />
                          <div className="relative w-full h-full rounded-full overflow-hidden ring-3 ring-[#374BFF]/30 dark:ring-[#374BFF]/50 p-1 bg-white dark:bg-[#14141A] shadow-md shadow-black/10">
                            <div className="relative w-full h-full rounded-full overflow-hidden bg-[#14141A]">
                              {isPlaceholder ? (
                                <div className="flex h-full w-full flex-col items-center justify-center bg-[#1C1C26] text-[#F5F6FC] p-4 text-center">
                                  <UserPlus className="h-8 w-8 mb-1 text-[#374BFF]" />
                                  <span className="text-[9px] font-bold uppercase tracking-wider">Slot Available</span>
                                </div>
                              ) : (
                                <>
                                  {!isAvatarLoaded && (
                                    <Skeleton className="absolute inset-0 z-10 w-full h-full rounded-full bg-[#14141A]/20 dark:bg-white/10" />
                                  )}
                                  <Image
                                    src={member.avatarUrl}
                                    alt={member.name}
                                    fill
                                    sizes="(max-width: 768px) 112px, 128px"
                                    onLoad={() => handleAvatarLoaded(member.id)}
                                    className={cn(
                                      "object-cover transition-transform duration-500 group-hover:scale-110",
                                      isAvatarLoaded ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <h3 className="font-heading text-lg sm:text-xl font-black tracking-tight text-[#14141A] dark:text-[#F5F6FC] group-hover:text-[#374BFF] transition-colors">
                            {member.name}
                          </h3>
                          <p className="text-[11px] font-bold uppercase tracking-wide text-[#374BFF] dark:text-[#CFFF04] font-sans leading-snug line-clamp-2 min-h-[32px] flex items-center justify-center">
                            {member.role}
                          </p>
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#14141A]/10 dark:border-white/10 bg-[#14141A]/4 dark:bg-white/5 text-[10px] font-bold text-[#14141A]/80 dark:text-[#F5F6FC]/80">
                          <FolderGit2 className="h-3 w-3 text-[#374BFF] dark:text-[#CFFF04]" />
                          <span>{(member.projects || []).length} Engineering Builds</span>
                        </div>
                      </div>

                      <div className="space-y-3.5 relative z-10">
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {(member.skills || []).slice(0, 4).map((skill) => (
                            <span
                              key={skill}
                              className="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[#374BFF]/25 dark:border-[#374BFF]/40 bg-[#374BFF]/8 dark:bg-[#374BFF]/15 text-[#14141A] dark:text-[#F5F6FC] shadow-2xs group-hover:border-[#374BFF]/50 transition-colors"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div className="pt-3 border-t border-[#14141A]/10 dark:border-white/10 flex items-center justify-between text-xs text-[#14141A] dark:text-[#F5F6FC]/80 font-bold">
                          <span className="flex items-center gap-1.5 text-[#374BFF] dark:text-[#CFFF04] group-hover:underline">
                            <RotateCw className="h-3.5 w-3.5 text-[#374BFF] dark:text-[#CFFF04] transition-transform duration-500 group-hover:rotate-180" />
                            <span>View Stack & Projects</span>
                          </span>
                          <span className="text-[10px] font-black font-heading text-stroke-blue">
                            0{index + 1}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "absolute inset-0 p-6 sm:p-7 flex flex-col justify-between rounded-3xl glass-card border-2 border-[#374BFF] bg-white dark:bg-[#14141A] shadow-2xl shadow-[#374BFF]/25 overflow-hidden [transform:rotateY(180deg)] [backface-visibility:hidden]",
                        isFlipped ? "pointer-events-auto z-20 opacity-100" : "pointer-events-none z-0 opacity-0"
                      )}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-[#14141A]/10 dark:border-white/10">
                          <div>
                            <h4 className="font-heading text-base sm:text-lg font-black text-[#14141A] dark:text-[#F5F6FC]">
                              {member.name}
                            </h4>
                            <p className="text-[11px] text-[#374BFF] dark:text-[#CFFF04] font-bold">
                              {isPlaceholder ? "Candidate Profile" : "Specializations & Builds"}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#374BFF]/30 bg-[#374BFF]/10 text-[#374BFF] dark:text-[#CFFF04]">
                            {isPlaceholder ? "Incoming" : "Verified"}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-xs font-black uppercase tracking-wider text-[#14141A] dark:text-[#F5F6FC] flex items-center gap-1.5">
                            <Code className="h-3.5 w-3.5 text-[#374BFF] dark:text-[#CFFF04]" /> Tech Proficiencies
                          </p>
                          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                            {(member.skills && member.skills.length > 0) ? (
                              member.skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[#14141A]/15 dark:border-white/15 bg-[#F5F6FC] dark:bg-[#1C1C26] text-[#14141A] dark:text-[#F5F6FC] hover:border-[#374BFF] hover:bg-[#374BFF]/15 hover:text-[#374BFF] dark:hover:text-[#CFFF04] transition-all cursor-default select-none shadow-2xs active:scale-95"
                                >
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-[#14141A]/60 dark:text-[#F5F6FC]/60">Full-Stack Development</span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-xs font-black uppercase tracking-wider text-[#14141A] dark:text-[#F5F6FC] flex items-center gap-1.5">
                            <FolderGit2 className="h-3.5 w-3.5 text-[#374BFF] dark:text-[#CFFF04]" /> Featured Projects
                          </p>
                          <div className="space-y-2 max-h-36 overflow-y-auto pr-1 overscroll-contain">
                            {(member.projects && member.projects.length > 0) ? (
                              member.projects.map((proj) => (
                                <div
                                  key={proj.title}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                  className="group/proj p-2.5 rounded-xl border border-[#14141A]/15 dark:border-white/10 bg-[#F5F6FC] dark:bg-[#1C1C26] hover:border-[#374BFF] hover:bg-[#374BFF]/8 dark:hover:bg-[#374BFF]/15 hover:shadow-md transition-all cursor-pointer"
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <p className="text-xs font-bold text-[#14141A] dark:text-[#F5F6FC] group-hover/proj:text-[#374BFF] dark:group-hover/proj:text-[#CFFF04] transition-colors">
                                      {proj.title}
                                    </p>
                                    <ArrowUpRight className="h-3 w-3 text-[#374BFF] dark:text-[#CFFF04] opacity-40 group-hover/proj:opacity-100 group-hover/proj:translate-x-0.5 group-hover/proj:-translate-y-0.5 transition-all" />
                                  </div>
                                  {proj.desc && (
                                    <p className="text-[10px] text-[#2B2B38] dark:text-[#D5D7E6] leading-snug mt-1">
                                      {proj.desc}
                                    </p>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="p-2.5 rounded-xl border border-[#14141A]/15 dark:border-white/10 bg-[#F5F6FC] dark:bg-[#1C1C26]">
                                <p className="text-xs font-bold text-[#14141A] dark:text-[#F5F6FC]">
                                  Active Deployments
                                </p>
                                <p className="text-[10px] text-[#2B2B38] dark:text-[#D5D7E6]">
                                  Custom client and studio projects in development.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#14141A]/10 dark:border-white/10 flex items-center justify-between relative z-30">
                        <div className="flex items-center gap-2">
                          {member.githubUrl && (
                            <a
                              href={member.githubUrl}
                              target="_blank"
                              rel="noreferrer noopener"
                              onClick={(e) => e.stopPropagation()}
                              onPointerDown={(e) => e.stopPropagation()}
                              className="relative z-30 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#14141A]/15 dark:border-white/15 bg-[#F5F6FC] dark:bg-[#1C1C26] text-[#14141A] dark:text-[#F5F6FC] hover:text-white hover:bg-[#374BFF] hover:border-[#374BFF] hover:scale-110 active:scale-95 shadow-sm transition-all cursor-pointer pointer-events-auto"
                              aria-label={`${member.name} GitHub profile`}
                            >
                              <GithubIcon className="h-3.5 w-3.5" />
                            </a>
                          )}
                          {member.linkedinUrl && (
                            <a
                              href={member.linkedinUrl}
                              target="_blank"
                              rel="noreferrer noopener"
                              onClick={(e) => e.stopPropagation()}
                              onPointerDown={(e) => e.stopPropagation()}
                              className="relative z-30 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#14141A]/15 dark:border-white/15 bg-[#F5F6FC] dark:bg-[#1C1C26] text-[#14141A] dark:text-[#F5F6FC] hover:text-white hover:bg-[#374BFF] hover:border-[#374BFF] hover:scale-110 active:scale-95 shadow-sm transition-all cursor-pointer pointer-events-auto"
                              aria-label={`${member.name} LinkedIn profile`}
                            >
                              <LinkedinIcon className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFlip(member.id);
                          }}
                          className="text-[11px] text-[#374BFF] dark:text-[#CFFF04] font-bold flex items-center gap-1 hover:underline cursor-pointer relative z-30 pointer-events-auto"
                        >
                          <RotateCw className="h-3 w-3" /> Flip back
                        </button>
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
