"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Newspaper } from "lucide-react";

import type { SerializedBlogPost, SerializedBlogSource } from "@/types/models";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { DUR, Stagger } from "@/components/motion";
import { BlogPostCard } from "@/components/portfolio/blog-post-card";

export interface BlogsGridProps {
  posts: SerializedBlogPost[];
  sources: SerializedBlogSource[];
}

const ALL = "all";

export function BlogsGrid({ posts, sources }: BlogsGridProps) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(ALL);

  const sourceById = useMemo(
    () => new Map(sources.map((s) => [s._id, s])),
    [sources]
  );

  // Several sources share a display name (multiple Hashnode publications all
  // titled "Git & GitHub"), so the filter groups by name and matches posts
  // against the full set of source ids behind that name, not a single host.
  const groups = useMemo(() => {
    const byName = new Map<string, string[]>();
    for (const source of sources) {
      const ids = byName.get(source.name) ?? [];
      ids.push(source._id);
      byName.set(source.name, ids);
    }
    return [...byName.entries()].map(([name, sourceIds]) => ({
      name,
      sourceIds,
    }));
  }, [sources]);

  const filtered = useMemo(() => {
    if (active === ALL) return posts;
    const group = groups.find((g) => g.name === active);
    if (!group) return posts;
    return posts.filter((post) => group.sourceIds.includes(post.source));
  }, [posts, groups, active]);

  return (
    <div className="flex flex-col gap-6">
      {groups.length > 0 ? (
        <div
          role="group"
          aria-label="Filter posts by publication"
          className="flex flex-wrap gap-2"
        >
          <Badge asChild variant={active === ALL ? "default" : "outline"}>
            <button
              type="button"
              aria-pressed={active === ALL}
              onClick={() => setActive(ALL)}
              className="cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
            >
              All
            </button>
          </Badge>
          {groups.map((group) => {
            const pressed = active === group.name;
            return (
              <Badge
                key={group.name}
                asChild
                variant={pressed ? "default" : "outline"}
              >
                <button
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => setActive(group.name)}
                  className="cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {group.name}
                </button>
              </Badge>
            );
          })}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Newspaper aria-hidden />
            </EmptyMedia>
            <EmptyTitle>No posts yet</EmptyTitle>
            <EmptyDescription>
              Posts sync periodically from the connected publications — check
              back soon.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Stagger
          as="div"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((post, index) => (
              <motion.div
                key={post._id}
                layout={!reduce}
                initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
                transition={{ duration: DUR.fast }}
              >
                <BlogPostCard
                  post={post}
                  sourceName={sourceById.get(post.source)?.name}
                  index={index}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </Stagger>
      )}
    </div>
  );
}
