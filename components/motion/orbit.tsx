"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface OrbitItem {
  id: string;
  node: ReactNode;
}

export interface OrbitProps {
  items: OrbitItem[];
  radius?: number;
  duration?: number;
  reverse?: boolean;
  counterRotate?: boolean;
  className?: string;
}

let orbitStylesInjected = false;

// Shared @keyframes for both the ring and each item's counter-rotation.
// app/globals.css belongs to Session B, so this is injected once at module scope.
function ensureOrbitStylesheet() {
  if (orbitStylesInjected || typeof document === "undefined") return;
  orbitStylesInjected = true;
  const style = document.createElement("style");
  style.setAttribute("data-orbit-styles", "");
  style.textContent = `
@keyframes orbit-spin {
  from { rotate: 0deg; }
  to { rotate: 360deg; }
}
`;
  document.head.appendChild(style);
}

export function Orbit({
  items,
  radius = 130,
  duration = 20,
  reverse = false,
  counterRotate = true,
  className,
}: OrbitProps) {
  const reduce = useReducedMotion();

  useEffect(() => {
    ensureOrbitStylesheet();
  }, []);

  const step = items.length > 0 ? 360 / items.length : 0;

  const ringStyle: CSSProperties | undefined = reduce
    ? undefined
    : {
        rotate: "0deg",
        animationName: "orbit-spin",
        animationDuration: `${duration}s`,
        animationTimingFunction: "linear",
        animationIterationCount: "infinite",
        animationDirection: reverse ? "reverse" : "normal",
        willChange: "transform",
      };

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0", className)} style={ringStyle}>
      {items.map((item, i) => {
        const angle = step * i;
        const counterStyle: CSSProperties =
          counterRotate && !reduce
            ? {
                translate: "-50% -50%",
                rotate: "0deg",
                animationName: "orbit-spin",
                animationDuration: `${duration}s`,
                animationTimingFunction: "linear",
                animationIterationCount: "infinite",
                animationDirection: reverse ? "normal" : "reverse",
              }
            : { translate: "-50% -50%" };

        return (
          <div
            key={item.id}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 0,
              height: 0,
              transform: `rotate(${angle}deg) translate(${radius}px) rotate(${-angle}deg)`,
            }}
          >
            <div style={counterStyle}>{item.node}</div>
          </div>
        );
      })}
    </div>
  );
}
