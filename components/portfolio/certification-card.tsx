"use client";

import { format } from "date-fns";
import { Award, ExternalLink } from "lucide-react";

import type { SerializedCertification } from "@/types/models";
import { certColorMap } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Reveal, SpotlightCard } from "@/components/motion";

export interface CertificationCardProps {
  certification: SerializedCertification;
  index?: number;
  className?: string;
}

export function CertificationCard({
  certification,
  index = 0,
  className,
}: CertificationCardProps) {
  const accent = certColorMap[certification.color];
  const issueDate = format(new Date(certification.issueDate), "MMMM yyyy");

  return (
    <Reveal delay={index * 0.08} as="article">
      <SpotlightCard
        className={cn(
          "flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5",
          className
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              "inline-flex size-10 shrink-0 items-center justify-center rounded-xl border",
              accent.bg,
              accent.text,
              accent.border
            )}
          >
            <Award aria-hidden className="size-5" />
          </span>
          {certification.credentialUrl ? (
            <a
              href={certification.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              Verify
              <ExternalLink aria-hidden className="size-3" />
            </a>
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-semibold text-foreground">
            {certification.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {certification.issuer} · {issueDate}
          </p>
        </div>

        {certification.skills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {certification.skills.map((skill) => (
              <Badge key={skill} variant="outline">
                {skill}
              </Badge>
            ))}
          </div>
        ) : null}
      </SpotlightCard>
    </Reveal>
  );
}
