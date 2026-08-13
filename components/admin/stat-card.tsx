// STUB — Phase 4 Session A owns this file. Do not edit it from another session.
import type { Route } from "next";
import Link from "next/link";

import type { AdminStatCard } from "@/types/admin";

export function StatCard({ label, value, hint, href }: AdminStatCard) {
  const content = (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-card-foreground">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );

  return href ? <Link href={href as Route}>{content}</Link> : content;
}
