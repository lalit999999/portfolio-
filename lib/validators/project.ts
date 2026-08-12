import { z } from "zod";

export const projectSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string().min(1),
  description: z.string().min(1),
  tech: z.array(z.string()).default([]),
  category: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  liveUrl: z.string().url().optional().or(z.literal("")),
  featured: z.boolean().default(false),
  viewCount: z.number().int().default(0),
  startDate: z.coerce.date().optional(),
  order: z.number().int(),
  isVisible: z.boolean().default(true),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const projectCreateSchema = projectSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
});

export const projectUpdateSchema = projectCreateSchema.partial();

export type ProjectInput = z.infer<typeof projectSchema>;
