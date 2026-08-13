"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { SPRING_SNAPPY } from "@/components/motion/tokens";

export interface NewMessagesPillProps {
  count: number;
  onClick: () => void;
  className?: string;
}

export function NewMessagesPill({ count, onClick, className }: NewMessagesPillProps) {
  const reduce = useReducedMotion();
  if (count <= 0) return null;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.9 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.9 }}
      transition={reduce ? { duration: 0.15 } : SPRING_SNAPPY}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <ArrowDown aria-hidden className="size-3.5" />
      <span aria-live="polite">
        {count} new {count === 1 ? "message" : "messages"}
      </span>
    </motion.button>
  );
}
