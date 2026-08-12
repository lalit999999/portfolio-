import { format } from "date-fns";

import type { SerializedEducation } from "@/types/models";
import { Reveal } from "@/components/motion";
import { SectionHeading } from "@/components/portfolio/section-heading";

export interface EducationProps {
  education: SerializedEducation[];
}

function formatRange(start: string, end?: string) {
  const startLabel = format(new Date(start), "yyyy");
  return end ? `${startLabel} – ${format(new Date(end), "yyyy")}` : `${startLabel} – Present`;
}

export function Education({ education }: EducationProps) {
  if (!education.length) return null;

  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:py-28">
      <SectionHeading eyebrow="Education" title="Academic background" />
      <div className="relative mt-10 flex flex-col gap-8 border-l border-border/70 pl-6 sm:pl-8">
        {education.map((edu, i) => (
          <Reveal key={edu._id} delay={i * 0.1} y={16} className="relative">
            <span
              aria-hidden
              className="absolute top-1.5 -left-[calc(1.5rem+5px)] size-2.5 rounded-full bg-primary sm:-left-[calc(2rem+5px)]"
            />
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {formatRange(edu.startDate, edu.endDate)}
              </span>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                {edu.degree} · {edu.field}
              </h3>
              <p className="text-sm text-muted-foreground">
                {edu.institution}
                {edu.grade ? ` · ${edu.grade}` : ""}
              </p>
              {edu.description ? (
                <p className="text-sm text-muted-foreground">{edu.description}</p>
              ) : null}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
