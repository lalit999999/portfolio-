import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <div className="flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">404</p>
        <h1 className="text-xl font-semibold text-card-foreground">
          Page not found
        </h1>
        <Link
          href="/"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
