import { unstable_cache } from "next/cache";
import dbConnect from "@/lib/db";
import { Social } from "@/models";
import { serialize } from "./serialize";

export const getSocials = unstable_cache(
  async () => {
    await dbConnect();
    const docs = await Social.find({ isVisible: true })
      .sort({ order: 1 })
      .lean();
    return serialize(docs);
  },
  ["socials"],
  { tags: ["socials"], revalidate: 3600 }
);
