import type { Metadata } from "next";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { getSessionUser, isAdmin } from "@/lib/auth/session";
import { SignInButton } from "@/components/auth/sign-in-button";

export const metadata: Metadata = {
  title: "Admin sign in",
};

function safeCallbackUrl(raw: string | undefined): Route {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) {
    return raw as Route;
  }
  return "/lalit" as Route;
}

export default async function AdminSignInPage(props: PageProps<"/lalit/signin">) {
  const { callbackUrl } = await props.searchParams;
  const target = safeCallbackUrl(
    typeof callbackUrl === "string" ? callbackUrl : undefined
  );

  const user = await getSessionUser();
  if (user) {
    redirect(isAdmin(user) ? target : ("/lalit/403" as Route));
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck aria-hidden className="size-6" />
        </span>
        <div>
          <h1 className="text-xl font-semibold text-card-foreground">
            Admin sign in
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            GitHub sign-in, admin accounts only.
          </p>
        </div>
        <SignInButton callbackUrl={target} />
      </div>
    </div>
  );
}
