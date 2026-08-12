"use client";

import { format } from "date-fns";
import Image from "next/image";
import { Clock, Newspaper } from "lucide-react";

import type { SerializedBlogPost } from "@/types/models";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Reveal, SpotlightCard } from "@/components/motion";

export interface BlogPostCardProps {
  post: SerializedBlogPost;
  sourceName?: string;
  index?: number;
  className?: string;
}

export function BlogPostCard({
  post,
  sourceName,
  index = 0,
  className,
}: BlogPostCardProps) {
  return (
    <Reveal delay={index * 0.08} as="article">
      <SpotlightCard
        className={cn(
          "group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
      >
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 flex-col"
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-muted to-muted/50">
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(min-width: 1024px) 400px, 100vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.08]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Newspaper
                  aria-hidden
                  className="size-8 text-muted-foreground/40"
                />
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2 p-5">
            {sourceName ? (
              <Badge variant="outline" className="w-fit">
                {sourceName}
              </Badge>
            ) : null}
            <h3 className="line-clamp-2 font-heading text-base font-semibold text-foreground">
              {post.title}
            </h3>
            {post.brief ? (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {post.brief}
              </p>
            ) : null}

            {post.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {post.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}

            <div className="mt-auto flex items-center gap-3 pt-3 text-xs text-muted-foreground">
              <span>{format(new Date(post.publishedAt), "MMM d, yyyy")}</span>
              {post.readTimeMinutes ? (
                <span className="inline-flex items-center gap-1">
                  <Clock aria-hidden className="size-3" />
                  {post.readTimeMinutes} min read
                </span>
              ) : null}
            </div>
          </div>
        </a>
      </SpotlightCard>
    </Reveal>
  );
}
