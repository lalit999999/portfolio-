import { z } from "zod";

export const blogPostSchema = z.object({
  _id: z.string().optional(),
  source: z.string().min(1),
  externalId: z.string().min(1),
  title: z.string().min(1),
  brief: z.string().optional(),
  slug: z.string().min(1),
  url: z.string().url(),
  coverImage: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  readTimeMinutes: z.number().int().optional(),
  publishedAt: z.coerce.date(),
  order: z.number().int(),
  isVisible: z.boolean().default(true),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const blogPostCreateSchema = blogPostSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export const blogPostUpdateSchema = blogPostCreateSchema.partial();

export type BlogPostInput = z.infer<typeof blogPostSchema>;
