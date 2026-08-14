import type { MetadataRoute } from "next";
import { getProjectSlugs } from "@/lib/data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const staticRoutes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/projects", changeFrequency: "weekly", priority: 0.9 },
  { path: "/skills", changeFrequency: "monthly", priority: 0.6 },
  { path: "/certifications", changeFrequency: "monthly", priority: 0.6 },
  { path: "/blogs", changeFrequency: "weekly", priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
  { path: "/playground", changeFrequency: "daily", priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // An Atlas blip here must not fail the build — fall back to the static
  // routes alone rather than throwing.
  let slugs: string[] = [];
  try {
    slugs = await getProjectSlugs();
  } catch {
    slugs = [];
  }

  const projectEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${siteUrl}/projects/${slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticEntries, ...projectEntries];
}
