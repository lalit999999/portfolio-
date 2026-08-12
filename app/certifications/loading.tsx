import { Skeleton } from "@/components/ui/skeleton";

export default function CertificationsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-full max-w-md" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="size-10 rounded-xl" />
              <Skeleton className="h-5 w-14" />
            </div>
            <div className="flex flex-col gap-1">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Skeleton className="h-5 w-16 rounded-3xl" />
              <Skeleton className="h-5 w-16 rounded-3xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
