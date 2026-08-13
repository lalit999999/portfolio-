import "server-only";
import { Types } from "mongoose";

import dbConnect from "@/lib/db";
import { Project } from "@/models";
import type { SerializedProject } from "@/types/models";
import { serialize } from "./serialize";

export async function listProjects(): Promise<SerializedProject[]> {
  await dbConnect();
  const docs = await Project.find({}).sort({ order: 1 }).lean();
  return serialize<SerializedProject[]>(docs);
}

export async function getProject(
  id: string
): Promise<SerializedProject | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  await dbConnect();
  const doc = await Project.findById(id).lean();
  return doc ? serialize<SerializedProject>(doc) : null;
}

export async function getProjectCategories(): Promise<string[]> {
  await dbConnect();
  const categories = await Project.distinct("category", {
    category: { $nin: [null, ""] },
  });
  return (categories as string[]).sort((a, b) => a.localeCompare(b));
}

export async function isProjectSlugAvailable(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  await dbConnect();
  const filter: Record<string, unknown> = { slug };
  if (excludeId && Types.ObjectId.isValid(excludeId)) {
    filter._id = { $ne: excludeId };
  }
  const existing = await Project.findOne(filter).select("_id").lean();
  return !existing;
}

export async function getNextProjectOrder(): Promise<number> {
  await dbConnect();
  const last = await Project.findOne({}).sort({ order: -1 }).select("order").lean();
  return last ? last.order + 1 : 0;
}
