"use client";
import type { SerializedSkill } from "@/types/models";
export interface SkillCardProps { skill: SerializedSkill; index?: number; accent?: string; className?: string; }
export function SkillCard({ skill, className }: SkillCardProps) { return <div className={className}>{skill.name}</div>; }
