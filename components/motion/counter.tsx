"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface CounterProps {
  value?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  staticText?: string;
}

export function Counter({
  value = 0,
  suffix = "",
  prefix = "",
  duration = 2,
  className,
  staticText,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView || staticText) return;

    const start = 0;
    const end = value;
    const totalFrames = Math.round(duration * 60);
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easeOutQuad = 1 - (1 - progress) * (1 - progress);
      const currentCount = Math.round(start + (end - start) * easeOutQuad);

      setCount(currentCount);

      if (frame === totalFrames) {
        clearInterval(counter);
        setCount(end);
      }
    }, 1000 / 60);

    return () => clearInterval(counter);
  }, [isInView, value, duration, staticText]);

  if (staticText) {
    return (
      <span ref={ref} className={cn("tabular-nums", className)}>
        {staticText}
      </span>
    );
  }

  const renderSuffix = () => {
    if (!suffix) return null;
    if (suffix.startsWith("/")) {
      return (
        <span className="inline-flex items-center">
          <span className="mx-1 font-light opacity-80 select-none">/</span>
          <span>{suffix.slice(1)}</span>
        </span>
      );
    }
    return suffix;
  };

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {count}
      {renderSuffix()}
    </span>
  );
}
