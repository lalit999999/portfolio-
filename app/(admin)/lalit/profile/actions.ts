"use server";

import { requireAdmin } from "@/lib/admin/guard";
import { ok, fail, fromZodError } from "@/lib/admin/action";
import { revalidateCollection } from "@/lib/admin/revalidate";
import { profileCreateSchema, profileUpdateSchema } from "@/lib/validators/profile";
import dbConnect from "@/lib/db";
import { Profile } from "@/models";
import type { AdminActionState } from "@/types/admin";
import type { SerializedProfile } from "@/types/models";

function serialize<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}

export async function createProfile(
  values: unknown
): Promise<AdminActionState<SerializedProfile>> {
  await requireAdmin();

  const parsed = profileCreateSchema.safeParse(values);
  if (!parsed.success) return fromZodError(parsed.error);

  await dbConnect();

  const existing = await Profile.findOne().lean();
  if (existing) {
    return fail("CONFLICT", "A profile already exists. Edit it instead of creating a new one.");
  }

  const doc = await Profile.create(parsed.data);
  revalidateCollection("profiles");
  return ok(serialize<SerializedProfile>(doc.toObject()), "Profile created.");
}

export async function updateProfile(
  values: unknown
): Promise<AdminActionState<SerializedProfile>> {
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

  revalidateCollection("profiles");
  return ok(serialize<SerializedProfile>(existing.toObject()), "Profile updated.");
}

export async function setActiveResume(
  resumeUrl: string
): Promise<AdminActionState<SerializedProfile>> {
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

  revalidateCollection("profiles");
  return ok(serialize<SerializedProfile>(existing.toObject()), "Active resume updated.");
}
