import type { Metadata } from "next";

import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  const user = await getSessionUser();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-16 sm:px-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          Welcome, {user?.name ?? user?.username}
        </h1>
      </div>

      <dl className="grid grid-cols-1 gap-3 rounded-2xl border border-border/70 bg-card p-6 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Username</dt>
          <dd className="font-medium text-foreground">@{user?.username}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Role</dt>
          <dd className="font-medium text-foreground">{user?.role}</dd>
        </div>
      </dl>

      <p className="text-sm text-muted-foreground">
        Phase 4 lands here — moderation and content tools for the playground.
      </p>
    </div>
  );
}
