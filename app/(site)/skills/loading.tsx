import { Skeleton } from "@/components/ui/skeleton";

export default function SkillsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-full max-w-md" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-28 shrink-0 rounded-xl lg:w-full" />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-3 rounded-2xl border border-border/70 bg-card p-4"
            >
              <Skeleton className="size-11 rounded-xl" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
