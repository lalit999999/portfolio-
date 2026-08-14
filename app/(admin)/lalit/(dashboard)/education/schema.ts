import { educationCreateSchema } from "@/lib/validators/education";

/**
 * Locally derived from the frozen educationCreateSchema — end-after-start
 * is a form-level concern, not a base-model invariant, so it lives here
 * rather than in lib/validators/education.ts. Safe to import from client
 * code: unlike certification.ts, this validator has no models/* import.
 */
export const educationFormSchema = educationCreateSchema.refine(
  (data) => !data.endDate || data.endDate > data.startDate,
  {
    message: "End date must be after the start date.",
    path: ["endDate"],
  }
);
