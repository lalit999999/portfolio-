"use client";
import type { ReactNode } from "react";
export interface OrbitItem { id: string; node: ReactNode; }
export interface OrbitProps { items: OrbitItem[]; radius?: number; duration?: number; reverse?: boolean; counterRotate?: boolean; className?: string; }
export function Orbit({ className }: OrbitProps) { return <div aria-hidden className={className} />; }
