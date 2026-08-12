import { z } from "zod";

export const educationSchema = z.object({
  _id: z.string().optional(),
  institution: z.string().min(1),
  degree: z.string().min(1),
  field: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  grade: z.string().optional(),
  description: z.string().optional(),
  order: z.number().int(),
  isVisible: z.boolean().default(true),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const educationCreateSchema = educationSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export const educationUpdateSchema = educationCreateSchema.partial();

export type EducationInput = z.infer<typeof educationSchema>;
