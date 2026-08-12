import type { Route } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { SerializedProject } from "@/types/models";
import { Button } from "@/components/ui/button";
import { Stagger, StaggerItem } from "@/components/motion";
import { ProjectCard } from "@/components/portfolio/project-card";
import { SectionHeading } from "@/components/portfolio/section-heading";

export interface FeaturedProjectsProps {
  projects: SerializedProject[];
}

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  if (!projects.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading eyebrow="Work" title="Featured projects" />
        <Button asChild variant="ghost" size="sm">
          <Link href={"/projects" as Route}>
            View all
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>
      <Stagger gap={0.08} className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <StaggerItem key={project._id}>
            <ProjectCard project={project} index={i} compact />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
