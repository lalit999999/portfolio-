"use client";
import type { ReactNode } from "react";
export interface SpotlightCardProps { children: ReactNode; className?: string; beam?: boolean; lift?: boolean; delay?: number; as?: "div" | "article" | "li"; }
export function SpotlightCard({ children, className }: SpotlightCardProps) { return <div className={className}>{children}</div>; }
