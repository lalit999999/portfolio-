"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { LogIn } from "lucide-react";

import { cn } from "@/lib/utils";
import { getBrandIcon } from "@/lib/icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Magnetic } from "@/components/motion";
import type { VariantProps } from "class-variance-authority";

export interface SignInButtonProps {
  callbackUrl?: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function SignInButton({
  callbackUrl,
  size = "default",
  className,
}: SignInButtonProps) {
  const [pending, setPending] = React.useState(false);
  const icon = getBrandIcon("github");

  function handleClick() {
    setPending(true);
    void signIn("github", { callbackUrl: callbackUrl ?? "/" });
  }

  return (
    <Magnetic>
      <Button
        data-slot="sign-in-button"
        size={size as VariantProps<typeof buttonVariants>["size"]}
        onClick={handleClick}
        disabled={pending}
        className={cn(className)}
      >
        {pending ? (
          <Spinner data-icon="inline-start" />
        ) : icon ? (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-4"
            data-icon="inline-start"
            aria-hidden
          >
            <path d={icon.path} />
          </svg>
        ) : (
          <LogIn data-icon="inline-start" aria-hidden />
        )}
        Sign in with GitHub
      </Button>
    </Magnetic>
  );
}
