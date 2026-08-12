"use client";
import type { ReactNode } from "react";
export interface RevealProps { children: ReactNode; delay?: number; y?: number; blur?: boolean; once?: boolean; className?: string; as?: "div" | "section" | "article" | "li" | "header"; id?: string; }
export function Reveal({ children, className, id }: RevealProps) { return <div id={id} className={className}>{children}</div>; }
