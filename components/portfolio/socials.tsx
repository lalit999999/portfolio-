import type { SerializedSocial } from "@/types/models";
import { getBrandIcon, getIcon } from "@/lib/icons";
import { Magnetic, Stagger, StaggerItem } from "@/components/motion";
import { SectionHeading } from "@/components/portfolio/section-heading";

export interface SocialsProps {
  socials: SerializedSocial[];
}

export function Socials({ socials }: SocialsProps) {
  if (!socials.length) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
      <SectionHeading eyebrow="Connect" title="Find me elsewhere" align="center" />
      <Stagger gap={0.06} className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {socials.map((social) => {
          const brandIcon = getBrandIcon(social.iconName ?? social.name);
          const FallbackIcon = getIcon(social.iconName ?? "");
          return (
            <StaggerItem key={social._id}>
              <Magnetic strength={10} radius={60}>
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.handle ? `${social.name}: ${social.handle}` : social.name}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-border/70 bg-card text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {brandIcon ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-5">
                      <path d={brandIcon.path} />
                    </svg>
                  ) : (
                    <FallbackIcon aria-hidden className="size-5" />
                  )}
                </a>
              </Magnetic>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}
