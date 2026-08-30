"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
  once?: boolean;
}

export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 0.45,
  once = true,
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion();

  const getInitialPosition = () => {
    if (shouldReduceMotion) return { opacity: 1, x: 0, y: 0 };
    switch (direction) {
      case "up":
        return { opacity: 0, y: 16, x: 0 };
      case "down":
        return { opacity: 0, y: -16, x: 0 };
      case "left":
        return { opacity: 0, x: 16, y: 0 };
      case "right":
        return { opacity: 0, x: -16, y: 0 };
      case "none":
      default:
        return { opacity: 0, x: 0, y: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitialPosition()}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount: "some" }}
      transition={{
        duration: shouldReduceMotion ? 0.05 : duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={cn("w-full opacity-100", className)}
    >
      {children}
    </motion.div>
  );
}
