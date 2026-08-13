"use server";

import { Types } from "mongoose";

import dbConnect from "@/lib/db";
import { Education } from "@/models";
import { requireAdmin } from "@/lib/admin/guard";
import { revalidateCollection } from "@/lib/admin/revalidate";
import { ok, fail, fromZodError } from "@/lib/admin/action";
import type { AdminActionState } from "@/types/admin";

import { educationFormSchema } from "./schema";

export async function createEducation(values: unknown): Promise<AdminActionState> {
  await requireAdmin();
  const parsed = educationFormSchema.safeParse(values);
  if (!parsed.success) return fromZodError(parsed.error);

  await dbConnect();
  const doc = await Education.create(parsed.data);
  revalidateCollection("educations");
  return ok({ id: String(doc._id) }, "Education entry created.");
}

export async function updateEducation(
  id: string,
  values: unknown
): Promise<AdminActionState> {
  await requireAdmin();
  if (!Types.ObjectId.isValid(id)) return fail("NOT_FOUND", "Entry not found.");

  const parsed = educationFormSchema.safeParse(values);
  if (!parsed.success) return fromZodError(parsed.error);

  await dbConnect();
  const doc = await Education.findByIdAndUpdate(id, parsed.data, {
    new: true,
    runValidators: true,
  });
  if (!doc) return fail("NOT_FOUND", "Entry not found.");

  revalidateCollection("educations");
  return ok({ id: String(doc._id) }, "Education entry updated.");
}

export async function deleteEducation(id: string): Promise<AdminActionState> {
  await requireAdmin();
  if (!Types.ObjectId.isValid(id)) return fail("NOT_FOUND", "Entry not found.");

  await dbConnect();
  const doc = await Education.findByIdAndDelete(id);
  if (!doc) return fail("NOT_FOUND", "Entry not found.");

  revalidateCollection("educations");
  return ok(undefined, "Education entry deleted.");
}

export async function toggleEducationVisibility(
  id: string
): Promise<AdminActionState> {
  await requireAdmin();
  if (!Types.ObjectId.isValid(id)) return fail("NOT_FOUND", "Entry not found.");

  await dbConnect();
  const doc = await Education.findById(id);
  if (!doc) return fail("NOT_FOUND", "Entry not found.");

  doc.isVisible = !doc.isVisible;
  await doc.save();

  revalidateCollection("educations");
  return ok({ isVisible: doc.isVisible });
}
