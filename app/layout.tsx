import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import { getBlogSources, getProfile, getProjects, getSocials } from "@/lib/data";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { CommandPalette } from "@/components/site/command-palette";
import { DotGridBackground } from "@/components/site/dot-grid-background";
import { Toaster } from "@/components/ui/sonner";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  const name = profile?.name ?? "Portfolio";
  const description = profile?.tagline ?? "Personal portfolio and blog.";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: name,
      template: `%s | ${name}`,
    },
    description,
    openGraph: {
      title: name,
      description,
      url: siteUrl,
      siteName: name,
      type: "website",
      images: profile?.avatarUrl ? [{ url: profile.avatarUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
      images: profile?.avatarUrl ? [profile.avatarUrl] : undefined,
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [profile, socials, projects, blogSources] = await Promise.all([
    getProfile(),
    getSocials(),
    getProjects(),
    getBlogSources(),
  ]);

  const showBlogs = blogSources.some((source) => source.isActive);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={cn(
        "h-full",
        "antialiased",
        fontSans.variable,
        fontMono.variable,
        fontDisplay.variable
      )}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
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
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
