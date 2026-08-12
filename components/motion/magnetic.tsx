"use client";
import type { ReactNode } from "react";
export interface MagneticProps { children: ReactNode; strength?: number; radius?: number; className?: string; }
export function Magnetic({ children, className }: MagneticProps) { return <span className={className}>{children}</span>; }
