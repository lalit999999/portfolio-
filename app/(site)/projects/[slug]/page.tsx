import type { Metadata } from "next";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Eye,
  FolderGit2,
  SquareArrowOutUpRight,
} from "lucide-react";

import { getAdjacentProjects, getProjectBySlug, getProjectSlugs } from "@/lib/data";
import { formatMonthYear } from "@/lib/utils/date";
import { getBrandIcon } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CountUp, Reveal } from "@/components/motion";

const githubIcon = getBrandIcon("github");

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const slugs = await getProjectSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata(
  props: PageProps<"/projects/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.summary,
    openGraph: project.imageUrl
      ? { images: [{ url: project.imageUrl }] }
      : undefined,
  };
}

export default async function ProjectDetailPage(
  props: PageProps<"/projects/[slug]">
) {
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const { prev, next } = await getAdjacentProjects(slug);
  const showLive = Boolean(
    project.liveUrl && project.liveUrl !== project.githubUrl
  );
  const paragraphs = project.description
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href={"/projects" as Route}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft aria-hidden className="size-4" />
        All projects
      </Link>

      <Reveal>
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-muted to-muted/50">
          {project.imageUrl ? (
            <Image
              src={project.imageUrl}
              alt={project.title}
              fill
              sizes="(min-width: 1024px) 768px, 100vw"
              priority
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <FolderGit2
                aria-hidden
                className="size-16 text-muted-foreground/40"
              />
            </div>
          )}
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="flex flex-col gap-4">
          <h1 className="text-balance font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {project.title}
          </h1>
          <p className="text-lg text-muted-foreground">{project.summary}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {project.startDate ? (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays aria-hidden className="size-4" />
                {formatMonthYear(new Date(project.startDate))}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <Eye aria-hidden className="size-4" />
              <CountUp to={project.viewCount} duration={1} /> views
            </span>
          </div>

          {project.tech.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {project.tech.map((tech) => (
                <Badge key={tech} variant="secondary">
                  {tech}
                </Badge>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-2">
            {project.githubUrl ? (
              <Button asChild variant="outline">
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
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
                  Source
                </a>
              </Button>
            ) : null}
            {showLive ? (
              <Button asChild>
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SquareArrowOutUpRight aria-hidden className="size-4" />
                  Live site
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </Reveal>

      {paragraphs.length > 0 ? (
        <Reveal delay={0.1}>
          <div className="flex flex-col gap-4 text-base leading-relaxed text-foreground/90">
            {paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </Reveal>
      ) : null}

      {prev || next ? (
        <nav
          aria-label="More projects"
          className="grid grid-cols-1 gap-4 border-t border-border/70 pt-8 sm:grid-cols-2"
        >
          {prev ? (
            <Link
              href={`/projects/${prev.slug}` as Route}
              className="group flex flex-col gap-1 rounded-2xl border border-border/70 bg-card p-4 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowLeft aria-hidden className="size-3.5" />
                Previous
              </span>
              <span className="font-heading font-medium text-foreground">
                {prev.title}
              </span>
            </Link>
          ) : (
            <span aria-hidden />
          )}
          {next ? (
            <Link
              href={`/projects/${next.slug}` as Route}
              className="group flex flex-col items-end gap-1 rounded-2xl border border-border/70 bg-card p-4 text-right transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring sm:items-end"
            >
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                Next
                <ArrowRight aria-hidden className="size-3.5" />
              </span>
              <span className="font-heading font-medium text-foreground">
                {next.title}
              </span>
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
