import type { Metadata } from "next";
import { getBlogPosts, getBlogSources } from "@/lib/data";
import { SectionHeading } from "@/components/portfolio/section-heading";
import { BlogsGrid } from "./blogs-grid";

export const revalidate = 3600;

const title = "Blog";
const description = "Writing on web development, from across my publications.";

// Explicit openGraph here, not just title/description: Next only merges
// per-segment metadata shallowly — a page that omits openGraph inherits the
// root layout's whole object (its title/description), not this page's.
export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: "website" },
};

export default async function BlogsPage() {
  const [posts, sources] = await Promise.all([
    getBlogPosts(),
    getBlogSources(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Writing"
        title="Blog"
        description="Notes and tutorials, syndicated from my publications."
      />
      <BlogsGrid posts={posts} sources={sources} />
    </div>
  );
}
