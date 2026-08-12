import type { Metadata } from "next";
import { getProjects } from "@/lib/data";
import { SectionHeading } from "@/components/portfolio/section-heading";
import { ProjectsGrid } from "./projects-grid";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Projects",
  description: "Full-stack apps, real-time systems, and side projects.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Work"
        title="Projects"
        description="A selection of full-stack apps, real-time systems, and tools I've built."
      />
      <ProjectsGrid projects={projects} />
    </div>
  );
}
