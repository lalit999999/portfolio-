import { z } from "zod";

/**
 * Client-safe mirror of certificationFormSchema (./schema.ts). Can't import
 * certificationCreateSchema in client code: it pulls CERT_COLORS from
 * @/models/Certification, and that file's mongoose import breaks the
 * browser bundle (Node core modules like "tls"). Server-side validation in
 * actions.ts still runs the real schema from ./schema.ts — this one only
 * drives the form's client-side UX, per the "client validation is a UX
 * affordance, not a security boundary" rule.
 */
export const CERT_COLORS_CLIENT = [
  "primary",
  "accent",
  "success",
  "warning",
  "info",
  "neutral",
] as const;

export const certificationClientSchema = z
  .object({
    title: z.string().min(1),
    issuer: z.string().min(1),
    issueDate: z.coerce.date(),
    expiryDate: z.coerce.date().optional(),
    credentialId: z.string().optional(),
    credentialUrl: z.string().url().optional().or(z.literal("")),
    imageUrl: z.string().url().optional().or(z.literal("")),
    skills: z.array(z.string()).default([]),
    color: z.enum(CERT_COLORS_CLIENT).default("info"),
    order: z.number().int(),
    isVisible: z.boolean().default(true),
  })
  .refine((data) => !data.expiryDate || data.expiryDate > data.issueDate, {
    message: "Expiry date must be after the issue date.",
    path: ["expiryDate"],
  });
