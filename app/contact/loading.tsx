import { Skeleton } from "@/components/ui/skeleton";

export default function ContactLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-full max-w-md" />
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.3fr]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="size-10 rounded-xl" />
            <Skeleton className="size-10 rounded-xl" />
            <Skeleton className="size-10 rounded-xl" />
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-6">
          <Skeleton className="h-9 w-full rounded-3xl" />
          <Skeleton className="h-9 w-full rounded-3xl" />
          <Skeleton className="h-9 w-full rounded-3xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-9 w-32 rounded-4xl" />
        </div>
      </div>
    </div>
  );
}
