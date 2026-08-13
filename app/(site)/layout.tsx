import { getBlogSources, getProfile, getProjects, getSocials } from "@/lib/data";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { CommandPalette } from "@/components/site/command-palette";
import { DotGridBackground } from "@/components/site/dot-grid-background";

export default async function SiteLayout({ children }: LayoutProps<"/(site)">) {
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
