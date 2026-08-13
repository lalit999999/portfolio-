import { certificationCreateSchema } from "@/lib/validators/certification";

/**
 * Locally derived from the frozen certificationCreateSchema — expiry-after-
 * issue is a form-level concern, not a base-model invariant, so it lives
 * here rather than in lib/validators/certification.ts.
 */
export const certificationFormSchema = certificationCreateSchema.refine(
  (data) => !data.expiryDate || data.expiryDate > data.issueDate,
  {
    message: "Expiry date must be after the issue date.",
    path: ["expiryDate"],
  }
);
