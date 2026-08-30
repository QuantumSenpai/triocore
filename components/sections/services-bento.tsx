"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Globe, 
  QrCode, 
  CreditCard, 
  Layers, 
  UserCheck, 
  Wrench, 
  ArrowUpRight, 
  Zap 
} from "lucide-react";
import { TiltCard } from "@/components/motion/tilt-card";
import { Reveal } from "@/components/motion/reveal";
import { services as staticServices, ServiceItem } from "@/lib/data/site-content";

const iconMap: Record<string, typeof Globe> = {
  Globe,
  QrCode,
  CreditCard,
  Layers,
  UserCheck,
  Wrench,
};

export function ServicesBentoSection() {
  const [serviceList, setServiceList] = useState<ServiceItem[]>(staticServices);

  useEffect(() => {
    fetch("/api/admin/services")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.services && data.services.length > 0) {
          setServiceList(data.services);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="services" className="relative py-24 sm:py-32 px-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <Reveal direction="down">
            <span className="text-xs font-bold uppercase tracking-widest text-[#374BFF] dark:text-[#CFFF04] font-heading">
              What We Build
            </span>
          </Reveal>
          <Reveal direction="up" delay={0.08}>
            <h2 className="mt-3 font-heading text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-[#14141A] dark:text-[#F5F6FC]">
              Bespoke Digital Solutions <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#374BFF] via-[#374BFF] to-[#CFFF04]">
                Crafted For High Performance
              </span>
            </h2>
          </Reveal>
          <Reveal direction="up" delay={0.16}>
            <p className="mt-4 text-sm sm:text-base md:text-lg text-[#2B2B38] dark:text-[#F5F6FC]/85 font-sans font-medium">
              From responsive business websites and contactless QR interfaces to complex SaaS backends, our systems are engineered for speed, clean architecture, and conversion.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {serviceList.map((service, index) => {
            const Icon = iconMap[service.iconName || "Globe"] || Globe;
            return (
              <Reveal key={service.id} direction="up" delay={index * 0.06} className={service.colSpan || "lg:col-span-1"}>
                <TiltCard glowColor="rgba(55, 75, 255, 0.2)" className="h-full p-6 sm:p-8 flex flex-col justify-between group">
                  <div className="space-y-5 sm:space-y-6">
                    <div className="flex items-center justify-between">
                      <div className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${service.accent || "from-[#374BFF] to-[#14141A]"} text-white shadow-md shadow-black/15 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#FFFFFF]" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-[#14141A]/15 dark:border-[#374BFF]/40 bg-[#14141A]/8 dark:bg-[#374BFF]/20 text-[#14141A] dark:text-[#CFFF04] shadow-sm">
                        {service.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#14141A] dark:text-[#F5F6FC] group-hover:text-[#374BFF] transition-colors">
                        {service.title}
                      </h3>
                      <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-[#2B2B38] dark:text-[#D5D7E6] leading-relaxed font-sans font-medium">
                        {service.desc}
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-[#14141A]/10 dark:border-white/10">
                      {(service.features || []).map((feat) => (
                        <div key={feat} className="flex items-center gap-2.5 text-xs sm:text-sm text-[#14141A] dark:text-[#F5F6FC] font-semibold">
                          <Zap className="h-4 w-4 text-[#374BFF] dark:text-[#CFFF04] shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-5 sm:pt-6 mt-5 sm:mt-6 border-t border-[#14141A]/10 dark:border-white/10 flex items-center justify-between">
                    <Link
                      href="#pricing"
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#374BFF] dark:text-[#CFFF04] group-hover:underline"
                    >
                      <span>View Pricing</span>
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                    <span className="text-[10px] text-[#14141A]/70 dark:text-[#F5F6FC]/60 font-bold uppercase tracking-wider">
                      TrioCore Guarantee
                    </span>
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
