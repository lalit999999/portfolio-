import { z } from "zod";

export const messageSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1).max(100),
  email: z.string().email().max(200),
  subject: z.string().max(200).optional(),
  message: z.string().min(1).max(5000),
  isRead: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  ipHash: z.string().optional(),
  userAgent: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const messageCreateSchema = messageSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
  isRead: true,
  ipHash: true,
});

export const messageUpdateSchema = messageCreateSchema.partial();

// Public contact-form payload: messageCreateSchema plus a honeypot field.
// Any non-empty `website` value indicates a bot submission.
export const contactSchema = messageCreateSchema.extend({
  website: z.string().max(0),
});

export type MessageInput = z.infer<typeof messageSchema>;
