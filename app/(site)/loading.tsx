import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div aria-hidden className="flex flex-col">
      <section className="flex min-h-svh flex-col items-center justify-center gap-8 px-4 pt-28 pb-16 sm:pt-24">
        <Skeleton className="size-48 rounded-full sm:size-56" />
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-10 w-64 sm:h-14 sm:w-96" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-36 rounded-4xl" />
          <Skeleton className="h-10 w-36 rounded-4xl" />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20 sm:py-28">
        <Skeleton className="mb-8 h-8 w-48" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20 sm:py-28">
        <Skeleton className="mb-8 h-8 w-56" />
        <div className="flex flex-col gap-8 pl-6">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
        <Skeleton className="mb-8 h-8 w-56" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="aspect-video w-full rounded-2xl" />
          <Skeleton className="aspect-video w-full rounded-2xl" />
          <Skeleton className="aspect-video w-full rounded-2xl" />
        </div>
      </section>
    </div>
  );
}
