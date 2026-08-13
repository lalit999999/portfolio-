import "server-only";
import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import { Social } from "@/models";
import type { SerializedSocial } from "@/types/models";

function serialize<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}

export async function getAdminSocials(): Promise<SerializedSocial[]> {
  await dbConnect();
  const docs = await Social.find().sort({ order: 1 }).lean();
  return serialize<SerializedSocial[]>(docs);
}

export async function getAdminSocial(id: string): Promise<SerializedSocial | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  await dbConnect();
  const doc = await Social.findById(id).lean();
  if (!doc) return null;
  return serialize<SerializedSocial>(doc);
}

export async function getNextSocialOrder(): Promise<number> {
  await dbConnect();
  const last = await Social.findOne().sort({ order: -1 }).select("order").lean();
  return last ? last.order + 1 : 0;
}
