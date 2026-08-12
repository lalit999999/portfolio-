"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { cn } from "@/lib/utils";
import { SPRING_SNAPPY } from "./tokens";

export interface ScrollProgressProps {
  className?: string;
  height?: number;
}

// Scroll position is information, not decoration, so this keeps tracking
// under reduced motion — it just drops the spring smoothing.
export function ScrollProgress({ className, height = 2 }: ScrollProgressProps) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, SPRING_SNAPPY);

  return (
    <motion.div
      aria-hidden
      className={cn(
        "absolute inset-x-0 bottom-0 origin-left bg-gradient-to-r from-primary via-primary/80 to-primary/40",
        className,
      )}
      style={{ height, scaleX: reduce ? scrollYProgress : smoothProgress }}
    />
  );
}
