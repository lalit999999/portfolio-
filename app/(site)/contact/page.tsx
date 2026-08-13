import type { Metadata } from "next";
import { Mail } from "lucide-react";

import { getProfile, getSocials } from "@/lib/data";
import { getBrandIcon, getIcon } from "@/lib/icons";
import { Toaster } from "@/components/ui/sonner";
import { SectionHeading } from "@/components/portfolio/section-heading";
import { Reveal } from "@/components/motion";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch — send a message or find me on socials.",
};

export default async function ContactPage() {
  const [profile, socials] = await Promise.all([getProfile(), getSocials()]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Get in touch"
        title="Contact"
        description="Have a project, a question, or just want to say hi? Send a message."
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.3fr]">
        <Reveal as="div" className="flex flex-col gap-6">
          {profile?.email ? (
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-border/70 bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Mail aria-hidden className="size-4 text-primary" />
              {profile.email}
            </a>
          ) : null}

          {socials.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {socials.map((social) => {
                const brandIcon = getBrandIcon(social.name);
                const FallbackIcon = getIcon(social.iconName ?? "");
                return (
                  <a
                    key={social._id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="inline-flex size-10 items-center justify-center rounded-xl border border-border/70 bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {brandIcon ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden
                        className="size-4"
                      >
                        <path d={brandIcon.path} />
                      </svg>
                    ) : (
                      <FallbackIcon aria-hidden className="size-4" />
                    )}
                  </a>
                );
              })}
            </div>
          ) : null}

          {profile?.availableForWork ? (
            <p className="inline-flex w-fit items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary">
              <span className="size-2 rounded-full bg-primary" aria-hidden />
              Available for work
            </p>
          ) : null}
        </Reveal>

        <Reveal as="div" delay={0.05}>
          <div className="rounded-2xl border border-border/70 bg-card p-6">
            <ContactForm />
          </div>
        </Reveal>
      </div>

      <Toaster />
    </div>
  );
}
