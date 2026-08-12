import { unstable_cache } from "next/cache";
import dbConnect from "@/lib/db";
import { Profile } from "@/models";
import type { SerializedProfile } from "@/types/models";
import { serialize } from "./serialize";

export const getProfile = unstable_cache(
  async (): Promise<SerializedProfile | null> => {
    await dbConnect();
    const doc = await Profile.findOne({}).lean();
    return doc ? serialize<SerializedProfile>(doc) : null;
  },
  ["profile"],
  { tags: ["profiles"], revalidate: 3600 }
);
