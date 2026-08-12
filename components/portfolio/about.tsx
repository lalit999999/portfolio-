import type { SerializedProfile } from "@/types/models";
import { Stagger, StaggerItem } from "@/components/motion";
import { SectionHeading } from "@/components/portfolio/section-heading";

export interface AboutProps {
  profile: SerializedProfile;
}

export function About({ profile }: AboutProps) {
  if (!profile.description.length) return null;

  return (
    <section id="about" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-20 sm:py-28">
      <SectionHeading eyebrow="About" title="Who I am" />
      <Stagger gap={0.12} className="mt-8 flex flex-col gap-4">
        {profile.description.map((paragraph, i) => (
          <StaggerItem key={i} y={16}>
            <p className="text-base leading-relaxed text-muted-foreground">
              {paragraph}
            </p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
