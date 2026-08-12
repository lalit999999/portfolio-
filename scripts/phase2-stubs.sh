#!/usr/bin/env bash
set -euo pipefail
mkdir -p components/motion components/portfolio

stub_motion () { # $1 = filename, $2 = body
  [ -f "components/motion/$1" ] || printf '%s\n' "$2" > "components/motion/$1"
}

cat > components/motion/tokens.ts <<'EOF'
// Shared motion constants. Session A owns this file.
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_BACK_OUT = [0.34, 1.56, 0.64, 1] as const;
export const SPRING_SOFT = { type: "spring", stiffness: 120, damping: 20 } as const;
export const SPRING_SNAPPY = { type: "spring", stiffness: 300, damping: 25 } as const;
export const SPRING_MAGNETIC = { type: "spring", stiffness: 200, damping: 15, mass: 0.5 } as const;
export const VIEWPORT_ONCE = { once: true, margin: "-80px" } as const;
export const DUR = { fast: 0.3, base: 0.5, slow: 0.8 } as const;
EOF

stub_motion reveal.tsx '"use client";
import type { ReactNode } from "react";
export interface RevealProps { children: ReactNode; delay?: number; y?: number; blur?: boolean; once?: boolean; className?: string; as?: "div" | "section" | "article" | "li" | "header"; id?: string; }
export function Reveal({ children, className, id }: RevealProps) { return <div id={id} className={className}>{children}</div>; }'

stub_motion stagger.tsx '"use client";
import type { ReactNode } from "react";
export interface StaggerProps { children: ReactNode; gap?: number; delay?: number; className?: string; as?: "div" | "ul" | "section"; }
export function Stagger({ children, className }: StaggerProps) { return <div className={className}>{children}</div>; }
export interface StaggerItemProps { children: ReactNode; y?: number; className?: string; as?: "div" | "li"; }
export function StaggerItem({ children, className }: StaggerItemProps) { return <div className={className}>{children}</div>; }'

stub_motion magnetic.tsx '"use client";
import type { ReactNode } from "react";
export interface MagneticProps { children: ReactNode; strength?: number; radius?: number; className?: string; }
export function Magnetic({ children, className }: MagneticProps) { return <span className={className}>{children}</span>; }'

stub_motion shine.tsx '"use client";
export interface ShineProps { className?: string; duration?: number; }
export function Shine({ className }: ShineProps) { return <span aria-hidden className={className} />; }'

stub_motion spotlight-card.tsx '"use client";
import type { ReactNode } from "react";
export interface SpotlightCardProps { children: ReactNode; className?: string; beam?: boolean; lift?: boolean; delay?: number; as?: "div" | "article" | "li"; }
export function SpotlightCard({ children, className }: SpotlightCardProps) { return <div className={className}>{children}</div>; }'

stub_motion tilt.tsx '"use client";
import type { ReactNode } from "react";
export interface TiltProps { children: ReactNode; max?: number; perspective?: number; className?: string; disabled?: boolean; }
export function Tilt({ children, className }: TiltProps) { return <div className={className}>{children}</div>; }'

stub_motion typewriter.tsx '"use client";
export interface TypewriterProps { text: string | string[]; prefix?: string; speed?: number; startDelay?: number; loop?: boolean; className?: string; cursorClassName?: string; }
export function Typewriter({ text, className }: TypewriterProps) { return <span className={className}>{Array.isArray(text) ? text[0] : text}</span>; }'

stub_motion dot-grid.tsx '"use client";
export interface DotGridProps { gap?: number; radius?: number; dotSize?: number; className?: string; }
export function DotGrid({ className }: DotGridProps) { return <div aria-hidden className={className} />; }'

stub_motion orbit.tsx '"use client";
import type { ReactNode } from "react";
export interface OrbitItem { id: string; node: ReactNode; }
export interface OrbitProps { items: OrbitItem[]; radius?: number; duration?: number; reverse?: boolean; counterRotate?: boolean; className?: string; }
export function Orbit({ className }: OrbitProps) { return <div aria-hidden className={className} />; }'

stub_motion count-up.tsx '"use client";
export interface CountUpProps { to: number; from?: number; duration?: number; suffix?: string; className?: string; }
export function CountUp({ to, suffix, className }: CountUpProps) { return <span className={className}>{to}{suffix}</span>; }'

stub_motion scroll-progress.tsx '"use client";
export interface ScrollProgressProps { className?: string; height?: number; }
export function ScrollProgress({ className }: ScrollProgressProps) { return <div aria-hidden className={className} />; }'

cat > components/motion/index.ts <<'EOF'
export * from "./tokens";
export * from "./reveal";
export * from "./stagger";
export * from "./magnetic";
export * from "./shine";
export * from "./spotlight-card";
export * from "./tilt";
export * from "./typewriter";
export * from "./dot-grid";
export * from "./orbit";
export * from "./count-up";
export * from "./scroll-progress";
EOF

stub_card () { [ -f "components/portfolio/$1" ] || printf '%s\n' "$2" > "components/portfolio/$1"; }

stub_card project-card.tsx '"use client";
import type { SerializedProject } from "@/types/models";
export interface ProjectCardProps { project: SerializedProject; index?: number; compact?: boolean; className?: string; }
export function ProjectCard({ project, className }: ProjectCardProps) { return <div className={className}>{project.title}</div>; }'

stub_card certification-card.tsx '"use client";
import type { SerializedCertification } from "@/types/models";
export interface CertificationCardProps { certification: SerializedCertification; index?: number; className?: string; }
export function CertificationCard({ certification, className }: CertificationCardProps) { return <div className={className}>{certification.title}</div>; }'

stub_card skill-card.tsx '"use client";
import type { SerializedSkill } from "@/types/models";
export interface SkillCardProps { skill: SerializedSkill; index?: number; accent?: string; className?: string; }
export function SkillCard({ skill, className }: SkillCardProps) { return <div className={className}>{skill.name}</div>; }'

stub_card blog-post-card.tsx '"use client";
import type { SerializedBlogPost } from "@/types/models";
export interface BlogPostCardProps { post: SerializedBlogPost; sourceName?: string; index?: number; className?: string; }
export function BlogPostCard({ post, className }: BlogPostCardProps) { return <div className={className}>{post.title}</div>; }'

stub_card section-heading.tsx 'export interface SectionHeadingProps { eyebrow?: string; title: string; description?: string; align?: "left" | "center"; className?: string; }
export function SectionHeading({ title, className }: SectionHeadingProps) { return <h2 className={className}>{title}</h2>; }'

echo "Phase 2 stubs written."
