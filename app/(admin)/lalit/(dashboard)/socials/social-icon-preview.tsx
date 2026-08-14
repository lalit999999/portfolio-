"use client";

import { Circle, TriangleAlert } from "lucide-react";
import { getBrandIcon } from "@/lib/icons";

export function SocialIconPreview({ iconName }: { iconName?: string }) {
  if (!iconName) {
    return (
      <div className="flex size-8 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
        <Circle className="size-4" />
      </div>
    );
  }

  const icon = getBrandIcon(iconName);

  if (!icon) {
    return (
      <div
        className="flex items-center gap-1.5 text-destructive"
        title={`No brand icon found for "${iconName}" — it won't render on the public site.`}
      >
        <div className="flex size-8 items-center justify-center rounded-full border border-dashed border-destructive/50 bg-destructive/10">
          <TriangleAlert className="size-4" />
        </div>
        <span className="text-xs">Icon not found</span>
      </div>
    );
  }

  return (
    <div className="flex size-8 items-center justify-center rounded-full border border-border bg-muted">
      <svg
        role="img"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-4 text-foreground"
        aria-label={icon.title}
      >
        <path d={icon.path} />
      </svg>
    </div>
  );
}
