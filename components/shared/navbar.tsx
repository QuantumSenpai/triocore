"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Logo } from "./logo";
import { MagneticButton } from "@/components/motion/magnetic-button";
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
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300 px-4 sm:px-6 lg:px-8",
          isScrolled ? "py-2.5 sm:py-3" : "py-4 sm:py-5"
        )}
      >
        <div className="mx-auto max-w-7xl">
          <div
            className={cn(
              "flex items-center justify-between rounded-2xl px-4 py-2.5 sm:px-6 transition-all duration-300",
              isScrolled
                ? "glass-panel shadow-lg shadow-black/5"
                : "bg-transparent"
            )}
          >
            <Logo size="md" />

            {/* Desktop Navigation: visible at lg (>=1024px) */}
            <nav className="hidden lg:flex items-center gap-1 rounded-full border border-[#14141A] bg-white/95 px-3 py-1.5 shadow-sm">
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
                        className="absolute inset-0 rounded-full bg-[#374BFF] -z-10"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <MagneticButton strength={0.25}>
                  <Link
                    href="#contact"
                    className="interactive-lift inline-flex items-center gap-1.5 rounded-full bg-[#374BFF] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#374BFF] hover:bg-[#14141A] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#374BFF]"
                  >
                    <span>Get a Quote</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </MagneticButton>
              </div>

              {/* Hamburger Button: visible below lg (<1024px), >=44px tap target */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex lg:hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#14141A] bg-white text-[#14141A] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#374BFF]"
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
            className="fixed inset-x-4 top-20 z-50 lg:hidden rounded-2xl glass-panel p-5 sm:p-6 shadow-2xl border border-[#14141A] overflow-hidden bg-white/98"
          >
            <div className="flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center min-h-[44px] px-4 rounded-xl text-sm font-bold text-[#14141A] hover:bg-[#374BFF] hover:text-[#374BFF] transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-3 border-t border-[#14141A] mt-1">
                <Link
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="interactive-lift flex items-center justify-center gap-2 w-full min-h-[44px] rounded-xl bg-[#374BFF] py-3 text-sm font-bold text-white shadow-md shadow-[#374BFF]"
                >
                  <span>Get a Free Quote</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
