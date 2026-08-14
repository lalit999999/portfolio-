import type { Metadata } from "next";
import { getSkillsByCategory } from "@/lib/data";
import { SectionHeading } from "@/components/portfolio/section-heading";
import { SkillsExplorer } from "./skills-explorer";

export const revalidate = 3600;

const title = "Skills";
const description = "Languages, frameworks, and tools I work with, by category.";

// Explicit openGraph here, not just title/description: Next only merges
// per-segment metadata shallowly — a page that omits openGraph inherits the
// root layout's whole object (its title/description), not this page's.
export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: "website" },
};

export default async function SkillsPage() {
  const categories = await getSkillsByCategory();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Toolbox"
        title="Skills"
        description="Languages, frameworks, and tools I reach for, grouped by category."
      />
      <SkillsExplorer categories={categories} />
    </div>
  );
}
