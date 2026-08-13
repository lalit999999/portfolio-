import { Skeleton } from "@/components/ui/skeleton";

const CARD_WIDTHS = ["w-3/4", "w-1/2", "w-full", "w-2/3", "w-5/6"];

export default function PlaygroundLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-full max-w-md" />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="size-8 rounded-full ring-2 ring-background" />
          ))}
        </div>
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        {CARD_WIDTHS.map((width, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4"
          >
            <div className="flex items-center gap-2">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className={`h-4 ${width}`} />
          </div>
        ))}

        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
    </div>
  );
}
