import type { Route } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { SerializedBlogPost, SerializedBlogSource } from "@/types/models";
import { Button } from "@/components/ui/button";
import { Stagger, StaggerItem } from "@/components/motion";
import { BlogPostCard } from "@/components/portfolio/blog-post-card";
import { SectionHeading } from "@/components/portfolio/section-heading";

export interface LatestPostsProps {
  posts: SerializedBlogPost[];
  sources: SerializedBlogSource[];
}

export function LatestPosts({ posts, sources }: LatestPostsProps) {
  if (!posts.length) return null;

  const sourceNameById = new Map(sources.map((source) => [source._id, source.name]));

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading eyebrow="Writing" title="Latest posts" />
        <Button asChild variant="ghost" size="sm">
          <Link href={"/blogs" as Route}>
            View all
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>
      <Stagger gap={0.08} className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, i) => (
          <StaggerItem key={post._id}>
            <BlogPostCard post={post} sourceName={sourceNameById.get(post.source)} index={i} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
