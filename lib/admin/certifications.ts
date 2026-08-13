import "server-only";
import { Types } from "mongoose";

import dbConnect from "@/lib/db";
import { Certification } from "@/models";
import type { SerializedCertification } from "@/types/models";
import { serialize } from "./serialize";

export async function listCertifications(): Promise<SerializedCertification[]> {
  await dbConnect();
  const docs = await Certification.find({}).sort({ order: 1 }).lean();
  return serialize<SerializedCertification[]>(docs);
}

export async function getCertification(
  id: string
): Promise<SerializedCertification | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  await dbConnect();
  const doc = await Certification.findById(id).lean();
  return doc ? serialize<SerializedCertification>(doc) : null;
}

export async function getNextCertificationOrder(): Promise<number> {
  await dbConnect();
  const last = await Certification.findOne({})
    .sort({ order: -1 })
    .select("order")
    .lean();
  return last ? last.order + 1 : 0;
}
