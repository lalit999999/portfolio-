"use server";

import { requireAdmin } from "@/lib/admin/guard";
import { ok, fail, fromZodError } from "@/lib/admin/action";
import { updateTag } from "next/cache";
import { profileCreateSchema, profileUpdateSchema } from "@/lib/validators/profile";
import dbConnect from "@/lib/db";
import { Profile } from "@/models";
import type { AdminActionState } from "@/types/admin";
import type { SerializedProfile } from "@/types/models";

// lib/admin/revalidate.ts (Session A, frozen) still calls the deprecated
// single-argument revalidateTag(tag), which no longer compiles against
// Next 16's revalidateTag(tag, profile) signature. Calling updateTag directly
// here matches the old single-arg semantics (immediate expiration,
// read-your-own-writes) without touching that frozen file.

function serialize<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}

// Return type is the base AdminActionState, not AdminActionState<SerializedProfile>:
// fail()/fromZodError() in lib/admin/action.ts (frozen, Session A) aren't generic, so
// their AdminActionState<unknown> result isn't structurally assignable into a more
// specific AdminActionState<X> return annotation. ok(...) below still produces a
// properly-typed success payload — nothing here actually reads `.data` client-side.
export async function createProfile(values: unknown): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = profileCreateSchema.safeParse(values);
  if (!parsed.success) return fromZodError(parsed.error);

  await dbConnect();

  const existing = await Profile.findOne().lean();
  if (existing) {
    return fail("CONFLICT", "A profile already exists. Edit it instead of creating a new one.");
  }

  const doc = await Profile.create(parsed.data);
  updateTag("profiles");
  return ok(serialize<SerializedProfile>(doc.toObject()), "Profile created.");
}

export async function updateProfile(values: unknown): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = profileUpdateSchema.safeParse(values);
  if (!parsed.success) return fromZodError(parsed.error);

  await dbConnect();

  const existing = await Profile.findOne();
  if (!existing) {
    return fail("NOT_FOUND", "No profile exists yet. Create one first.");
  }

  existing.set(parsed.data);
  await existing.save();

  updateTag("profiles");
  return ok(serialize<SerializedProfile>(existing.toObject()), "Profile updated.");
}

export async function setActiveResume(resumeUrl: string): Promise<AdminActionState> {
  await requireAdmin();

  if (!resumeUrl || typeof resumeUrl !== "string") {
    return fail("VALIDATION_ERROR", "A resume URL is required.");
  }

  await dbConnect();

  const existing = await Profile.findOne();
  if (!existing) {
    return fail("NOT_FOUND", "No profile exists yet. Create one first.");
  }

  existing.resumeUrl = resumeUrl;
  await existing.save();

  updateTag("profiles");
  return ok(serialize<SerializedProfile>(existing.toObject()), "Active resume updated.");
}
