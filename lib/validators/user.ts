import { z } from "zod";
import { USER_ROLES } from "@/models/User";

export const userSchema = z.object({
  _id: z.string().optional(),
  githubId: z.string().min(1),
  username: z.string().min(1),
  name: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  profileUrl: z.string().url().optional().or(z.literal("")),
  bio: z.string().optional(),
  role: z.enum(USER_ROLES).default("visitor"),
  isBanned: z.boolean().default(false),
  messageCount: z.number().int().default(0),
  lastMessageAt: z.coerce.date().optional(),
  lastLoginAt: z.coerce.date().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const userCreateSchema = userSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
  messageCount: true,
  role: true,
  githubId: true,
});

export const userUpdateSchema = userCreateSchema.partial();

export type UserInput = z.infer<typeof userSchema>;
