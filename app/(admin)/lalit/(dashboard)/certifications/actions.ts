"use server";

import { Types } from "mongoose";

import dbConnect from "@/lib/db";
import { Certification } from "@/models";
import { requireAdmin } from "@/lib/admin/guard";
import { revalidateCollection } from "@/lib/admin/revalidate";
import { ok, fail, fromZodError } from "@/lib/admin/action";
import type { AdminActionState } from "@/types/admin";

import { certificationFormSchema } from "./schema";

export async function createCertification(
  values: unknown
): Promise<AdminActionState> {
  await requireAdmin();
  const parsed = certificationFormSchema.safeParse(values);
  if (!parsed.success) return fromZodError(parsed.error);

  await dbConnect();
  const doc = await Certification.create(parsed.data);
  revalidateCollection("certifications");
  return ok({ id: String(doc._id) }, "Certification created.");
}

export async function updateCertification(
  id: string,
  values: unknown
): Promise<AdminActionState> {
  await requireAdmin();
  if (!Types.ObjectId.isValid(id)) return fail("NOT_FOUND", "Certification not found.");

  const parsed = certificationFormSchema.safeParse(values);
  if (!parsed.success) return fromZodError(parsed.error);

  await dbConnect();
  const doc = await Certification.findByIdAndUpdate(id, parsed.data, {
    new: true,
    runValidators: true,
  });
  if (!doc) return fail("NOT_FOUND", "Certification not found.");

  revalidateCollection("certifications");
  return ok({ id: String(doc._id) }, "Certification updated.");
}

export async function deleteCertification(id: string): Promise<AdminActionState> {
  await requireAdmin();
  if (!Types.ObjectId.isValid(id)) return fail("NOT_FOUND", "Certification not found.");

  await dbConnect();
  const doc = await Certification.findByIdAndDelete(id);
  if (!doc) return fail("NOT_FOUND", "Certification not found.");

  revalidateCollection("certifications");
  return ok(undefined, "Certification deleted.");
}

export async function toggleCertificationVisibility(
  id: string
): Promise<AdminActionState> {
  await requireAdmin();
  if (!Types.ObjectId.isValid(id)) return fail("NOT_FOUND", "Certification not found.");

  await dbConnect();
  const doc = await Certification.findById(id);
  if (!doc) return fail("NOT_FOUND", "Certification not found.");

  doc.isVisible = !doc.isVisible;
  await doc.save();

  revalidateCollection("certifications");
  return ok({ isVisible: doc.isVisible });
}
