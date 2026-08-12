import { z } from "zod";

export const socialSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1),
  url: z.string().url(),
  iconName: z.string().optional(),
  handle: z.string().optional(),
  order: z.number().int(),
  isVisible: z.boolean().default(true),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const socialCreateSchema = socialSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export const socialUpdateSchema = socialCreateSchema.partial();

export type SocialInput = z.infer<typeof socialSchema>;
