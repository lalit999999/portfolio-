import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Not authorised",
};

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <div className="flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldAlert aria-hidden className="size-6" />
        </span>
        <div>
          <p className="text-sm font-medium text-muted-foreground">403</p>
          <h1 className="mt-1 text-xl font-semibold text-card-foreground">
            Not authorised
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          You&apos;re signed in, but this account doesn&apos;t have admin
          access.
        </p>
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
