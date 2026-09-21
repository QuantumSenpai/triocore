"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonVariantProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const baseStyles =
  "inline-flex items-center justify-center font-bold select-none cursor-pointer transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#374BFF] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none group";

const variantStyles: Record<NonNullable<ButtonVariantProps["variant"]>, string> = {
  primary:
    "bg-[#374BFF] text-white border border-[#374BFF] shadow-xs hover:bg-[#2A3DE0] hover:border-[#2A3DE0] hover:shadow-sm active:translate-y-0 active:scale-[0.98]",
  secondary:
    "bg-[#14141A] text-white border border-[#14141A] shadow-xs hover:bg-[#2B2B38] hover:border-[#2B2B38] hover:shadow-sm active:translate-y-0 active:scale-[0.98]",
  outline:
    "bg-white text-[#14141A] border border-[#14141A]/15 shadow-xs hover:border-[#374BFF] hover:text-[#374BFF] hover:bg-[#374BFF]/5 hover:shadow-sm active:translate-y-0 active:scale-[0.98]",
  ghost:
    "bg-transparent text-[#14141A] border border-transparent hover:bg-[#14141A]/5 hover:text-[#374BFF] active:scale-[0.98]",
  danger:
    "bg-red-600 text-white border border-red-600 shadow-xs hover:bg-red-700 hover:border-red-700 hover:shadow-sm active:translate-y-0 active:scale-[0.98]",
};

const sizeStyles: Record<NonNullable<ButtonVariantProps["size"]>, string> = {
  sm: "text-xs px-3.5 py-1.5 rounded-xl gap-1.5 min-h-[36px]",
  md: "text-xs sm:text-sm px-5 py-2.5 rounded-2xl gap-2 min-h-[44px]",
  lg: "text-sm sm:text-base px-7 py-3.5 rounded-2xl gap-2.5 min-h-[48px]",
};

const motionStyles =
  "hover:-translate-y-[1px] [@media(hover:none)]:hover:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none";

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: ButtonVariantProps = {}) {
  return cn(baseStyles, variantStyles[variant], sizeStyles[size], motionStyles, className);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariantProps {
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      children,
      icon,
      iconPosition = "right",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={buttonVariants({ variant, size, className })}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin shrink-0 text-current" />
        )}
        {!loading && icon && iconPosition === "left" && (
          <span className="transition-transform duration-150 ease-out group-hover:-translate-x-0.5 motion-reduce:transform-none">
            {icon}
          </span>
        )}
        <span className={cn(loading && "opacity-80")}>{children}</span>
        {!loading && icon && iconPosition === "right" && (
          <span className="transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transform-none">
            {icon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
