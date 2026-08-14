import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsAdminLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-32 rounded-3xl" />
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-8 w-16 rounded-3xl" />
        <Skeleton className="h-8 w-20 rounded-3xl" />
        <Skeleton className="h-8 w-20 rounded-3xl" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border p-4 last:border-b-0"
          >
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="ml-auto h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
