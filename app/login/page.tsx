import type { Metadata } from "next";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";

import { getSessionUser } from "@/lib/auth/session";
import { SignInButton } from "@/components/auth/sign-in-button";
import { Reveal } from "@/components/motion";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in with GitHub to join the playground.",
};

function safeCallbackUrl(raw: string | undefined): Route {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) {
    return raw as Route;
  }
  return "/" as Route;
}

export default async function LoginPage(props: PageProps<"/login">) {
  const { callbackUrl } = await props.searchParams;
  const target = safeCallbackUrl(
    typeof callbackUrl === "string" ? callbackUrl : undefined
  );

  const user = await getSessionUser();
  if (user) {
    redirect(target);
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center gap-8 px-4 py-16 text-center sm:px-6">
      <Reveal as="div" className="flex flex-col items-center gap-4">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MessageCircle aria-hidden className="size-6" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Sign in to join the playground
        </h1>
        <p className="text-sm text-muted-foreground">
          Signing in with GitHub only unlocks the playground — a live chat
          with other visitors. Nothing else on the site requires an account.
        </p>
      </Reveal>

      <SignInButton callbackUrl={target} />
    </div>
  );
}
