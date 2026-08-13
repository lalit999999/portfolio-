import type { z } from "zod";

import type { AdminActionState, AdminErrorCode } from "@/types/admin";

export function ok<T>(data?: T, message?: string): AdminActionState<T> {
  return { status: "success", data, message };
}

export function fail(
  code: AdminErrorCode,
  message: string,
  fields?: Record<string, string[]>
): AdminActionState {
  return { status: "error", code, message, fields };
}

export function fromZodError(err: z.ZodError): AdminActionState {
  const fields: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_root";
    (fields[key] ??= []).push(issue.message);
  }
  return fail("VALIDATION_ERROR", "Check the highlighted fields.", fields);
}
