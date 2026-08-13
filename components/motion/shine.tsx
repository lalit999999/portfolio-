"use client";

import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "./tokens";

export interface ShineProps {
  className?: string;
  duration?: number;
}

// Pure CSS sweep driven by the parent's :hover — cheaper than a JS-driven
// animation for something this simple. Parent needs `relative overflow-hidden group`.
export function Shine({ className, duration = 700 }: ShineProps) {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-primary/14 to-transparent opacity-0 transition-[transform,opacity] group-hover:translate-x-full group-hover:opacity-100",
        className,
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: `cubic-bezier(${EASE_OUT.join(",")})`,
      }}
    />
  );
}
