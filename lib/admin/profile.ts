import "server-only";
import dbConnect from "@/lib/db";
import { Profile } from "@/models";
import type { SerializedProfile } from "@/types/models";

function serialize<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}

export async function getAdminProfile(): Promise<SerializedProfile | null> {
  await dbConnect();
  const doc = await Profile.findOne().lean();
  if (!doc) return null;
  return serialize<SerializedProfile>(doc);
}
