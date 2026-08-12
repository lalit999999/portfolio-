import { Skeleton } from "@/components/ui/skeleton";

export default function BlogsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-full max-w-md" />
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-24 rounded-3xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card"
          >
            <Skeleton className="aspect-[16/9] w-full rounded-none" />
            <div className="flex flex-col gap-2 p-5">
              <Skeleton className="h-5 w-20 rounded-3xl" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="mt-2 h-4 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
