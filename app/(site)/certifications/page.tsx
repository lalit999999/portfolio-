import type { Metadata } from "next";
import { Award } from "lucide-react";

import { getCertifications } from "@/lib/data";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { SectionHeading } from "@/components/portfolio/section-heading";
import { CertificationCard } from "@/components/portfolio/certification-card";
import { Stagger } from "@/components/motion";

export const revalidate = 3600;

const title = "Certifications";
const description = "Certifications and credentials I've earned.";

// Explicit openGraph here, not just title/description: Next only merges
// per-segment metadata shallowly — a page that omits openGraph inherits the
// root layout's whole object (its title/description), not this page's.
export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: "website" },
};

export default async function CertificationsPage() {
  const certifications = await getCertifications();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Credentials"
        title="Certifications"
        description="Courses and certifications I've completed along the way."
      />

      {certifications.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Award aria-hidden />
            </EmptyMedia>
            <EmptyTitle>No certifications yet</EmptyTitle>
            <EmptyDescription>
              Check back soon — this section is updated as new credentials
              come in.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Stagger
          as="div"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {certifications.map((certification, index) => (
            <CertificationCard
              key={certification._id}
              certification={certification}
              index={index}
            />
          ))}
        </Stagger>
      )}
    </div>
  );
}
