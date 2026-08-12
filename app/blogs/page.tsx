import type { Metadata } from "next";
import { getBlogPosts, getBlogSources } from "@/lib/data";
import { SectionHeading } from "@/components/portfolio/section-heading";
import { BlogsGrid } from "./blogs-grid";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing on web development, from across my publications.",
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
