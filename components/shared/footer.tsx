import Link from "next/link";
import { Logo } from "./logo";
import { GithubIcon } from "./icons";
import { Mail, MapPin, ArrowUpRight, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/lib/data/site-content";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-[#14141A]/12 dark:border-[#374BFF]/20 bg-white dark:bg-[#14141A] py-12 sm:py-16 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-[#14141A]/10 dark:border-white/10">
          <div className="lg:col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-sm sm:text-base text-[#14141A]/75 dark:text-[#F5F6FC]/80 max-w-sm font-sans font-medium">
              Think. Build. Scale. We engineer high-impact digital solutions, custom web applications, hardware robotics, and intelligent software for businesses and creators across India.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={siteConfig.github}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#14141A]/15 dark:border-white/15 bg-[#F5F6FC] dark:bg-[#1C1C26] text-[#14141A] dark:text-[#F5F6FC] hover:text-[#374BFF] hover:border-[#374BFF] transition-all"
                aria-label="TrioCore GitHub"
              >
                <GithubIcon className="h-4 w-4" />
              </a>
              <a
                href={`mailto:${siteConfig.email}`}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#14141A]/15 dark:border-white/15 bg-[#F5F6FC] dark:bg-[#1C1C26] text-[#14141A] dark:text-[#F5F6FC] hover:text-[#374BFF] hover:border-[#374BFF] transition-all"
                aria-label="Email TrioCore"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#14141A] dark:text-[#F5F6FC] font-heading mb-3 sm:mb-4">
              Navigation
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm font-medium">
              <li>
                <Link href="#about" className="text-[#14141A]/75 dark:text-[#F5F6FC]/75 hover:text-[#374BFF] transition-colors">
                  About TrioCore
                </Link>
              </li>
              <li>
                <Link href="#team" className="text-[#14141A]/75 dark:text-[#F5F6FC]/75 hover:text-[#374BFF] transition-colors">
                  Core Team
                </Link>
              </li>
              <li>
                <Link href="#services" className="text-[#14141A]/75 dark:text-[#F5F6FC]/75 hover:text-[#374BFF] transition-colors">
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-[#14141A]/75 dark:text-[#F5F6FC]/75 hover:text-[#374BFF] transition-colors">
                  INR Pricing
                </Link>
              </li>
              <li>
                <Link href="#innovation" className="text-[#14141A]/75 dark:text-[#F5F6FC]/75 hover:text-[#374BFF] transition-colors">
                  Innovation Lab
                </Link>
              </li>
              <li>
                <Link href="#showcase" className="text-[#14141A]/75 dark:text-[#F5F6FC]/75 hover:text-[#374BFF] transition-colors">
                  Project Showcase
                </Link>
              </li>
              <li>
                <Link href="#faq" className="text-[#14141A]/75 dark:text-[#F5F6FC]/75 hover:text-[#374BFF] transition-colors">
                  FAQ & Policies
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#14141A] dark:text-[#F5F6FC] font-heading mb-3 sm:mb-4">
              Packages
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm font-medium">
              <li className="text-[#14141A]/75 dark:text-[#F5F6FC]/75">Starter Websites (₹999)</li>
              <li className="text-[#14141A]/75 dark:text-[#F5F6FC]/75">Business Websites (₹1,999)</li>
              <li className="text-[#14141A]/75 dark:text-[#F5F6FC]/75">E-Commerce Systems (₹7,999+)</li>
              <li className="text-[#14141A]/75 dark:text-[#F5F6FC]/75">Custom Web Apps (₹9,999+)</li>
              <li className="text-[#14141A]/75 dark:text-[#F5F6FC]/75">Restaurant QR Menus</li>
              <li className="text-[#14141A]/75 dark:text-[#F5F6FC]/75">Website Care (₹299/mo)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#14141A] dark:text-[#F5F6FC] font-heading mb-3 sm:mb-4">
              Get in Touch
            </h3>
            <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm font-medium">
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="inline-flex items-center gap-2 text-[#14141A]/75 dark:text-[#F5F6FC]/75 hover:text-[#374BFF] transition-colors truncate max-w-full"
                >
                  <Mail className="h-4 w-4 text-[#374BFF] shrink-0" />
                  <span className="truncate">{siteConfig.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-2 text-[#14141A]/75 dark:text-[#F5F6FC]/75">
                <MapPin className="h-4 w-4 text-[#374BFF] shrink-0 mt-0.5" />
                <span>{siteConfig.location}</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-[#374BFF] dark:text-[#CFFF04] font-bold">
                <ShieldCheck className="h-4 w-4" />
                <span>100% Client Code Ownership</span>
              </li>
              <li className="pt-2">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1 text-xs text-[#14141A]/60 dark:text-[#F5F6FC]/60 hover:text-[#374BFF]"
                >
                  <span>Admin Portal</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#14141A]/70 dark:text-[#F5F6FC]/70 font-bold">
          <p>© {currentYear} TrioCore. All rights reserved.</p>
          <p>
            Designed & Engineered in India by <span className="text-[#374BFF]">TrioCore</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
