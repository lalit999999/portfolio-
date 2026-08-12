import { z } from "zod";
import { BLOG_PLATFORMS } from "@/models/BlogSource";

export const blogSourceSchema = z.object({
  _id: z.string().optional(),
  platform: z.enum(BLOG_PLATFORMS).default("hashnode"),
  username: z.string().min(1),
  host: z.string().optional(),
  name: z.string().min(1),
  isActive: z.boolean().default(true),
  lastSyncedAt: z.coerce.date().optional(),
  order: z.number().int(),
  isVisible: z.boolean().default(true),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const blogSourceCreateSchema = blogSourceSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export const blogSourceUpdateSchema = blogSourceCreateSchema.partial();

export type BlogSourceInput = z.infer<typeof blogSourceSchema>;
