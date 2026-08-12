"use client";

import Link from "next/link";
import { ChevronDown, Download, FolderKanban } from "lucide-react";

import type { SerializedProfile } from "@/types/models";
import { Button } from "@/components/ui/button";
import { EASE_OUT, Magnetic, Reveal, Shine, Typewriter } from "@/components/motion";
import { ProfilePhoto } from "@/components/portfolio/profile-photo";

export interface HeroProps {
  profile: SerializedProfile;
}

export function Hero({ profile }: HeroProps) {
  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center gap-8 px-4 pt-28 pb-16 text-center sm:pt-24">
      <Reveal y={0} delay={0}>
        <ProfilePhoto profile={profile} />
      </Reveal>

      <div className="flex flex-col items-center gap-4">
        <Reveal delay={0.1}>
          <h1 className="text-balance font-heading text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            {profile.name}
          </h1>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="max-w-xl font-mono text-base text-muted-foreground sm:text-lg">
            <Typewriter text={profile.tagline} prefix="$ " speed={45} />
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.3}>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {profile.resumeUrl ? (
            <Magnetic strength={8} radius={100}>
              <Button asChild size="lg" className="relative overflow-hidden">
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download aria-hidden />
                  View Resume
                  <Shine />
                </a>
              </Button>
            </Magnetic>
          ) : null}

          <Button asChild variant="outline" size="lg">
            <Link href="/projects">
              <FolderKanban aria-hidden />
              View Projects
            </Link>
          </Button>
        </div>
      </Reveal>

      <a
        href="#about"
        aria-label="Scroll to about section"
        className="absolute bottom-6 inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring motion-safe:animate-bounce"
        style={{ transitionTimingFunction: `cubic-bezier(${EASE_OUT.join(",")})` }}
      >
        <ChevronDown aria-hidden className="size-5" />
      </a>
    </section>
  );
}
