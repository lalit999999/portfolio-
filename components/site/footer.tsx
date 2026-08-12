import type { Route } from "next";
import Link from "next/link";
import { ArrowUp, Download } from "lucide-react";

import type { SerializedProfile, SerializedSocial } from "@/types/models";
import { getBrandIcon, getIcon } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface FooterProps {
  profile: SerializedProfile | null;
  socials: SerializedSocial[];
  showBlogs: boolean;
}

const EXPLORE_LINKS: { label: string; href: Route }[] = [
  { label: "Projects", href: "/projects" as Route },
  { label: "Skills", href: "/skills" as Route },
  { label: "Certifications", href: "/certifications" as Route },
  { label: "Contact", href: "/contact" as Route },
];

export function Footer({ profile, socials, showBlogs }: FooterProps) {
  const year = new Date().getFullYear();
  const exploreLinks = showBlogs
    ? [...EXPLORE_LINKS.slice(0, 3), { label: "Blogs", href: "/blogs" as Route }, EXPLORE_LINKS[3]]
    : EXPLORE_LINKS;

  return (
    <footer className="relative mt-24 border-t border-border/70">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      />

      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20">
                LG
              </span>
              <span className="text-sm font-semibold tracking-[0.2em] text-foreground uppercase">
                {profile?.name ?? "Portfolio"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{profile?.tagline}</p>
            {profile?.availableForWork ? (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border/70 bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60 motion-reduce:hidden" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                Available for work
              </span>
            ) : null}
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold tracking-[0.2em] text-foreground uppercase">
              Explore
            </h3>
            <nav className="flex flex-col gap-2" aria-label="Footer">
              {exploreLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="w-fit text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold tracking-[0.2em] text-foreground uppercase">
              Connect
            </h3>
            <div className="flex flex-col gap-2">
              {socials.map((social) => {
                const brandIcon = getBrandIcon(social.iconName ?? social.name);
                const FallbackIcon = getIcon(social.iconName ?? "");
                return (
                  <a
                    key={social._id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {brandIcon ? (
                      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-4">
                        <path d={brandIcon.path} />
                      </svg>
                    ) : (
                      <FallbackIcon aria-hidden className="size-4" />
                    )}
                    {social.name}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold tracking-[0.2em] text-foreground uppercase">
              Now
            </h3>
            {profile?.currentlyLearning?.length ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.currentlyLearning.map((item) => (
                  <Badge key={item} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </div>
            ) : null}
            {profile?.resumeUrl ? (
              <Button asChild variant="outline" size="sm" className="w-fit">
                <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
                  <Download aria-hidden />
                  Resume
                </a>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 border-t border-border/70 pt-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-xs text-muted-foreground">
            © {year} {profile?.name ?? "Portfolio"}. Built with Next.js,
            TypeScript &amp; Tailwind.
          </p>
          <a
            href="#top"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowUp aria-hidden className="size-3.5" />
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
