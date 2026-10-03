"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CategoryPillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  size?: "sm" | "md" | "lg";
  count?: number | string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
}

const pillSizeStyles = {
  sm: "px-3 py-1.5 rounded-xl text-xs gap-1.5 min-h-[32px]",
  md: "px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm gap-2 min-h-[38px]",
  lg: "px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-sm sm:text-base gap-2.5 min-h-[44px]",
};

export const CategoryPill = forwardRef<HTMLButtonElement, CategoryPillProps>(
  (
    {
      className,
      active = false,
      size = "md",
      count,
      badge,
      icon,
      children,
      disabled = false,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center font-bold transition-all duration-150 ease-out cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#374BFF] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none motion-reduce:transform-none motion-reduce:transition-none",
          pillSizeStyles[size],
          active
            ? "bg-[#374BFF] text-white border border-[#374BFF] shadow-xs hover:bg-[#2A3DE0] hover:border-[#2A3DE0] hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0"
            : "bg-white text-[#2B2B38] border border-black/10 hover:border-[#374BFF] hover:text-[#374BFF] hover:bg-[#374BFF]/5 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
          className
        )}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        <span>{children}</span>
        {count !== undefined && (
          <span
            className={cn(
              "px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold leading-none shrink-0",
              active ? "bg-white/20 text-white" : "bg-black/5 text-[#2B2B38] group-hover:bg-[#374BFF]/10"
            )}
          >
            {count}
          </span>
        )}
        {badge && <span className="shrink-0">{badge}</span>}
      </button>
    );
  }
);

CategoryPill.displayName = "CategoryPill";
