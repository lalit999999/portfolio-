import { unstable_cache } from "next/cache";
import dbConnect from "@/lib/db";
import { Social } from "@/models";
import type { SerializedSocial } from "@/types/models";
import { serialize } from "./serialize";

export const getSocials = unstable_cache(
  async (): Promise<SerializedSocial[]> => {
    await dbConnect();
    const docs = await Social.find({ isVisible: true })
      .sort({ order: 1 })
      .lean();
    return serialize<SerializedSocial[]>(docs);
  },
  ["socials"],
  { tags: ["socials"], revalidate: 3600 }
);
