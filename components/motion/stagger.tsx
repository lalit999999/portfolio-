"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { DUR, EASE_OUT, VIEWPORT_ONCE } from "./tokens";

export interface StaggerProps {
  children: ReactNode;
  gap?: number;
  delay?: number;
  className?: string;
  as?: "div" | "ul" | "section";
}

const CONTAINER_TAGS = { div: motion.div, ul: motion.ul, section: motion.section } as const;

export function Stagger({ children, gap = 0.08, delay = 0, className, as = "div" }: StaggerProps) {
  const reduce = useReducedMotion();
  const Tag = CONTAINER_TAGS[as];

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_ONCE}
      variants={{
        hidden: {},
        visible: reduce ? {} : { transition: { staggerChildren: gap, delayChildren: delay } },
      }}
    >
      {children}
    </Tag>
  );
}

export interface StaggerItemProps {
  children: ReactNode;
  y?: number;
  className?: string;
  as?: "div" | "li";
}

const ITEM_TAGS = { div: motion.div, li: motion.li } as const;

// Consumes the "hidden"/"visible" variants set by the nearest ancestor Stagger.
// Variant propagation works through any number of plain (non-motion) wrapper
// elements in between, so StaggerItem does not need to be a direct child.
export function StaggerItem({ children, y = 16, className, as = "div" }: StaggerItemProps) {
  const reduce = useReducedMotion();
  const Tag = ITEM_TAGS[as];

  return (
    <Tag
      className={className}
      variants={
        reduce
          ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
          : {
              hidden: { opacity: 0, y },
              visible: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE_OUT } },
            }
      }
    >
      {children}
    </Tag>
  );
}
