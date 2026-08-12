import { unstable_cache } from "next/cache";
import dbConnect from "@/lib/db";
import { Education } from "@/models";
import type { SerializedEducation } from "@/types/models";
import { serialize } from "./serialize";

export const getEducation = unstable_cache(
  async (): Promise<SerializedEducation[]> => {
    await dbConnect();
    const docs = await Education.find({ isVisible: true })
      .sort({ order: 1 })
      .lean();
    return serialize<SerializedEducation[]>(docs);
  },
  ["education"],
  { tags: ["educations"], revalidate: 3600 }
);
