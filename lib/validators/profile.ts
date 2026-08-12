import { z } from "zod";

export const profileSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1),
  tagline: z.string().min(1),
  description: z.array(z.string()).default([]),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  location: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  resumeUrl: z.string().url().optional().or(z.literal("")),
  currentlyLearning: z.array(z.string()).default([]),
  availableForWork: z.boolean().default(true),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const profileCreateSchema = profileSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export const profileUpdateSchema = profileCreateSchema.partial();

export type ProfileInput = z.infer<typeof profileSchema>;
