"use client";

import { useState, useEffect } from "react";
import { Mail, Globe, Share2, Copy, Check, X, Sparkles } from "lucide-react";
import { TrioCoreMark } from "./logo";
import { toast } from "sonner";
import type { CompanyContactInfo } from "@/lib/dal/content";

interface ContactCardModalProps {
  contactInfo: CompanyContactInfo;
  isOpen: boolean;
  onClose: () => void;
}

export function ContactCardModal({ contactInfo, isOpen, onClose }: ContactCardModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shareText = `${contactInfo.companyName} — Building Digital Essence\nEmail: ${contactInfo.email}\nWebsite: ${contactInfo.url}`;

  const copyToClipboard = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shareText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      toast.success("Contact info copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Unable to copy to clipboard");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: contactInfo.companyName,
      text: shareText,
      url: contactInfo.url,
    };

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
        return;
      } catch (err: any) {
        if (err.name === "AbortError") {
          return;
        }
      }
    }

    // Desktop / Unsupported fallback
    await copyToClipboard();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-card-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl bg-white border border-[#14141A]/10 p-6 sm:p-7 shadow-xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#14141A]/50 hover:text-[#14141A] hover:bg-[#F5F6FC] transition-colors cursor-pointer"
          aria-label="Close digital contact card"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header / Identity Card */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#374BFF]/10 text-[#374BFF] border border-[#374BFF]/20 shadow-xs mb-3.5">
            <TrioCoreMark className="h-9 w-9" />
          </div>

          <div className="flex items-center gap-1.5">
            <h3 id="contact-card-title" className="font-heading font-black text-2xl tracking-[0.16em] text-[#14141A]">
              {contactInfo.companyName.toUpperCase()}
            </h3>
            <Sparkles className="h-3.5 w-3.5 text-[#374BFF]" />
          </div>
          <span className="text-[10px] font-sans font-bold tracking-[0.24em] uppercase text-[#14141A]/60 mt-1">
            BUILDING DIGITAL ESSENCE
          </span>
          <p className="text-xs text-[#14141A]/70 mt-2 font-medium">
            Digital solutions studio founded by CSE innovators.
          </p>
        </div>

        {/* Contact Details List */}
        <div className="space-y-2.5 rounded-2xl bg-[#F5F6FC] p-4 border border-[#14141A]/5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold text-[#14141A]/50 uppercase tracking-wider">Email</span>
            <a
              href={`mailto:${contactInfo.email}`}
              className="font-mono font-semibold text-[#14141A] hover:text-[#374BFF] transition-colors inline-flex items-center gap-1.5"
            >
              <Mail className="h-3.5 w-3.5 text-[#374BFF]" />
              <span>{contactInfo.email}</span>
            </a>
          </div>

          <div className="border-t border-[#14141A]/5" />

          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold text-[#14141A]/50 uppercase tracking-wider">Website</span>
            <a
              href={contactInfo.url}
              target="_blank"
              rel="noreferrer"
              className="font-mono font-semibold text-[#374BFF] hover:underline inline-flex items-center gap-1.5"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{contactInfo.website}</span>
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            id="share-card-action-btn"
            onClick={handleShare}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#374BFF] text-white text-xs font-bold hover:bg-[#14141A] transition-all cursor-pointer shadow-xs active:scale-[0.99]"
          >
            <Share2 className="h-4 w-4" />
            <span>Share Contact Card</span>
          </button>

          <button
            type="button"
            id="copy-card-action-btn"
            onClick={copyToClipboard}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#14141A]/10 bg-white text-[#14141A] text-xs font-bold hover:bg-[#F5F6FC] hover:border-[#374BFF] transition-all cursor-pointer"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-[#14141A]/70" />}
            <span>{copied ? "Copied to Clipboard!" : "Copy Details"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
