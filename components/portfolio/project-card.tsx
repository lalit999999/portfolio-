"use client";
import type { SerializedProject } from "@/types/models";
export interface ProjectCardProps { project: SerializedProject; index?: number; compact?: boolean; className?: string; }
export function ProjectCard({ project, className }: ProjectCardProps) { return <div className={className}>{project.title}</div>; }
