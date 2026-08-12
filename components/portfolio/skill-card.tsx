"use client";

import { getBrandIcon, getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Reveal, SpotlightCard } from "@/components/motion";
import type { SerializedSkill } from "@/types/models";

export interface SkillCardProps {
  skill: SerializedSkill;
  index?: number;
  accent?: string;
  className?: string;
}

export function SkillCard({
  skill,
  index = 0,
  accent,
  className,
}: SkillCardProps) {
  const brandIcon = getBrandIcon(skill.brandSlug ?? skill.name);
  const FallbackIcon = getIcon(skill.iconName ?? "");

  return (
    <Reveal delay={index * 0.04} y={12}>
      <SpotlightCard
        className={cn(
          "flex flex-col items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 text-center",
          className
        )}
      >
        <span
          className={cn(
            "inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary",
            accent
          )}
        >
          {brandIcon ? (
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
              className="size-5"
            >
              <path d={brandIcon.path} />
            </svg>
          ) : (
            <FallbackIcon aria-hidden className="size-5" />
          )}
        </span>

        <span className="text-sm font-medium text-foreground">
          {skill.name}
        </span>

        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label={`${skill.name} proficiency`}
          aria-valuenow={skill.proficiency}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
            style={{ width: `${skill.proficiency}%` }}
          />
        </div>
      </SpotlightCard>
    </Reveal>
  );
}
