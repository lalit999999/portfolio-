"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { useCoarsePointer } from "@/hooks/use-coarse-pointer";
import { DUR, EASE_OUT, SPRING_SOFT, VIEWPORT_ONCE } from "./tokens";

export interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  beam?: boolean;
  lift?: boolean;
  delay?: number;
  as?: "div" | "article" | "li";
}

const TAGS = { div: motion.div, article: motion.article, li: motion.li } as const;

let beamStylesInjected = false;

// The conic-gradient border beam needs its angle to animate smoothly, which
// requires the custom property to be typed via @property. app/globals.css is
// Session B's file, so this is injected once at module scope instead.
function ensureBeamStylesheet() {
  if (beamStylesInjected || typeof document === "undefined") return;
  beamStylesInjected = true;
  const style = document.createElement("style");
  style.setAttribute("data-spotlight-beam-styles", "");
  style.textContent = `
@property --spotlight-angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}
@keyframes spotlight-spin {
  to { --spotlight-angle: 360deg; }
}
.spotlight-beam::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: conic-gradient(from var(--spotlight-angle), transparent 0deg, oklch(from var(--color-primary) l c h / 0.85) 70deg, transparent 140deg);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
@media (hover: hover) and (pointer: fine) {
  .spotlight-beam:hover::before {
    opacity: 1;
    animation: spotlight-spin 2.5s linear infinite;
  }
}
`;
  document.head.appendChild(style);
}

// The single most reused primitive in the site: cursor spotlight + animated
// border beam + hover lift + scroll-in reveal, all in one card shell.
export function SpotlightCard({
  children,
  className,
  beam = true,
  lift = true,
  delay = 0,
  as = "div",
}: SpotlightCardProps) {
  const reduce = useReducedMotion();
  const coarse = useCoarsePointer();
  const ref = useRef<HTMLDivElement>(null);
  const Tag = TAGS[as];

  useEffect(() => {
    if (beam) ensureBeamStylesheet();
  }, [beam]);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce || coarse) return;

    function handleMove(e: PointerEvent) {
      const rect = el!.getBoundingClientRect();
      el!.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
      el!.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
      el!.style.setProperty("--spot-opacity", "1");
    }
    function handleLeave() {
      el!.style.setProperty("--spot-opacity", "0");
    }

    el.addEventListener("pointermove", handleMove);
    el.addEventListener("pointerleave", handleLeave);
    return () => {
      el.removeEventListener("pointermove", handleMove);
      el.removeEventListener("pointerleave", handleLeave);
    };
  }, [reduce, coarse]);

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement & HTMLLIElement>}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card shadow-md",
        lift && "transition-shadow duration-300 hover:shadow-2xl",
        beam && "spotlight-beam",
        className,
      )}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={VIEWPORT_ONCE}
      transition={{ duration: DUR.base, delay, ease: EASE_OUT }}
      whileHover={!reduce && lift ? { y: -6, scale: 1.02, transition: SPRING_SOFT } : undefined}
    >
      {!reduce && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-300"
          style={{
            opacity: "var(--spot-opacity, 0)",
            background:
              "radial-gradient(420px circle at var(--spot-x, 50%) var(--spot-y, 50%), oklch(from var(--color-primary) l c h / 0.14), transparent 72%)",
          }}
        />
      )}
      {children}
    </Tag>
  );
}
