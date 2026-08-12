import { z } from "zod";

export const skillSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1),
  category: z.string().min(1),
  iconName: z.string().optional(),
  brandSlug: z.string().optional(),
  proficiency: z.number().min(0).max(100),
  order: z.number().int(),
  isVisible: z.boolean().default(true),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const skillCreateSchema = skillSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export const skillUpdateSchema = skillCreateSchema.partial();

export type SkillInput = z.infer<typeof skillSchema>;
