"use server";

import { Types } from "mongoose";

import dbConnect from "@/lib/db";
import { Skill, SkillCategory } from "@/models";
import {
  skillCreateSchema,
  skillUpdateSchema,
} from "@/lib/validators/skill";
import {
  skillCategoryCreateSchema,
  skillCategoryUpdateSchema,
} from "@/lib/validators/skillCategory";
import { requireAdmin } from "@/lib/admin/guard";
import { revalidateCollection } from "@/lib/admin/revalidate";
import { ok, fail, fromZodError } from "@/lib/admin/action";
import {
  countSkillsInCategory,
  isSkillCategorySlugAvailable,
} from "@/lib/admin/skills";
import type { AdminActionState } from "@/types/admin";

function isDuplicateKeyError(err: unknown): boolean {
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

// ---- Skill categories ----

export async function createSkillCategory(
  values: unknown
): Promise<AdminActionState> {
  await requireAdmin();
  const parsed = skillCategoryCreateSchema.safeParse(values);
  if (!parsed.success) return fromZodError(parsed.error);

  await dbConnect();
  try {
    const doc = await SkillCategory.create(parsed.data);
    revalidateCollection("skillcategories", "skills");
    return ok({ id: String(doc._id) }, "Category created.");
  } catch (err) {
    if (isDuplicateKeyError(err)) return slugConflict();
    throw err;
  }
}

export async function updateSkillCategory(
  id: string,
  values: unknown
): Promise<AdminActionState> {
  await requireAdmin();
  if (!Types.ObjectId.isValid(id)) return fail("NOT_FOUND", "Category not found.");

  const parsed = skillCategoryUpdateSchema.safeParse(values);
  if (!parsed.success) return fromZodError(parsed.error);

  await dbConnect();
  try {
    const doc = await SkillCategory.findByIdAndUpdate(id, parsed.data, {
      new: true,
      runValidators: true,
    });
    if (!doc) return fail("NOT_FOUND", "Category not found.");
    revalidateCollection("skillcategories", "skills");
    return ok({ id: String(doc._id) }, "Category updated.");
  } catch (err) {
    if (isDuplicateKeyError(err)) return slugConflict();
    throw err;
  }
}

export async function deleteSkillCategory(id: string): Promise<AdminActionState> {
  await requireAdmin();
  if (!Types.ObjectId.isValid(id)) return fail("NOT_FOUND", "Category not found.");

  const count = await countSkillsInCategory(id);
  if (count > 0) {
    return fail(
      "CONFLICT",
      `Move or delete its ${count} skill${count === 1 ? "" : "s"} first.`
    );
  }

  await dbConnect();
  const doc = await SkillCategory.findByIdAndDelete(id);
  if (!doc) return fail("NOT_FOUND", "Category not found.");

  revalidateCollection("skillcategories", "skills");
  return ok(undefined, "Category deleted.");
}

export async function toggleSkillCategoryVisibility(
  id: string
): Promise<AdminActionState> {
  await requireAdmin();
  if (!Types.ObjectId.isValid(id)) return fail("NOT_FOUND", "Category not found.");

  await dbConnect();
  const doc = await SkillCategory.findById(id);
  if (!doc) return fail("NOT_FOUND", "Category not found.");

  doc.isVisible = !doc.isVisible;
  await doc.save();

  revalidateCollection("skillcategories", "skills");
  return ok({ isVisible: doc.isVisible });
}

export async function checkSkillCategorySlugAvailable(
  slug: string,
  excludeId?: string
): Promise<AdminActionState<{ available: boolean }>> {
  await requireAdmin();
  const available = await isSkillCategorySlugAvailable(slug, excludeId);
  return ok({ available });
}

// ---- Skills ----

export async function createSkill(values: unknown): Promise<AdminActionState> {
  await requireAdmin();
  const parsed = skillCreateSchema.safeParse(values);
  if (!parsed.success) return fromZodError(parsed.error);

  await dbConnect();
  const doc = await Skill.create(parsed.data);
  revalidateCollection("skillcategories", "skills");
  return ok({ id: String(doc._id) }, "Skill created.");
}

export async function updateSkill(
  id: string,
  values: unknown
): Promise<AdminActionState> {
  await requireAdmin();
  if (!Types.ObjectId.isValid(id)) return fail("NOT_FOUND", "Skill not found.");

  const parsed = skillUpdateSchema.safeParse(values);
  if (!parsed.success) return fromZodError(parsed.error);

  await dbConnect();
  const doc = await Skill.findByIdAndUpdate(id, parsed.data, {
    new: true,
    runValidators: true,
  });
  if (!doc) return fail("NOT_FOUND", "Skill not found.");

  revalidateCollection("skillcategories", "skills");
  return ok({ id: String(doc._id) }, "Skill updated.");
}

export async function deleteSkill(id: string): Promise<AdminActionState> {
  await requireAdmin();
  if (!Types.ObjectId.isValid(id)) return fail("NOT_FOUND", "Skill not found.");

  await dbConnect();
  const doc = await Skill.findByIdAndDelete(id);
  if (!doc) return fail("NOT_FOUND", "Skill not found.");

  revalidateCollection("skillcategories", "skills");
  return ok(undefined, "Skill deleted.");
}

export async function toggleSkillVisibility(id: string): Promise<AdminActionState> {
  await requireAdmin();
  if (!Types.ObjectId.isValid(id)) return fail("NOT_FOUND", "Skill not found.");

  await dbConnect();
  const doc = await Skill.findById(id);
  if (!doc) return fail("NOT_FOUND", "Skill not found.");

  doc.isVisible = !doc.isVisible;
  await doc.save();

  revalidateCollection("skillcategories", "skills");
  return ok({ isVisible: doc.isVisible });
}
