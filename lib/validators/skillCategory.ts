import { z } from "zod";

export const skillCategorySchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  iconName: z.string().optional(),
  description: z.string().optional(),
  order: z.number().int(),
  isVisible: z.boolean().default(true),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const skillCategoryCreateSchema = skillCategorySchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export const skillCategoryUpdateSchema = skillCategoryCreateSchema.partial();

export type SkillCategoryInput = z.infer<typeof skillCategorySchema>;
