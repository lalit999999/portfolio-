import { Eye, FolderKanban } from "lucide-react";

import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import type { AdminStats } from "@/lib/admin/stats";

export function TopProjects({ projects }: { projects: AdminStats["topProjects"] }) {
  const hasViews = projects.some((p) => p.viewCount > 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-medium text-card-foreground">Top projects by views</h3>
      {!hasViews && (
        <p className="mt-1 text-xs text-muted-foreground">
          View tracking isn&apos;t implemented yet — counts are 0 until it is.
        </p>
      )}
      {projects.length === 0 ? (
        <Empty className="py-6">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderKanban aria-hidden />
            </EmptyMedia>
            <EmptyTitle>No projects yet</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="mt-3 flex flex-col divide-y divide-border">
          {projects.map((project) => (
            <li key={project._id} className="flex items-center justify-between gap-3 py-2">
              <span className="truncate text-sm text-card-foreground">{project.title}</span>
              <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <Eye className="size-3.5" aria-hidden />
                {project.viewCount}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
