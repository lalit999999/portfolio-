"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Search, SearchX } from "lucide-react";

import type { SerializedProject } from "@/types/models";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { DUR, Stagger } from "@/components/motion";
import { ProjectCard } from "@/components/portfolio/project-card";

export interface ProjectsGridProps {
  projects: SerializedProject[];
}

const ALL_CATEGORY = "all";

function readStateFromLocation() {
  if (typeof window === "undefined") {
    return { q: "", category: ALL_CATEGORY, tech: [] as string[] };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    q: params.get("q") ?? "",
    category: params.get("category") ?? ALL_CATEGORY,
    tech: params.get("tech")?.split(",").filter(Boolean) ?? [],
  };
}

export function ProjectsGrid({ projects }: ProjectsGridProps) {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORY);
  const [selectedTech, setSelectedTech] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  // Filter state lives client-side; this only restores it from the URL after
  // mount so shareable links work without opting the page out of static
  // rendering (reading searchParams server-side would do that). Deliberately
  // an Effect, not a lazy useState initializer: window.location must not be
  // read during the hydration render or it'd diverge from the SSR output
  // (which always renders the empty defaults) and trigger a hydration
  // mismatch — the "hydrated" gate below exists for the same reason.
  useEffect(() => {
    const initial = readStateFromLocation();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(initial.q);
    setCategory(initial.category);
    setSelectedTech(new Set(initial.tech));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category !== ALL_CATEGORY) params.set("category", category);
    if (selectedTech.size > 0) params.set("tech", [...selectedTech].join(","));
    const search = params.toString();
    const url = search ? `?${search}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [query, category, selectedTech, hydrated]);

  const categories = useMemo(() => {
    const set = new Set(projects.map((p) => p.category).filter(Boolean));
    return [...set] as string[];
  }, [projects]);

  const techOptions = useMemo(() => {
    const set = new Set(projects.flatMap((p) => p.tech));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [projects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((project) => {
      if (category !== ALL_CATEGORY && project.category !== category) {
        return false;
      }
      if (selectedTech.size > 0) {
        const hasAll = [...selectedTech].every((tech) =>
          project.tech.includes(tech)
        );
        if (!hasAll) return false;
      }
      if (!q) return true;
      return (
        project.title.toLowerCase().includes(q) ||
        project.summary.toLowerCase().includes(q) ||
        project.tech.some((tech) => tech.toLowerCase().includes(q))
      );
    });
  }, [projects, query, category, selectedTech]);

  function toggleTech(tech: string) {
    setSelectedTech((prev) => {
      const next = new Set(prev);
      if (next.has(tech)) next.delete(tech);
      else next.add(tech);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects by title, summary, or tech..."
            aria-label="Search projects"
            className="pl-10"
          />
        </div>

        {categories.length > 0 ? (
          <Tabs value={category} onValueChange={setCategory}>
            <TabsList className="flex-wrap">
              <TabsTrigger value={ALL_CATEGORY}>All</TabsTrigger>
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat}>
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        ) : null}

        {techOptions.length > 0 ? (
          <div
            role="group"
            aria-label="Filter by technology"
            className="flex flex-wrap gap-2"
          >
            {techOptions.map((tech) => {
              const pressed = selectedTech.has(tech);
              return (
                <Badge
                  key={tech}
                  asChild
                  variant={pressed ? "default" : "outline"}
                >
                  <button
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => toggleTech(tech)}
                    className="cursor-pointer focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {tech}
                  </button>
                </Badge>
              );
            })}
          </div>
        ) : null}
      </div>

      <p className="text-sm text-muted-foreground" role="status">
        {filtered.length} {filtered.length === 1 ? "project" : "projects"}
      </p>

      {filtered.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX aria-hidden />
            </EmptyMedia>
            <EmptyTitle>No projects match</EmptyTitle>
            <EmptyDescription>
              Try a different search term or clear the tech filters.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Stagger
          as="div"
          className={cn(
            "grid grid-cols-1 gap-6 sm:grid-cols-2",
            "lg:grid-cols-3"
          )}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((project, index) => (
              <motion.div
                key={project._id}
                layout={!reduce}
                initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
                transition={{ duration: DUR.fast }}
              >
                <ProjectCard project={project} index={index} />
              </motion.div>
            ))}
          </AnimatePresence>
        </Stagger>
      )}
    </div>
  );
}
