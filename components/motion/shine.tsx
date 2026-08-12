"use client";
export interface ShineProps { className?: string; duration?: number; }
export function Shine({ className }: ShineProps) { return <span aria-hidden className={className} />; }
