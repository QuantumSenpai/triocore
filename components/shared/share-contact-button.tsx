"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { ContactCardModal } from "./contact-card-modal";
import type { CompanyContactInfo } from "@/lib/dal/content";

interface ShareContactButtonProps {
  contactInfo: CompanyContactInfo;
  variant?: "icon" | "button" | "link";
  className?: string;
}

export function ShareContactButton({
  contactInfo,
  variant = "button",
  className = "",
}: ShareContactButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {variant === "icon" && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`flex h-10 w-10 items-center justify-center rounded-xl border border-[#14141A]/10 bg-[#F5F6FC] text-[#14141A] hover:text-[#374BFF] hover:border-[#374BFF] transition-all cursor-pointer shadow-2xs ${className}`}
          aria-label="Share Digital Contact Card"
          title="Share Digital Contact Card"
        >
          <Share2 className="h-4 w-4" />
        </button>
      )}

      {variant === "button" && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#14141A]/10 bg-white text-xs font-bold text-[#14141A] hover:text-[#374BFF] hover:border-[#374BFF] hover:bg-[#F5F6FC] transition-all cursor-pointer shadow-2xs ${className}`}
        >
          <Share2 className="h-3.5 w-3.5 text-[#374BFF]" />
          <span>Share Contact Card</span>
        </button>
      )}

      {variant === "link" && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-1.5 text-xs text-[#14141A] hover:text-[#374BFF] transition-colors cursor-pointer font-medium ${className}`}
        >
          <Share2 className="h-3.5 w-3.5 text-[#374BFF]" />
          <span>Digital Contact Card</span>
        </button>
      )}

      <ContactCardModal
        contactInfo={contactInfo}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
