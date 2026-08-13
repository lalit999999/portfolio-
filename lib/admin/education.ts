import "server-only";
import { Types } from "mongoose";

import dbConnect from "@/lib/db";
import { Education } from "@/models";
import type { SerializedEducation } from "@/types/models";
import { serialize } from "./serialize";

export async function listEducation(): Promise<SerializedEducation[]> {
  await dbConnect();
  const docs = await Education.find({}).sort({ order: 1 }).lean();
  return serialize<SerializedEducation[]>(docs);
}

export async function getEducation(
  id: string
): Promise<SerializedEducation | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  await dbConnect();
  const doc = await Education.findById(id).lean();
  return doc ? serialize<SerializedEducation>(doc) : null;
}

export async function getNextEducationOrder(): Promise<number> {
  await dbConnect();
  const last = await Education.findOne({})
    .sort({ order: -1 })
    .select("order")
    .lean();
  return last ? last.order + 1 : 0;
}
