"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { DUR, EASE_OUT, VIEWPORT_ONCE } from "./tokens";

export interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  blur?: boolean;
  once?: boolean;
  className?: string;
  as?: "div" | "section" | "article" | "li" | "header";
  id?: string;
}

const TAGS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  li: motion.li,
  header: motion.header,
} as const;

export function Reveal({
  children,
  delay = 0,
  y = 20,
  blur = false,
  once = true,
  className,
  as = "div",
  id,
}: RevealProps) {
  const reduce = useReducedMotion();
  const Tag = TAGS[as];
  const viewport = { once, margin: VIEWPORT_ONCE.margin };

  if (reduce) {
    return (
      <Tag
        id={id}
        className={className}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={viewport}
        transition={{ duration: DUR.fast }}
      >
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      id={id}
      className={className}
      initial={{ opacity: 0, y, ...(blur ? { filter: "blur(10px)" } : {}) }}
      whileInView={{ opacity: 1, y: 0, ...(blur ? { filter: "blur(0px)" } : {}) }}
      viewport={viewport}
      transition={{ duration: DUR.base, delay, ease: EASE_OUT }}
    >
      {children}
    </Tag>
  );
}
