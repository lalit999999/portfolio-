import { unstable_cache } from "next/cache";
import dbConnect from "@/lib/db";
import { Education } from "@/models";
import { serialize } from "./serialize";

export const getEducation = unstable_cache(
  async () => {
    await dbConnect();
    const docs = await Education.find({ isVisible: true })
      .sort({ order: 1 })
      .lean();
    return serialize(docs);
  },
  ["education"],
  { tags: ["educations"], revalidate: 3600 }
);
