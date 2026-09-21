"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowUpRight, MessageSquarePlus } from "lucide-react";
import { Logo } from "./logo";
import { buttonVariants } from "@/components/ui/button";
import { FeedbackModal } from "./feedback-modal";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

const navLinks = [
  { name: "About", href: "#about" },
  { name: "Team", href: "#team" },
  { name: "Services", href: "#services" },
  { name: "Pricing", href: "#pricing" },
  { name: "Work", href: "#showcase" },
  { name: "FAQ", href: "#faq" },
  { name: "Contact", href: "#contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = navLinks.map((link) => link.href.substring(1));
      const scrollPosition = window.scrollY + 120;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300 w-full",
          isScrolled
            ? "bg-white/95 backdrop-blur-md border-b border-[#14141A]/10 shadow-xs py-2.5 sm:py-3"
            : "bg-transparent py-4 sm:py-5"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Logo size="md" />

            {/* Desktop Navigation: visible at lg (>=1024px) */}
            <nav className="hidden lg:flex items-center gap-1 rounded-full border border-[#14141A]/10 bg-white/95 px-3 py-1.5 shadow-xs">
              {navLinks.map((link) => {
                const isActive = activeSection === link.href.substring(1);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "relative px-3.5 py-1 text-xs font-bold transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#374BFF]",
                      isActive
                        ? "text-[#374BFF]"
                        : "text-[#14141A] hover:text-[#374BFF]"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="activeNavTab"
                        className="absolute inset-0 rounded-full bg-[#374BFF]/10 -z-10"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Feedback Button: Desktop */}
              <button
                type="button"
                onClick={() => setFeedbackOpen(true)}
                className="hidden sm:inline-flex items-center justify-center h-9 w-9 rounded-full border border-[#14141A]/10 bg-white text-[#14141A] hover:text-[#374BFF] hover:border-[#374BFF] transition-all cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#374BFF]"
                aria-label="Send Feedback or Report Bug"
                title="Send Feedback or Report Bug"
              >
                <MessageSquarePlus className="h-4 w-4" />
              </button>

              <div className="hidden sm:block">
                <Link
                  href="#contact"
                  className={buttonVariants({
                    variant: "primary",
                    size: "sm",
                    className: "rounded-full px-5 py-2 text-xs sm:text-sm font-bold shadow-xs",
                  })}
                >
                  <span>Get a Quote</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>

              {/* Hamburger Button: visible below lg (<1024px), >=44px tap target */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex lg:hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#14141A]/10 bg-white text-[#14141A] shadow-xs hover:border-[#374BFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#374BFF]"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-20 z-50 lg:hidden rounded-2xl p-5 sm:p-6 shadow-xl border border-[#14141A]/10 overflow-hidden bg-white/98 backdrop-blur-md"
          >
            <div className="flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center min-h-[44px] px-4 rounded-xl text-sm font-bold text-[#14141A] hover:bg-[#374BFF]/10 hover:text-[#374BFF] transition-colors"
                >
                  {link.name}
                </Link>
              ))}

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setFeedbackOpen(true);
                }}
                className="flex items-center gap-2 min-h-[44px] px-4 rounded-xl text-sm font-bold text-[#14141A] hover:bg-[#374BFF]/10 hover:text-[#374BFF] transition-colors w-full text-left cursor-pointer"
              >
                <MessageSquarePlus className="h-4 w-4 text-[#374BFF]" />
                <span>Feedback & Bug Report</span>
              </button>

              <div className="pt-3 border-t border-[#14141A]/10 mt-1">
                <Link
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className={buttonVariants({
                    variant: "primary",
                    size: "md",
                    className: "w-full justify-center text-sm font-bold shadow-xs",
                  })}
                >
                  <span>Get a Free Quote</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
    </>
  );
}
