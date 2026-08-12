"use client";
export interface ScrollProgressProps { className?: string; height?: number; }
export function ScrollProgress({ className }: ScrollProgressProps) { return <div aria-hidden className={className} />; }
