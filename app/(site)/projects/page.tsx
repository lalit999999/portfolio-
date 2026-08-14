import type { Metadata } from "next";
import { getProjects } from "@/lib/data";
import { SectionHeading } from "@/components/portfolio/section-heading";
import { ProjectsGrid } from "./projects-grid";

export const revalidate = 3600;

const title = "Projects";
const description = "Full-stack apps, real-time systems, and side projects.";

// Explicit openGraph here, not just title/description: Next only merges
// per-segment metadata shallowly — a page that omits openGraph inherits the
// root layout's whole object (its title/description), not this page's.
export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: "website" },
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
