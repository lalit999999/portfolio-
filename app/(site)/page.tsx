import type { Metadata } from "next";

import {
  getBlogPosts,
  getBlogSources,
  getEducation,
  getProfile,
  getProjects,
  getSocials,
} from "@/lib/data";
import { About } from "@/components/portfolio/about";
import { ContactCta } from "@/components/portfolio/contact-cta";
import { Education } from "@/components/portfolio/education";
import { FeaturedProjects } from "@/components/portfolio/featured-projects";
import { Hero } from "@/components/portfolio/hero";
import { LatestPosts } from "@/components/portfolio/latest-posts";
import { Learning } from "@/components/portfolio/learning";
import { Socials } from "@/components/portfolio/socials";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  return {
    title: profile?.name ?? "Portfolio",
    description: profile?.tagline ?? "Personal portfolio and blog.",
  };
}

export default async function Home() {
  const [profile, education, featuredProjects, posts, blogSources, socials] =
    await Promise.all([
      getProfile(),
      getEducation(),
      getProjects({ featured: true, limit: 3 }),
      getBlogPosts({ limit: 3 }),
      getBlogSources(),
      getSocials(),
    ]);

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-32 text-center text-muted-foreground">
        Profile data is unavailable.
      </div>
    );
  }

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    description: profile.tagline,
    url: siteUrl,
    ...(profile.avatarUrl && { image: profile.avatarUrl }),
    ...(profile.email && { email: profile.email }),
    ...(profile.location && { address: profile.location }),
    ...(socials.length > 0 && { sameAs: socials.map((social) => social.url) }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <Hero profile={profile} />
      <About profile={profile} />
      <Education education={education} />
      <Learning profile={profile} />
      <FeaturedProjects projects={featuredProjects} />
      <LatestPosts posts={posts} sources={blogSources} />
      <Socials socials={socials} />
      <ContactCta />
    </>
  );
}
