import { unstable_cache } from "next/cache";
import dbConnect from "@/lib/db";
import { Profile } from "@/models";
import { serialize } from "./serialize";

export const getProfile = unstable_cache(
  async () => {
    await dbConnect();
    const doc = await Profile.findOne({}).lean();
    return doc ? serialize(doc) : null;
  },
  ["profile"],
  { tags: ["profiles"], revalidate: 3600 }
);
