"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

export interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export function CountUp({ to, from = 0, duration = 1.2, suffix = "", className }: CountUpProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const motionValue = useMotionValue(from);
  const rounded = useTransform(motionValue, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    if (!ref.current) return;

    if (reduce) {
      ref.current.textContent = `${to.toLocaleString()}${suffix}`;
      return;
    }

    if (!isInView) return;

    const unsubscribe = rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = `${v}${suffix}`;
    });
    const controls = animate(motionValue, to, { duration, ease: "easeOut" });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [isInView, reduce, to, duration, motionValue, rounded, suffix]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {reduce ? `${to.toLocaleString()}${suffix}` : `${Math.round(from).toLocaleString()}${suffix}`}
    </span>
  );
}
