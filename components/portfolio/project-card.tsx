"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { Eye, FolderGit2, SquareArrowOutUpRight } from "lucide-react";

import type { SerializedProject } from "@/types/models";
import { getBrandIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CountUp, Reveal, SpotlightCard } from "@/components/motion";

export interface ProjectCardProps {
  project: SerializedProject;
  index?: number;
  compact?: boolean;
  className?: string;
}

export function ProjectCard({
  project,
  index = 0,
  compact = false,
  className,
}: ProjectCardProps) {
  const showLive = Boolean(
    project.liveUrl && project.liveUrl !== project.githubUrl
  );
  const href = `/projects/${project.slug}` as Route;
  const githubIcon = getBrandIcon("github");

  return (
    <SpotlightCard
      as="article"
      delay={index * 0.08}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card",
        className
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-muted to-muted/50">
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            sizes={
              compact
                ? "(min-width: 1024px) 33vw, 100vw"
                : "(min-width: 1024px) 400px, 100vw"
            }
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.08]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FolderGit2
              aria-hidden
              className="size-10 text-muted-foreground/40"
            />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          {project.title}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {project.summary}
        </p>

        {!compact && project.tech.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {project.tech.map((tech, i) => (
              <Reveal key={tech} delay={i * 0.04} y={6}>
                <Badge variant="secondary">{tech}</Badge>
              </Reveal>
            ))}
          </div>
        ) : null}

        {compact && project.tech.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {project.tech.slice(0, 3).map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="relative z-10 mt-auto flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            {project.githubUrl ? (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} source on GitHub`}
                className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                {githubIcon ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                    className="size-4"
                  >
                    <path d={githubIcon.path} />
                  </svg>
                ) : null}
              </a>
            ) : null}
            {showLive ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} live site`}
                className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <SquareArrowOutUpRight aria-hidden className="size-4" />
              </a>
            ) : null}
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Eye aria-hidden className="size-3.5" />
            <CountUp to={project.viewCount} duration={1} />
          </span>
        </div>
      </div>

      <Link
        href={href}
        className="absolute inset-0 z-0 rounded-2xl focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="sr-only">View {project.title}</span>
      </Link>
    </SpotlightCard>
  );
}
