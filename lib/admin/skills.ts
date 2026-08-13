import "server-only";
import { Types } from "mongoose";

import dbConnect from "@/lib/db";
import { Skill, SkillCategory } from "@/models";
import type { SerializedSkill, SerializedSkillCategory } from "@/types/models";
import { serialize } from "./serialize";

export async function listSkillCategories(): Promise<SerializedSkillCategory[]> {
  await dbConnect();
  const docs = await SkillCategory.find({}).sort({ order: 1 }).lean();
  return serialize<SerializedSkillCategory[]>(docs);
}

export async function getSkillCategory(
  id: string
): Promise<SerializedSkillCategory | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  await dbConnect();
  const doc = await SkillCategory.findById(id).lean();
  return doc ? serialize<SerializedSkillCategory>(doc) : null;
}

export async function listSkills(): Promise<SerializedSkill[]> {
  await dbConnect();
  const docs = await Skill.find({}).sort({ order: 1 }).lean();
  return serialize<SerializedSkill[]>(docs);
}

export async function getSkill(id: string): Promise<SerializedSkill | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  await dbConnect();
  const doc = await Skill.findById(id).lean();
  return doc ? serialize<SerializedSkill>(doc) : null;
}

export async function isSkillCategorySlugAvailable(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  await dbConnect();
  const filter: Record<string, unknown> = { slug };
  if (excludeId && Types.ObjectId.isValid(excludeId)) {
    filter._id = { $ne: excludeId };
  }
  const existing = await SkillCategory.findOne(filter).select("_id").lean();
  return !existing;
}

export async function countSkillsInCategory(categoryId: string): Promise<number> {
  if (!Types.ObjectId.isValid(categoryId)) return 0;
  await dbConnect();
  return Skill.countDocuments({ category: categoryId });
}

export async function getNextSkillCategoryOrder(): Promise<number> {
  await dbConnect();
  const last = await SkillCategory.findOne({})
    .sort({ order: -1 })
    .select("order")
    .lean();
  return last ? last.order + 1 : 0;
}

export async function getNextSkillOrder(categoryId: string): Promise<number> {
  await dbConnect();
  const last = await Skill.findOne({ category: categoryId })
    .sort({ order: -1 })
    .select("order")
    .lean();
  return last ? last.order + 1 : 0;
}
