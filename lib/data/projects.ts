import { unstable_cache } from "next/cache";
import dbConnect from "@/lib/db";
import { Project } from "@/models";
import type { SerializedProject } from "@/types/models";
import { serialize } from "./serialize";

export const getProjects = unstable_cache(
  async (
    opts: { featured?: boolean; limit?: number } = {}
  ): Promise<SerializedProject[]> => {
    await dbConnect();
    const filter: Record<string, unknown> = { isVisible: true };
    if (opts.featured !== undefined) filter.featured = opts.featured;

    let query = Project.find(filter).sort({ order: 1 });
    if (opts.limit) query = query.limit(opts.limit);

    const docs = await query.lean();
    return serialize<SerializedProject[]>(docs);
  },
  ["projects"],
  { tags: ["projects"], revalidate: 3600 }
);

export const getProjectBySlug = unstable_cache(
  async (slug: string): Promise<SerializedProject | null> => {
    await dbConnect();
    const doc = await Project.findOne({ slug, isVisible: true }).lean();
    return doc ? serialize<SerializedProject>(doc) : null;
  },
  ["project-by-slug"],
  { tags: ["projects"], revalidate: 3600 }
);

/** Slugs only — keeps generateStaticParams from pulling whole documents. */
export const getProjectSlugs = unstable_cache(
  async (): Promise<string[]> => {
    await dbConnect();
    const docs = await Project.find({ isVisible: true })
      .select("slug")
      .lean();
    return docs.map((doc) => doc.slug);
  },
  ["project-slugs"],
  { tags: ["projects"], revalidate: 3600 }
);

/**
 * Prev/next by the `order` field. Ends return null on that side rather than
 * wrapping around — order is a curated sequence, not a ring.
 */
export const getAdjacentProjects = unstable_cache(
  async (
    slug: string
  ): Promise<{
    prev: SerializedProject | null;
    next: SerializedProject | null;
  }> => {
    await dbConnect();
    const current = await Project.findOne({ slug, isVisible: true })
      .select("order")
      .lean();
    if (!current) return { prev: null, next: null };

    const [prevDoc, nextDoc] = await Promise.all([
      Project.findOne({ isVisible: true, order: { $lt: current.order } })
        .sort({ order: -1 })
        .lean(),
      Project.findOne({ isVisible: true, order: { $gt: current.order } })
        .sort({ order: 1 })
        .lean(),
    ]);

    return {
      prev: prevDoc ? serialize<SerializedProject>(prevDoc) : null,
      next: nextDoc ? serialize<SerializedProject>(nextDoc) : null,
    };
  },
  ["adjacent-projects"],
  { tags: ["projects"], revalidate: 3600 }
);
