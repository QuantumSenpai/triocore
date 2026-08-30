import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  iconOnly?: boolean;
}

export function TrioCoreMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 90"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <path
        d="M 10 10 L 90 10 L 82 22 L 56 22 L 56 50 L 40 66 L 40 22 L 18 22 Z"
        fill="currentColor"
      />
      <path
        d="M 41 80 L 56 80 L 88 48 L 73 48 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Logo({ className, showText = true, size = "md", iconOnly = false }: LogoProps) {
  const sizeMap = {
    sm: { icon: "h-8 w-8", text: "text-lg", tag: "text-[8px]" },
    md: { icon: "h-9 w-9", text: "text-xl", tag: "text-[9px]" },
    lg: { icon: "h-11 w-11", text: "text-2xl", tag: "text-[10px]" },
  };

  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-3.5 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#374BFF] rounded-xl transition-transform active:scale-95",
        className
      )}
      aria-label="TrioCore Home"
    >
      <div className="flex items-center justify-center text-[#14141A] dark:text-[#FFFFFF] transition-transform duration-300 group-hover:scale-105">
        <TrioCoreMark className={sizeMap[size].icon} />
      </div>

      {showText && !iconOnly && (
        <div className="flex flex-col">
          <span className={cn("font-heading font-black tracking-[0.18em] leading-none text-[#14141A] dark:text-[#F5F6FC] transition-colors", sizeMap[size].text)}>
            TRIOCORE
          </span>
          <span className={cn("font-sans font-bold tracking-[0.24em] uppercase text-[#14141A] dark:text-[#F5F6FC]/70 mt-1 leading-none", sizeMap[size].tag)}>
            BUILDING DIGITAL ESSENCE
          </span>
        </div>
      )}
    </Link>
  );
}
