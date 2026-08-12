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

  return (
    <>
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
