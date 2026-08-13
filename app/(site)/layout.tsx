import type * as React from "react";

import { getBlogSources, getProfile, getProjects, getSocials } from "@/lib/data";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { CommandPalette } from "@/components/site/command-palette";
import { DotGridBackground } from "@/components/site/dot-grid-background";

// Route-group-only layouts have no URL segment of their own, so Next's typed-routes
// generator doesn't emit a LayoutRoutes entry for them — hand-write the props type.
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, socials, projects, blogSources] = await Promise.all([
    getProfile(),
    getSocials(),
    getProjects(),
    getBlogSources(),
  ]);

  const showBlogs = blogSources.some((source) => source.isActive);

  return (
    <>
      <DotGridBackground />
      <Navbar />
      <main id="top" className="flex-1">
        {children}
      </main>
      <Footer profile={profile} socials={socials} showBlogs={showBlogs} />
      <CommandPalette
        projects={projects}
        socials={socials}
        resumeUrl={profile?.resumeUrl}
        showBlogs={showBlogs}
      />
    </>
  );
}
