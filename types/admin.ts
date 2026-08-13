// FROZEN CONTRACT — Phase 4 Step 0. All three sessions read this. Nobody edits it during Phase 4.

export type AdminErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "SERVER_ERROR";

export type AdminActionState<T = unknown> =
  | { status: "idle" }
  | { status: "success"; data?: T; message?: string }
  | {
      status: "error";
      code: AdminErrorCode;
      message: string;
      fields?: Record<string, string[]>;
    };

export const ADMIN_COLLECTIONS = [
  "projects",
  "skills",
  "skillcategories",
  "certifications",
  "educations",
  "socials",
  "blogsources",
  "blogposts",
] as const;
export type AdminCollection = (typeof ADMIN_COLLECTIONS)[number];

export interface ReorderRequest {
  collection: AdminCollection;
  ids: string[];
}

export interface ReorderResponse {
  ok: boolean;
  updated?: number;
  error?: { code: AdminErrorCode; message: string };
}

export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  resourceType: "image" | "raw";
}

export interface AdminStatCard {
  key: string;
  label: string;
  value: number;
  hint?: string;
  href?: string;
}
