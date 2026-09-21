import Link from "next/link";
import { Logo } from "./logo";
import { GithubIcon } from "./icons";
import { Mail, MapPin, ArrowUpRight, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/lib/data/site-content";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-[#14141A]/10 bg-white py-12 sm:py-16 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-[#14141A]/10">
          <div className="lg:col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-sm sm:text-base text-[#14141A] max-w-sm font-sans font-medium">
              Think. Build. Scale. We engineer high-impact digital solutions, custom web applications, hardware robotics, and intelligent software for businesses and creators across India.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={siteConfig.github}
                target="_blank"
                rel="noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#14141A]/10 bg-[#F5F6FC] text-[#14141A] hover:text-[#374BFF] hover:border-[#374BFF] transition-all"
                aria-label="TrioCore GitHub"
              >
                <GithubIcon className="h-4 w-4" />
              </a>
              <a
                href={`mailto:${siteConfig.email}`}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#14141A]/10 bg-[#F5F6FC] text-[#14141A] hover:text-[#374BFF] hover:border-[#374BFF] transition-all"
                aria-label="Email TrioCore"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#14141A] font-heading mb-3 sm:mb-4">
              Navigation
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm font-medium">
              <li>
                <Link href="#about" className="text-[#14141A] hover:text-[#374BFF] transition-colors">
                  About TrioCore
                </Link>
              </li>
              <li>
                <Link href="#team" className="text-[#14141A] hover:text-[#374BFF] transition-colors">
                  Core Team
                </Link>
              </li>
              <li>
                <Link href="#services" className="text-[#14141A] hover:text-[#374BFF] transition-colors">
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-[#14141A] hover:text-[#374BFF] transition-colors">
                  INR Pricing
                </Link>
              </li>
              <li>
                <Link href="#showcase" className="text-[#14141A] hover:text-[#374BFF] transition-colors">
                  Project Showcase
                </Link>
              </li>
              <li>
                <Link href="#faq" className="text-[#14141A] hover:text-[#374BFF] transition-colors">
                  FAQ & Policies
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#14141A] font-heading mb-3 sm:mb-4">
              Legal & Trust
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm font-medium">
              <li>
                <Link href="/privacy-policy" className="text-[#14141A] hover:text-[#374BFF] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-[#14141A] hover:text-[#374BFF] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-[#14141A] hover:text-[#374BFF] transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="#feedback" className="text-[#14141A] hover:text-[#374BFF] transition-colors">
                  Feedback & Bug Reports
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1 text-xs text-[#14141A] hover:text-[#374BFF]"
                >
                  <span>Admin Portal</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#14141A] font-heading mb-3 sm:mb-4">
              Get in Touch
            </h3>
            <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm font-medium">
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="inline-flex items-center gap-2 text-[#14141A] hover:text-[#374BFF] transition-colors truncate max-w-full"
                >
                  <Mail className="h-4 w-4 text-[#374BFF] shrink-0" />
                  <span className="truncate">{siteConfig.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-2 text-[#14141A]">
                <MapPin className="h-4 w-4 text-[#374BFF] shrink-0 mt-0.5" />
                <span>{siteConfig.location}</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-[#374BFF] font-bold">
                <ShieldCheck className="h-4 w-4" />
                <span>Client Code Ownership</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#14141A] font-bold">
          <p>© {currentYear} TrioCore. All rights reserved.</p>
          <p>
            Designed & Engineered in India by <span className="text-[#374BFF]">TrioCore</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
