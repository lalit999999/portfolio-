import { z } from "zod";
import { CERT_COLORS } from "@/models/Certification";

export const certificationSchema = z.object({
  _id: z.string().optional(),
  title: z.string().min(1),
  issuer: z.string().min(1),
  issueDate: z.coerce.date(),
  expiryDate: z.coerce.date().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  skills: z.array(z.string()).default([]),
  color: z.enum(CERT_COLORS).default("blue"),
  order: z.number().int(),
  isVisible: z.boolean().default(true),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export const certificationCreateSchema = certificationSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export const certificationUpdateSchema = certificationCreateSchema.partial();

export type CertificationInput = z.infer<typeof certificationSchema>;
