"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useCoarsePointer } from "@/hooks/use-coarse-pointer";
import { SPRING_MAGNETIC } from "./tokens";

export interface MagneticProps {
  children: ReactNode;
  strength?: number;
  radius?: number;
  className?: string;
}

// Listener lives on window (not the element) so the pull begins as the
// cursor approaches, not only once it's already over the element.
export function Magnetic({ children, strength = 8, radius = 100, className }: MagneticProps) {
  const reduce = useReducedMotion();
  const coarse = useCoarsePointer();
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SPRING_MAGNETIC);
  const springY = useSpring(y, SPRING_MAGNETIC);

  useEffect(() => {
    if (reduce || coarse) return;

    function handlePointerMove(e: PointerEvent) {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const distance = Math.hypot(dx, dy);

      if (distance < radius) {
        const pull = (1 - distance / radius) * strength;
        const angle = Math.atan2(dy, dx);
        x.set(Math.cos(angle) * pull);
        y.set(Math.sin(angle) * pull);
      } else {
        x.set(0);
        y.set(0);
      }
    }

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [reduce, coarse, radius, strength, x, y]);

  if (reduce || coarse) {
    return (
      <span ref={ref} className={className} style={{ display: "inline-block" }}>
        {children}
      </span>
    );
  }

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ display: "inline-block", x: springX, y: springY }}
    >
      {children}
    </motion.span>
  );
}
