"use client";
import type { SerializedBlogPost } from "@/types/models";
export interface BlogPostCardProps { post: SerializedBlogPost; sourceName?: string; index?: number; className?: string; }
export function BlogPostCard({ post, className }: BlogPostCardProps) { return <div className={className}>{post.title}</div>; }
