"use client";
import type { ReactNode } from "react";
export interface StaggerProps { children: ReactNode; gap?: number; delay?: number; className?: string; as?: "div" | "ul" | "section"; }
export function Stagger({ children, className }: StaggerProps) { return <div className={className}>{children}</div>; }
export interface StaggerItemProps { children: ReactNode; y?: number; className?: string; as?: "div" | "li"; }
export function StaggerItem({ children, className }: StaggerItemProps) { return <div className={className}>{children}</div>; }
