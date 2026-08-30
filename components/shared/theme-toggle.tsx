"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("w-9 h-9 rounded-full border border-[#14141A]/15 dark:border-[#374BFF]/35 bg-white dark:bg-[#1C1C26]", className)} />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-full border border-[#14141A]/15 dark:border-[#374BFF]/35 bg-white dark:bg-[#1C1C26] text-[#14141A] dark:text-[#F5F6FC] shadow-sm transition-all duration-200 hover:scale-110 hover:border-[#374BFF] hover:text-[#374BFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#374BFF]",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Sun className={cn("h-4 w-4 transition-all duration-200", isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100 text-[#14141A]")} />
      <Moon className={cn("absolute h-4 w-4 transition-all duration-200", isDark ? "rotate-0 scale-100 opacity-100 text-[#CFFF04]" : "-rotate-90 scale-0 opacity-0")} />
    </button>
  );
}
