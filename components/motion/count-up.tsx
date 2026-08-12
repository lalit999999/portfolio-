"use client";
export interface CountUpProps { to: number; from?: number; duration?: number; suffix?: string; className?: string; }
export function CountUp({ to, suffix, className }: CountUpProps) { return <span className={className}>{to}{suffix}</span>; }
