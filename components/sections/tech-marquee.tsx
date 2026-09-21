"use client";

import { Reveal } from "@/components/motion/reveal";
import { techArsenal } from "@/lib/data/site-content";

export function TechMarqueeSection() {
 return (
 <section className="relative py-20 sm:py-24 overflow-hidden select-none">
 <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 mb-10 sm:mb-12 text-center">
 <Reveal direction="down">
 <span className="text-xs font-bold uppercase tracking-widest text-[#374BFF] font-heading">
 Technologies & Tools
 </span>
 <h2 className="mt-2 font-heading text-2xl sm:text-4xl font-black tracking-tighter text-[#14141A]">
 Our Engineering Arsenal
 </h2>
 </Reveal>
 </div>

 <div className="space-y-3.5 sm:space-y-4">
 <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
 <div className="animate-marquee flex items-center gap-3 sm:gap-3.5 shrink-0">
 {techArsenal.row1.concat(techArsenal.row1).map((tech, i) => (
 <div
 key={`${tech}-${i}`}
 className="flex items-center gap-2 rounded-xl border border-[#14141A] bg-white px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-[#14141A] shadow-sm transition-transform interactive-lift hover:border-[#374BFF]"
 >
 <span className="h-1.5 w-1.5 rounded-full bg-[#374BFF]" />
 <span>{tech}</span>
 </div>
 ))}
 </div>
 </div>

 <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
 <div className="animate-marquee-reverse flex items-center gap-3 sm:gap-3.5 shrink-0">
 {techArsenal.row2.concat(techArsenal.row2).map((tech, i) => (
 <div
 key={`${tech}-${i}`}
 className="flex items-center gap-2 rounded-xl border border-[#14141A] bg-white px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-[#14141A] shadow-sm transition-transform interactive-lift hover:border-[#374BFF]"
 >
 <span className="h-1.5 w-1.5 rounded-full bg-[#CFFF04]" />
 <span>{tech}</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </section>
 );
}
