"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function AnimatedGridBg({
  className,
  showGrid = true,
  showOrbs = true,
}: {
  className?: string;
  showGrid?: boolean;
  showOrbs?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const isPointerFine = window.matchMedia("(pointer: fine)").matches;
    const shouldReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isPointerFine || shouldReduceMotion || !containerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafId.current !== null) return;

      rafId.current = requestAnimationFrame(() => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          containerRef.current.style.setProperty("--mouse-x", `${x}px`);
          containerRef.current.style.setProperty("--mouse-y", `${y}px`);
        }
        rafId.current = null;
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none absolute inset-0 overflow-hidden select-none", className)}
      style={
        {
          "--mouse-x": "50%",
          "--mouse-y": "30%",
        } as React.CSSProperties
      }
    >
      {showOrbs && (
        <div className="aurora-bg">
          <div
            className="aurora-blob bg-[#374BFF]"
            style={{
              top: "-8%",
              left: "20%",
              width: "48vw",
              height: "48vw",
              opacity: 0.12,
              animationDuration: "24s",
            }}
          />
          <div
            className="aurora-blob bg-[#374BFF]"
            style={{
              top: "22%",
              right: "15%",
              width: "36vw",
              height: "36vw",
              opacity: 0.08,
              animationDuration: "20s",
              animationDelay: "-6s",
            }}
          />
        </div>
      )}

      {showGrid && (
        <>
          <div
            className="absolute inset-0 opacity-[0.05] animate-grid-drift text-[#14141A]"
            style={{
              backgroundImage: `
                linear-gradient(to right, currentColor 1px, transparent 1px),
                linear-gradient(to bottom, currentColor 1px, transparent 1px)
              `,
              backgroundSize: "3.5rem 3.5rem",
              maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, #000 50%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, #000 50%, transparent 100%)",
            }}
          />

          {/* Faint spotlight on pointer:fine devices only */}
          <div
            className="hidden sm:block absolute inset-0 opacity-[0.05] pointer-events-none text-[#374BFF]"
            style={{
              backgroundImage: `
                linear-gradient(to right, currentColor 1px, transparent 1px),
                linear-gradient(to bottom, currentColor 1px, transparent 1px)
              `,
              backgroundSize: "3.5rem 3.5rem",
              maskImage: "radial-gradient(380px circle at var(--mouse-x, 50%) var(--mouse-y, 30%), black 0%, transparent 80%)",
              WebkitMaskImage: "radial-gradient(380px circle at var(--mouse-x, 50%) var(--mouse-y, 30%), black 0%, transparent 80%)",
            }}
          />
        </>
      )}
    </div>
  );
}
