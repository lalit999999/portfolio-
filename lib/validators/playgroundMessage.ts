import { z } from "zod";

export const playgroundMessageSchema = z.object({
  _id: z.string().optional(),
  author: z.string().min(1),
  content: z.string().trim().min(1).max(500),
  isPinned: z.boolean().default(false),
  isHidden: z.boolean().default(false),
  editedAt: z.coerce.date().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const playgroundMessageCreateSchema = playgroundMessageSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export const playgroundMessageUpdateSchema =
  playgroundMessageCreateSchema.partial();

export type PlaygroundMessageInput = z.infer<typeof playgroundMessageSchema>;
