"use server";

import { Types } from "mongoose";

import dbConnect from "@/lib/db";
import { Project } from "@/models";
import {
  projectCreateSchema,
  projectUpdateSchema,
} from "@/lib/validators/project";
import { requireAdmin } from "@/lib/admin/guard";
import { revalidateCollection } from "@/lib/admin/revalidate";
import { ok, fail, fromZodError } from "@/lib/admin/action";
import { getNextProjectOrder, isProjectSlugAvailable } from "@/lib/admin/projects";
import type { AdminActionState } from "@/types/admin";

function isDuplicateKeyError(
  err: unknown
): err is { code: number; keyPattern?: Record<string, unknown> } {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === 11000
  );
}

const slugConflict = () =>
  fail("CONFLICT", "That slug is already in use.", {
    slug: ["That slug is already in use."],
  });

export async function createProject(values: unknown): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = projectCreateSchema.safeParse(values);
  if (!parsed.success) return fromZodError(parsed.error);

  await dbConnect();
  try {
    const doc = await Project.create(parsed.data);
    revalidateCollection("projects");
    return ok({ id: String(doc._id) }, "Project created.");
  } catch (err) {
    if (isDuplicateKeyError(err)) return slugConflict();
    throw err;
  }
}

export async function updateProject(
  id: string,
  values: unknown
): Promise<AdminActionState> {
  await requireAdmin();
  if (!Types.ObjectId.isValid(id)) return fail("NOT_FOUND", "Project not found.");

  const parsed = projectUpdateSchema.safeParse(values);
  if (!parsed.success) return fromZodError(parsed.error);

  await dbConnect();
  try {
    const doc = await Project.findByIdAndUpdate(id, parsed.data, {
      new: true,
      runValidators: true,
    });
    if (!doc) return fail("NOT_FOUND", "Project not found.");
    revalidateCollection("projects");
    return ok({ id: String(doc._id) }, "Project updated.");
  } catch (err) {
    if (isDuplicateKeyError(err)) return slugConflict();
    throw err;
  }
}

export async function deleteProject(id: string): Promise<AdminActionState> {
  await requireAdmin();
  if (!Types.ObjectId.isValid(id)) return fail("NOT_FOUND", "Project not found.");

  await dbConnect();
  const doc = await Project.findByIdAndDelete(id);
  if (!doc) return fail("NOT_FOUND", "Project not found.");

  revalidateCollection("projects");
  return ok(undefined, "Project deleted.");
}

export async function toggleProjectVisibility(
  id: string
): Promise<AdminActionState> {
  await requireAdmin();
  if (!Types.ObjectId.isValid(id)) return fail("NOT_FOUND", "Project not found.");

  await dbConnect();
  const doc = await Project.findById(id);
  if (!doc) return fail("NOT_FOUND", "Project not found.");

  doc.isVisible = !doc.isVisible;
  await doc.save();

  revalidateCollection("projects");
  return ok({ isVisible: doc.isVisible });
}

export async function toggleProjectFeatured(
  id: string
): Promise<AdminActionState> {
  await requireAdmin();
  if (!Types.ObjectId.isValid(id)) return fail("NOT_FOUND", "Project not found.");

  await dbConnect();
  const doc = await Project.findById(id);
  if (!doc) return fail("NOT_FOUND", "Project not found.");

  doc.featured = !doc.featured;
  await doc.save();

  revalidateCollection("projects");
  return ok({ featured: doc.featured });
}

export async function duplicateProject(id: string): Promise<AdminActionState> {
  await requireAdmin();
  if (!Types.ObjectId.isValid(id)) return fail("NOT_FOUND", "Project not found.");

  await dbConnect();
  const original = await Project.findById(id).lean();
  if (!original) return fail("NOT_FOUND", "Project not found.");

  let slug = `${original.slug}-copy`;
  let suffix = 2;
  while (!(await isProjectSlugAvailable(slug))) {
    slug = `${original.slug}-copy-${suffix}`;
    suffix += 1;
  }

  const order = await getNextProjectOrder();
  const created = await Project.create({
    title: original.title,
    slug,
    summary: original.summary,
    description: original.description,
    tech: original.tech,
    category: original.category,
    imageUrl: original.imageUrl,
    githubUrl: original.githubUrl,
    liveUrl: original.liveUrl,
    featured: original.featured,
    startDate: original.startDate,
    order,
    isVisible: false,
  });

  revalidateCollection("projects");
  return ok({ id: String(created._id) }, "Project duplicated.");
}

export async function checkSlugAvailable(
  slug: string,
  excludeId?: string
): Promise<AdminActionState<{ available: boolean }>> {
  await requireAdmin();
  await dbConnect();
  const available = await isProjectSlugAvailable(slug, excludeId);
  return ok({ available });
}
