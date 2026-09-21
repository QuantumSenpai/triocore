"use client";

import { useState } from "react";
import Image from "next/image";
import { FolderGit2, Code, RotateCw, UserPlus, ArrowUpRight } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/shared/icons";
import { Reveal } from "@/components/motion/reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { teamMembers as staticTeamMembers, TeamMember } from "@/lib/data/site-content";
import { cn } from "@/lib/utils";

export interface TeamBentoSectionProps {
  initialTeam?: TeamMember[];
  initialEmployees?: TeamMember[];
}

export function TeamBentoSection({
  initialTeam,
  initialEmployees = [],
}: TeamBentoSectionProps) {
  const [teamList] = useState<TeamMember[]>(initialTeam || staticTeamMembers);
  const [employeeList] = useState<TeamMember[]>(initialEmployees);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [loadedAvatars, setLoadedAvatars] = useState<Record<string, boolean>>({});
  const [failedAvatars, setFailedAvatars] = useState<Record<string, boolean>>({});

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
            <span className="text-xs font-bold uppercase tracking-widest text-[#374BFF] font-heading">
              The Innovators
            </span>
          </Reveal>
          <Reveal direction="up" delay={0.08}>
            <h2 className="mt-3 font-heading text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-[#14141A]">
              The Minds Behind <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#374BFF] via-[#374BFF] to-[#CFFF04]">
                TrioCore Digital
              </span>
            </h2>
          </Reveal>
          <Reveal direction="up" delay={0.16}>
            <p className="mt-4 text-sm sm:text-base md:text-lg text-[#2B2B38] font-sans font-medium">
              Multidisciplinary CSE engineers combining full-stack architectures, embedded robotics, and machine learning models. Tap cards or press Enter/Space to inspect specialties and projects.
            </p>
          </Reveal>
        </div>

        {/* Core Founders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamList.map((member, index) => {
            const isFlipped = Boolean(flippedCards[member.id]);
            const isPlaceholder = member.isPlaceholder;
            const isAvatarLoaded = Boolean(loadedAvatars[member.id]);

            return (
              <Reveal key={member.id} direction="up" delay={index * 0.08}>
                <div
                  className="group relative h-[490px] sm:h-[510px] w-full select-none [perspective:1200px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#374BFF] rounded-3xl"
                  tabIndex={0}
                  role="button"
                  aria-label={`Flip profile card for ${member.name}`}
                  onClick={() => !isPlaceholder && toggleFlip(member.id)}
                  onKeyDown={(e) => {
                    if (isPlaceholder) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleFlip(member.id);
                    }
                  }}
                >
                  <div
                    className={cn(
                      "relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d]",
                      isFlipped ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]"
                    )}
                  >
                    {/* Front Face */}
                    <div className="absolute inset-0 h-full w-full rounded-3xl glass-card border border-black/10 overflow-hidden flex flex-col justify-between p-6 sm:p-7 [backface-visibility:hidden] hover:border-[#374BFF] hover:shadow-xl transition-all duration-300">
                      <div>
                        <div className="relative mx-auto mb-6 h-40 w-40 sm:h-44 sm:w-44 overflow-hidden rounded-2xl border-2 border-[#374BFF]/30 bg-black/5 p-1 shadow-inner">
                          {!isPlaceholder ? (
                            <>
                              {!isAvatarLoaded && !failedAvatars[member.id] && (
                                <Skeleton className="h-full w-full rounded-xl" />
                              )}
                              <Image
                                src={
                                  failedAvatars[member.id] || !member.avatarUrl
                                    ? `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(member.name)}`
                                    : member.avatarUrl
                                }
                                alt={member.name}
                                fill
                                sizes="176px"
                                onLoad={() => handleAvatarLoaded(member.id)}
                                onError={() => setFailedAvatars((prev) => ({ ...prev, [member.id]: true }))}
                                className={cn(
                                  "rounded-xl object-cover transition-opacity duration-300",
                                  isAvatarLoaded ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </>
                          ) : (
                            <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#374BFF]/5 text-[#374BFF]">
                              <UserPlus className="h-10 w-10 animate-pulse" />
                            </div>
                          )}
                        </div>

                        <div className="text-center">
                          <h3 className="font-heading text-xl sm:text-2xl font-black text-[#14141A]">
                            {member.name}
                          </h3>
                          <p className="mt-1 text-xs sm:text-sm font-bold text-[#374BFF]">
                            {member.role}
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="flex flex-wrap justify-center gap-1.5 mb-6">
                          {member.skills?.slice(0, 4).map((skill) => (
                            <span
                              key={skill}
                              className="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-black/10 bg-[#F5F6FC] text-[#14141A]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>

                        <div className="pt-3 border-t border-black/10 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {member.githubUrl && (
                              <a
                                href={member.githubUrl}
                                target="_blank"
                                rel="noreferrer noopener"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-black/10 bg-[#F5F6FC] text-[#14141A] hover:text-white hover:bg-[#374BFF] hover:border-[#374BFF] transition-all"
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
                                className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-black/10 bg-[#F5F6FC] text-[#14141A] hover:text-white hover:bg-[#374BFF] hover:border-[#374BFF] transition-all"
                                aria-label={`${member.name} LinkedIn profile`}
                              >
                                <LinkedinIcon className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                          {!isPlaceholder && (
                            <span className="text-[11px] text-[#374BFF] font-bold flex items-center gap-1">
                              Details <ArrowUpRight className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Back Face */}
                    <div className="absolute inset-0 h-full w-full rounded-3xl glass-card border border-black/10 p-6 sm:p-7 flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] bg-white">
                      <div>
                        <div className="flex items-center justify-between pb-3 border-b border-black/10">
                          <div>
                            <h4 className="font-heading text-lg font-black text-[#14141A]">
                              {member.name}
                            </h4>
                            <p className="text-xs font-bold text-[#374BFF]">
                              Specialties & Deployments
                            </p>
                          </div>
                          <Code className="h-4 w-4 text-[#374BFF]" />
                        </div>

                        <div className="mt-4 space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
                          {member.projects && member.projects.length > 0 ? (
                            member.projects.map((proj, pIdx) => (
                              <div
                                key={pIdx}
                                className="p-2.5 rounded-xl border border-black/10 bg-[#F5F6FC]"
                              >
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-bold text-[#14141A]">
                                    {proj.title}
                                  </p>
                                  <FolderGit2 className="h-3.5 w-3.5 text-[#374BFF]" />
                                </div>
                                {proj.desc && (
                                  <p className="text-[10px] text-[#2B2B38] leading-snug mt-1">
                                    {proj.desc}
                                  </p>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="p-2.5 rounded-xl border border-black/10 bg-[#F5F6FC]">
                              <p className="text-xs font-bold text-[#14141A]">
                                Active Deployments
                              </p>
                              <p className="text-[10px] text-[#2B2B38]">
                                Custom client and studio projects in development.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-black/10 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFlip(member.id);
                          }}
                          className="text-[11px] text-[#374BFF] font-bold flex items-center gap-1 hover:underline cursor-pointer"
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

        {/* Employees Section: Hidden while empty, appears after adding one, hides again after delete */}
        {employeeList && employeeList.length > 0 && (
          <div id="employees-section" className="mt-20 pt-12 border-t border-black/10">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-[#374BFF] font-heading">
                Studio Associates & Engineers
              </span>
              <h3 className="mt-2 font-heading text-2xl sm:text-4xl font-black tracking-tight text-[#14141A]">
                Engineering Associates
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {employeeList.map((emp, index) => (
                <Reveal key={emp.id} direction="up" delay={index * 0.08}>
                  <div className="rounded-2xl glass-card border border-black/10 p-6 flex items-center gap-4 hover:border-[#374BFF] transition-all">
                    <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-black/5 border border-[#374BFF]/20">
                      <Image
                        src={
                          emp.avatarUrl ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(emp.name)}`
                        }
                        alt={emp.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-heading text-base font-bold text-[#14141A] truncate">
                        {emp.name}
                      </h4>
                      <p className="text-xs font-semibold text-[#374BFF] truncate">
                        {emp.role}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {emp.skills?.slice(0, 2).map((skill) => (
                          <span
                            key={skill}
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#F5F6FC] text-[#14141A]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
