"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, Check, Settings2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  functional: boolean;
  timestamp: number;
  expiresAt: number;
  version: string;
}

const COOKIE_NAME = "tc_consent";
const STORAGE_KEY = "tc_consent";
const CONSENT_VERSION = "1.0";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const ONE_YEAR_SECS = 365 * 24 * 60 * 60;

export function openCookieSettings() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tc:open-cookie-settings"));
  }
}

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Preference state
  const [analytics, setAnalytics] = useState(true);
  const [functional, setFunctional] = useState(true);

  // Helper to read cookie by name
  const getCookieValue = useCallback((name: string): string | null => {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
  }, []);

  // Helper to save preferences in both cookie (12-month) and localStorage
  const savePreferences = useCallback((prefs: { analytics: boolean; functional: boolean }) => {
    const consentData: CookiePreferences = {
      essential: true,
      analytics: prefs.analytics,
      functional: prefs.functional,
      timestamp: Date.now(),
      expiresAt: Date.now() + ONE_YEAR_MS,
      version: CONSENT_VERSION,
    };

    const serialized = JSON.stringify(consentData);

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch {
      // localStorage may fail in restricted/private modes
    }

    // Save to cookie (12-month max-age)
    if (typeof document !== "undefined") {
      const isSecure = window.location.protocol === "https:";
      const cookieStr = `${COOKIE_NAME}=${encodeURIComponent(serialized)}; max-age=${ONE_YEAR_SECS}; path=/; SameSite=Lax${
        isSecure ? "; Secure" : ""
      }`;
      document.cookie = cookieStr;
    }

    setIsOpen(false);
    setIsCustomizing(false);
  }, []);

  // Check consent on mount
  useEffect(() => {
    setMounted(true);

    let hasConsent = false;
    let savedPrefs: CookiePreferences | null = null;

    // 1. Try reading from cookie
    try {
      const rawCookie = getCookieValue(COOKIE_NAME);
      if (rawCookie) {
        const parsed = JSON.parse(rawCookie);
        if (parsed && parsed.expiresAt > Date.now()) {
          hasConsent = true;
          savedPrefs = parsed;
        }
      }
    } catch {
      // ignore JSON parse errors
    }

    // 2. Fallback to localStorage if cookie not found
    if (!hasConsent) {
      try {
        const rawLocal = localStorage.getItem(STORAGE_KEY);
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          if (parsed && parsed.expiresAt > Date.now()) {
            hasConsent = true;
            savedPrefs = parsed;
          }
        }
      } catch {
        // ignore
      }
    }

    if (savedPrefs) {
      setAnalytics(Boolean(savedPrefs.analytics));
      setFunctional(Boolean(savedPrefs.functional));
    }

    // If no valid consent found, reveal the banner
    if (!hasConsent) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [getCookieValue]);

  // Listen for reopen events from footer or other triggers
  useEffect(() => {
    const handleReopen = () => {
      // reload saved preferences if available
      try {
        const rawCookie = getCookieValue(COOKIE_NAME);
        const raw = rawCookie || localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setAnalytics(Boolean(parsed.analytics));
          setFunctional(Boolean(parsed.functional));
        }
      } catch {
        // ignore
      }
      setIsCustomizing(true);
      setIsOpen(true);
    };

    window.addEventListener("tc:open-cookie-settings", handleReopen);
    return () => {
      window.removeEventListener("tc:open-cookie-settings", handleReopen);
    };
  }, [getCookieValue]);

  const handleAcceptAll = () => {
    savePreferences({ analytics: true, functional: true });
  };

  const handleRejectAll = () => {
    savePreferences({ analytics: false, functional: false });
  };

  const handleSaveCustom = () => {
    savePreferences({ analytics, functional });
  };

  if (!mounted || !isOpen) return null;

  return (
    <aside
      aria-label="Cookie Consent Banner"
      role="region"
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="rounded-3xl bg-white/95 backdrop-blur-md border border-[#14141A]/10 p-5 sm:p-6 shadow-2xl shadow-black/15 text-[#14141A]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-[#374BFF]/10 text-[#374BFF] flex items-center justify-center shrink-0">
              <Cookie className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-sm sm:text-base font-bold text-[#14141A] leading-tight">
                {isCustomizing ? "Cookie Preferences" : "We Value Your Privacy"}
              </h2>
              <span className="text-[11px] font-semibold text-[#374BFF]">TrioCore Trust & Transparency</span>
            </div>
          </div>
          {isCustomizing && (
            <button
              onClick={() => setIsCustomizing(false)}
              className="text-[#2B2B38] hover:text-[#14141A] p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Close preferences"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Description or Preferences */}
        {!isCustomizing ? (
          <div className="mt-3.5 space-y-3">
            <p className="text-xs sm:text-[13px] text-[#2B2B38] leading-relaxed">
              We use essential cookies for secure authentication and performance, plus optional analytics to improve your experience. You can customize your preferences anytime.
            </p>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-[#2B2B38]">
              <Link href="/cookie-policy" className="underline hover:text-[#374BFF] transition-colors">
                Cookie Policy
              </Link>
              <span>•</span>
              <Link href="/privacy-policy" className="underline hover:text-[#374BFF] transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {/* Essential */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F5F6FC] border border-black/5">
              <div className="pr-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#14141A]">Essential Cookies</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase">
                    Required
                  </span>
                </div>
                <p className="text-[11px] text-[#2B2B38] mt-0.5">
                  Authentication, security tokens, and foundational platform features.
                </p>
              </div>
              <div className="shrink-0 h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <Check className="h-3 w-3 stroke-[3]" />
              </div>
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F5F6FC] border border-black/5">
              <div className="pr-3">
                <span className="text-xs font-bold text-[#14141A]">Analytics & Insights</span>
                <p className="text-[11px] text-[#2B2B38] mt-0.5">
                  Anonymous usage metrics to help us optimize page load speed and design.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#374BFF]"></div>
              </label>
            </div>

            {/* Functional */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F5F6FC] border border-black/5">
              <div className="pr-3">
                <span className="text-xs font-bold text-[#14141A]">Functional & Personalization</span>
                <p className="text-[11px] text-[#2B2B38] mt-0.5">
                  Remembers your currency format and interface state preferences.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={functional}
                  onChange={(e) => setFunctional(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#374BFF]"></div>
              </label>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 pt-2 border-t border-black/5">
          {!isCustomizing ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsCustomizing(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#2B2B38] hover:text-[#374BFF] hover:bg-[#374BFF]/5 transition-all cursor-pointer"
              >
                <Settings2 className="h-3.5 w-3.5" />
                <span>Customize</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRejectAll}
                  className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border border-black/10 bg-white text-[#14141A] text-xs font-bold hover:bg-[#F5F6FC] hover:border-black/20 transition-all cursor-pointer shadow-xs"
                >
                  Reject Non-Essential
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#2A3DE0] transition-all cursor-pointer shadow-xs hover:shadow-sm"
                >
                  Accept All
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCustomizing(false)}
                className="px-3.5 py-2 rounded-xl border border-black/10 bg-white text-[#14141A] text-xs font-bold hover:bg-[#F5F6FC] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCustom}
                className="px-4 py-2 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#2A3DE0] transition-all cursor-pointer shadow-xs"
              >
                Save Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
