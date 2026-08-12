"use client";
import type { ReactNode } from "react";
export interface TiltProps { children: ReactNode; max?: number; perspective?: number; className?: string; disabled?: boolean; }
export function Tilt({ children, className }: TiltProps) { return <div className={className}>{children}</div>; }
