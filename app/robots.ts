import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /lalit is the admin panel (obscure-by-design, see CLAUDE.md) and
      // /api is server-only routes — neither belongs in a search index.
      disallow: ["/lalit", "/api"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
