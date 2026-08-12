"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Layers } from "lucide-react";

import type { SerializedSkill, SerializedSkillCategory } from "@/types/models";
import { cn } from "@/lib/utils";
import { getIcon } from "@/lib/icons";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { DUR, Stagger } from "@/components/motion";
import { SkillCard } from "@/components/portfolio/skill-card";

export interface SkillsExplorerProps {
  categories: (SerializedSkillCategory & { skills: SerializedSkill[] })[];
}

const ALL = "all";

export function SkillsExplorer({ categories }: SkillsExplorerProps) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(ALL);

  const allSkillsCount = useMemo(
    () => categories.reduce((sum, c) => sum + c.skills.length, 0),
    [categories]
  );

  const activeCategory = categories.find((c) => c.slug === active);
  const visibleSkills = activeCategory
    ? activeCategory.skills
    : categories.flatMap((c) => c.skills);

  const rail = [
    { slug: ALL, name: "All", count: allSkillsCount, iconName: undefined },
    ...categories.map((c) => ({
      slug: c.slug,
      name: c.name,
      count: c.skills.length,
      iconName: c.iconName,
    })),
  ];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div
          role="group"
          aria-label="Filter skills by category"
          className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"
        >
          {rail.map((item) => {
            const pressed = item.slug === active;
            const Icon = item.iconName ? getIcon(item.iconName) : Layers;
            return (
              <button
                key={item.slug}
                type="button"
                aria-pressed={pressed}
                onClick={() => setActive(item.slug)}
                className={cn(
                  "inline-flex shrink-0 items-center justify-between gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  pressed
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border/70 bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon aria-hidden className="size-4" />
                  {item.name}
                </span>
                <span
                  className={cn(
                    "inline-flex size-5 items-center justify-center rounded-full text-xs",
                    pressed ? "bg-primary/20" : "bg-muted"
                  )}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {visibleSkills.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Layers aria-hidden />
            </EmptyMedia>
            <EmptyTitle>No skills here yet</EmptyTitle>
            <EmptyDescription>
              This category doesn&apos;t have any visible skills.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Stagger
          as="div"
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {visibleSkills.map((skill, index) => (
              <motion.div
                key={skill._id}
                layout={!reduce}
                initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
                transition={{ duration: DUR.fast }}
              >
                <SkillCard skill={skill} index={index} />
              </motion.div>
            ))}
          </AnimatePresence>
        </Stagger>
      )}
    </div>
  );
}
