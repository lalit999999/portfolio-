"use server";

import { Types } from "mongoose";

import { requireAdmin } from "@/lib/admin/guard";
import { ok, fail, fromZodError } from "@/lib/admin/action";
import { updateTag } from "next/cache";
import { socialCreateSchema, socialUpdateSchema } from "@/lib/validators/social";
import { getNextSocialOrder } from "@/lib/admin/socials";
import dbConnect from "@/lib/db";
import { Social } from "@/models";
import type { AdminActionState } from "@/types/admin";
import type { SerializedSocial } from "@/types/models";

// lib/admin/revalidate.ts (Session A, frozen) still calls the deprecated
// single-argument revalidateTag(tag), which no longer compiles against
// Next 16's revalidateTag(tag, profile) signature. Calling updateTag directly
// here matches the old single-arg semantics (immediate expiration,
// read-your-own-writes) without touching that frozen file.

function serialize<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}

// See the comment in profile/actions.ts: fail()/fromZodError() return the base
// AdminActionState (unknown), which isn't assignable into a narrower
// AdminActionState<X> annotation, so these stay untyped on the generic — no caller
// reads `.data` for these actions anyway.
export async function createSocial(values: unknown): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = socialCreateSchema.safeParse(values);
  if (!parsed.success) return fromZodError(parsed.error);

  await dbConnect();
  const order = parsed.data.order ?? (await getNextSocialOrder());
  const doc = await Social.create({ ...parsed.data, order });

  updateTag("socials");
  return ok(serialize<SerializedSocial>(doc.toObject()), "Social link created.");
}

export async function updateSocial(id: string, values: unknown): Promise<AdminActionState> {
  await requireAdmin();

  if (!Types.ObjectId.isValid(id)) {
    return fail("VALIDATION_ERROR", "Invalid social id.");
  }

  const parsed = socialUpdateSchema.safeParse(values);
  if (!parsed.success) return fromZodError(parsed.error);

  await dbConnect();
  const doc = await Social.findByIdAndUpdate(id, parsed.data, { new: true });
  if (!doc) return fail("NOT_FOUND", "Social link not found.");

  updateTag("socials");
  return ok(serialize<SerializedSocial>(doc.toObject()), "Social link updated.");
}

export async function deleteSocial(id: string): Promise<AdminActionState> {
  await requireAdmin();

  if (!Types.ObjectId.isValid(id)) {
    return fail("VALIDATION_ERROR", "Invalid social id.");
  }

  await dbConnect();
  const doc = await Social.findByIdAndDelete(id);
  if (!doc) return fail("NOT_FOUND", "Social link not found.");

  updateTag("socials");
  return ok(undefined, "Social link deleted.");
}

export async function reorderSocials(ids: string[]): Promise<AdminActionState> {
  await requireAdmin();

  if (!ids.every((id) => Types.ObjectId.isValid(id))) {
    return fail("VALIDATION_ERROR", "Invalid social id in reorder list.");
  }

  await dbConnect();
  await Promise.all(
    ids.map((id, index) => Social.findByIdAndUpdate(id, { order: index }))
  );

  updateTag("socials");
  return ok(undefined, "Order updated.");
}
