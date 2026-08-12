"use client";
export interface DotGridProps { gap?: number; radius?: number; dotSize?: number; className?: string; }
export function DotGrid({ className }: DotGridProps) { return <div aria-hidden className={className} />; }
