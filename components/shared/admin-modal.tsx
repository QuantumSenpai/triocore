"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
  bodyClassName?: string;
  footerClassName?: string;
  headerClassName?: string;
  closeOnBackdropClick?: boolean;
}

export function AdminModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = "md",
  onSubmit,
  className = "",
  bodyClassName = "",
  footerClassName = "",
  headerClassName = "",
  closeOnBackdropClick = true,
}: AdminModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  }[maxWidth] || "max-w-md";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-[2px] animate-in fade-in duration-150"
      onClick={closeOnBackdropClick ? onClose : undefined}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-3xl w-full ${maxWidthClasses} border border-black/10 shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 ${className}`}
      >
        {/* Header - Fixed & Sticky at top */}
        <div
          className={`flex items-center justify-between px-6 py-4 sm:px-8 sm:py-5 border-b border-black/10 shrink-0 bg-white ${headerClassName}`}
        >
          <div>
            <h3 className="font-heading text-lg font-bold text-[#14141A]">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-[#2B2B38] mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#2B2B38] hover:text-[#14141A] p-1.5 rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content - Form or Div */}
        {onSubmit ? (
          <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Scrollable Form Body */}
            <div
              className={`flex-1 min-h-0 overflow-y-auto px-6 py-5 sm:px-8 space-y-3.5 ${bodyClassName}`}
            >
              {children}
            </div>

            {/* Footer - Fixed & Sticky at bottom */}
            {footer && (
              <div
                className={`px-6 py-4 sm:px-8 border-t border-black/10 shrink-0 bg-white ${footerClassName}`}
              >
                {footer}
              </div>
            )}
          </form>
        ) : (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Scrollable Body */}
            <div
              className={`flex-1 min-h-0 overflow-y-auto px-6 py-5 sm:px-8 space-y-3.5 ${bodyClassName}`}
            >
              {children}
            </div>

            {/* Footer - Fixed & Sticky at bottom */}
            {footer && (
              <div
                className={`px-6 py-4 sm:px-8 border-t border-black/10 shrink-0 bg-white ${footerClassName}`}
              >
                {footer}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
