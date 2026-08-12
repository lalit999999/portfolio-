import type { SerializedProfile } from "@/types/models";
import { Badge } from "@/components/ui/badge";
import { Stagger, StaggerItem } from "@/components/motion";
import { SectionHeading } from "@/components/portfolio/section-heading";

export interface LearningProps {
  profile: SerializedProfile;
}

export function Learning({ profile }: LearningProps) {
  if (!profile.currentlyLearning?.length) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
      <SectionHeading eyebrow="Now" title="Currently learning" />
      <Stagger gap={0.06} className="mt-6 flex flex-wrap gap-2">
        {profile.currentlyLearning.map((item) => (
          <StaggerItem key={item}>
            <Badge variant="secondary" className="px-3 py-1 text-sm">
              {item}
            </Badge>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
