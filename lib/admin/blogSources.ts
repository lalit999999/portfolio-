import "server-only";
import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import { BlogSource } from "@/models";
import type { SerializedBlogSource } from "@/types/models";

function serialize<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}

export async function getAdminBlogSources(): Promise<SerializedBlogSource[]> {
  await dbConnect();
  const docs = await BlogSource.find().sort({ order: 1 }).lean();
  return serialize<SerializedBlogSource[]>(docs);
}

export async function getAdminBlogSource(
  id: string
): Promise<SerializedBlogSource | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  await dbConnect();
  const doc = await BlogSource.findById(id).lean();
  if (!doc) return null;
  return serialize<SerializedBlogSource>(doc);
}

export async function getNextBlogSourceOrder(): Promise<number> {
  await dbConnect();
  const last = await BlogSource.findOne().sort({ order: -1 }).select("order").lean();
  return last ? last.order + 1 : 0;
}

export async function countActiveBlogSources(excludeId?: string): Promise<number> {
  await dbConnect();
  const filter: Record<string, unknown> = { isActive: true };
  if (excludeId) filter._id = { $ne: excludeId };
  return BlogSource.countDocuments(filter);
}
