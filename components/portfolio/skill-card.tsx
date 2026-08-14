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
            // getIcon() looks up a stable reference in a static module-level
            // map (lib/icons.ts) — it never defines a new component, so this
            // isn't the render-time component creation the rule guards against.
            // eslint-disable-next-line react-hooks/static-components
            <FallbackIcon aria-hidden className="size-5" />
          )}
        </span>

        <span className="text-sm font-medium text-foreground">
          {skill.name}
        </span>
      </SpotlightCard>
    </Reveal>
  );
}
