import { unstable_cache } from "next/cache";
import dbConnect from "@/lib/db";
import { BlogSource } from "@/models";
import type { SerializedBlogSource } from "@/types/models";
import { serialize } from "./serialize";

export const getBlogSources = unstable_cache(
  async (): Promise<SerializedBlogSource[]> => {
    await dbConnect();
    const docs = await BlogSource.find({ isVisible: true })
      .sort({ order: 1 })
      .lean();
    return serialize<SerializedBlogSource[]>(docs);
  },
  ["blog-sources"],
  { tags: ["blogsources"], revalidate: 3600 }
);
