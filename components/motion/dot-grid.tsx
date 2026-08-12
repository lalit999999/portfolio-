"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface DotGridProps {
  gap?: number;
  radius?: number;
  dotSize?: number;
  className?: string;
}

const MAX_DPR = 2;
const IDLE_MS = 1000;
const SETTLE_EPSILON = 0.002;
const LERP_FACTOR = 0.15;
const BASE_OPACITY = 0.15;
const PEAK_OPACITY = 0.9;

interface Dot {
  x: number;
  y: number;
  brightness: number;
}

export function DotGrid({ gap = 28, radius = 120, dotSize = 1.5, className }: DotGridProps) {
  const reduce = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const context = canvasEl?.getContext("2d");
    if (!canvasEl || !context) return;
    const canvas: HTMLCanvasElement = canvasEl;
    const ctx: CanvasRenderingContext2D = context;

    let width = 0;
    let height = 0;
    let dots: Dot[] = [];
    let color = "currentColor";
    let pointer: { x: number; y: number } | null = null;
    let lastMoveAt = 0;
    let rafId: number | null = null;
    let running = false;

    function readColor() {
      color = getComputedStyle(document.documentElement).getPropertyValue("--color-muted-foreground").trim() || "currentColor";
    }

    function buildGrid() {
      dots = [];
      for (let y = gap / 2; y < height; y += gap) {
        for (let x = gap / 2; x < width; x += gap) {
          dots.push({ x, y, brightness: 0 });
        }
      }
    }

    function drawStatic() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;
      ctx.globalAlpha = BASE_OPACITY;
      for (const dot of dots) {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
      drawStatic();
    }

    function drawFrame() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;
      let maxDelta = 0;

      for (const dot of dots) {
        let target = 0;
        if (pointer) {
          const dx = dot.x - pointer.x;
          const dy = dot.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < radius) target = 1 - dist / radius;
        }
        const delta = target - dot.brightness;
        dot.brightness += delta * LERP_FACTOR;
        maxDelta = Math.max(maxDelta, Math.abs(delta));

        ctx.globalAlpha = BASE_OPACITY + dot.brightness * (PEAK_OPACITY - BASE_OPACITY);
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      const idle = performance.now() - lastMoveAt > IDLE_MS;
      if (idle && maxDelta < SETTLE_EPSILON) {
        running = false;
        rafId = null;
        return;
      }
      rafId = requestAnimationFrame(drawFrame);
    }

    function startLoop() {
      if (running || reduce || document.visibilityState === "hidden") return;
      running = true;
      rafId = requestAnimationFrame(drawFrame);
    }

    function handlePointerMove(e: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      lastMoveAt = performance.now();
      startLoop();
    }

    function handlePointerLeave() {
      pointer = null;
      lastMoveAt = performance.now();
      startLoop();
    }

    function handleVisibility() {
      if (document.visibilityState === "hidden") {
        if (rafId) cancelAnimationFrame(rafId);
        running = false;
        rafId = null;
      } else if (pointer) {
        startLoop();
      }
    }

    readColor();
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    // next-themes toggles a class/attribute on <html>; re-read the dot
    // colour and redraw whenever that changes instead of hardcoding it.
    const themeObserver = new MutationObserver(() => {
      readColor();
      drawStatic();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    if (!reduce) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerleave", handlePointerLeave);
      document.addEventListener("visibilitychange", handleVisibility);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [gap, radius, dotSize, reduce]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("absolute inset-0 pointer-events-none will-change-transform", className)}
    />
  );
}
