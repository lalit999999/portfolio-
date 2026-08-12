import { unstable_cache } from "next/cache";
import dbConnect from "@/lib/db";
import { Project } from "@/models";
import { serialize } from "./serialize";

export const getProjects = unstable_cache(
  async (opts: { featured?: boolean; limit?: number } = {}) => {
    await dbConnect();
    const filter: Record<string, unknown> = { isVisible: true };
    if (opts.featured !== undefined) filter.featured = opts.featured;

    let query = Project.find(filter).sort({ order: 1 });
    if (opts.limit) query = query.limit(opts.limit);

    const docs = await query.lean();
    return serialize(docs);
  },
  ["projects"],
  { tags: ["projects"], revalidate: 3600 }
);

export const getProjectBySlug = unstable_cache(
  async (slug: string) => {
    await dbConnect();
    const doc = await Project.findOne({ slug, isVisible: true }).lean();
    return doc ? serialize(doc) : null;
  },
  ["project-by-slug"],
  { tags: ["projects"], revalidate: 3600 }
);
