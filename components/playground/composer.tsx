"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Ban, Send } from "lucide-react";

import { cn } from "@/lib/utils";
import { Field, FieldContent, FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { postMessage } from "@/app/(site)/playground/actions";
import { PLAYGROUND_MAX_LENGTH } from "@/types/playground";
import type { PlaygroundActionState, PlaygroundFeedItem, PlaygroundViewer } from "@/types/playground";

export interface ComposerProps {
  viewer: PlaygroundViewer | null;
  onOptimistic?: (message: PlaygroundFeedItem) => void;
  onSettled?: (message: PlaygroundFeedItem | null) => void;
  className?: string;
}

const initialState: PlaygroundActionState = { status: "idle" };

function useCountdown(retryAfterMs: number | undefined) {
  const [remainingMs, setRemainingMs] = useState(retryAfterMs ?? 0);

  // Reset the countdown whenever a new retryAfterMs comes in, without an
  // Effect: React's sanctioned way to adjust state in response to a changed
  // value is a guarded setState call during render, not an Effect mirror.
  const [trackedRetry, setTrackedRetry] = useState(retryAfterMs);
  if (trackedRetry !== retryAfterMs) {
    setTrackedRetry(retryAfterMs);
    setRemainingMs(retryAfterMs ?? 0);
  }

  useEffect(() => {
    if (!retryAfterMs) return;

    const start = Date.now();
    const id = setInterval(() => {
      const left = Math.max(0, retryAfterMs - (Date.now() - start));
      setRemainingMs(left);
      if (left <= 0) clearInterval(id);
    }, 250);

    return () => clearInterval(id);
  }, [retryAfterMs]);

  return remainingMs;
}

export function Composer({ viewer, onOptimistic, onSettled, className }: ComposerProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [content, setContent] = useState("");

  const action = async (
    prevState: PlaygroundActionState,
    formData: FormData
  ): Promise<PlaygroundActionState> => {
    if (viewer) {
      const text = String(formData.get("content") ?? "");
      onOptimistic?.({
        _id: `temp-${crypto.randomUUID()}`,
        content: text,
        isPinned: false,
        createdAt: new Date().toISOString(),
        author: {
          _id: viewer.id,
          username: viewer.username,
          name: viewer.name,
          avatarUrl: viewer.avatarUrl,
          role: viewer.role,
        },
        isOwn: true,
      });
    }

    const result = await postMessage(prevState, formData);
    onSettled?.(result.status === "success" ? result.message : null);
    return result;
  };

  const [state, formAction, isPending] = useActionState(action, initialState);
  const retryAfterMs = state.status === "error" ? state.retryAfterMs : undefined;
  const remainingMs = useCountdown(retryAfterMs);
  const remainingSeconds = Math.ceil(remainingMs / 1000);

  useEffect(() => {
    if (state.status !== "error") return;
    if (state.code === "SERVER_ERROR" || state.code === "NOT_FOUND" || state.code === "FORBIDDEN") {
      toast.error(state.message);
    }
  }, [state]);

  // Same render-time-adjust pattern as useCountdown: clear the draft the
  // moment a fresh success state arrives, without a setState-in-Effect.
  const [lastHandledState, setLastHandledState] = useState(state);
  if (lastHandledState !== state) {
    setLastHandledState(state);
    if (state.status === "success") setContent("");
  }

  if (!viewer) {
    return (
      <Empty className={cn("p-6", className)}>
        <EmptyHeader>
          <EmptyTitle>Sign in to post</EmptyTitle>
          <EmptyDescription>
            Sign in with GitHub to leave a message for other visitors.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild size="sm">
            <Link href="/login?callbackUrl=/playground">Sign in with GitHub</Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  const isBanned = viewer.isBanned || (state.status === "error" && state.code === "BANNED");
  if (isBanned) {
    return (
      <Empty className={cn("p-6", className)}>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Ban aria-hidden />
          </EmptyMedia>
          <EmptyTitle>You can&apos;t post here</EmptyTitle>
          <EmptyDescription>
            Your account has been restricted from posting in the playground.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (state.status === "error" && state.code === "UNAUTHENTICATED") {
    return (
      <Empty className={cn("p-6", className)}>
        <EmptyHeader>
          <EmptyTitle>Your session expired</EmptyTitle>
          <EmptyDescription>Sign in again to keep posting.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild size="sm">
            <Link href="/login?callbackUrl=/playground">Sign in with GitHub</Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  const validationMessage = state.status === "error" && state.code === "VALIDATION_ERROR" ? state.message : undefined;
  const isRateLimited = state.status === "error" && state.code === "RATE_LIMITED" && remainingMs > 0;
  const remaining = PLAYGROUND_MAX_LENGTH - content.length;
  const nearLimit = remaining <= 50;
  const canSubmit = !isPending && !isRateLimited && content.trim().length > 0 && remaining >= 0;

  return (
    <form
      ref={formRef}
      action={formAction}
      className={cn("flex flex-col gap-2 rounded-2xl border border-border/70 bg-card p-4", className)}
      onKeyDown={(event) => {
        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          formRef.current?.requestSubmit();
        }
      }}
    >
      <Field data-invalid={validationMessage ? "true" : undefined}>
        <FieldContent>
          <Textarea
            name="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={PLAYGROUND_MAX_LENGTH}
            rows={3}
            placeholder="Say something…"
            aria-invalid={Boolean(validationMessage)}
            aria-label="Message"
          />
          <FieldError errors={validationMessage ? [{ message: validationMessage }] : undefined} />
        </FieldContent>
      </Field>

      {isRateLimited ? (
        <p className="text-sm text-destructive">
          {state.status === "error" ? state.message : ""} You can post again in {remainingSeconds}s.
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 sm:flex">
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>Enter</Kbd>
          </KbdGroup>
          <span className="text-xs text-muted-foreground">to send</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span
            className={cn(
              "font-mono text-xs text-muted-foreground",
              nearLimit && "text-destructive"
            )}
          >
            {remaining}
          </span>
          <Button type="submit" size="sm" disabled={!canSubmit}>
            {isPending ? <Spinner /> : <Send aria-hidden />}
            Send
          </Button>
        </div>
      </div>
    </form>
  );
}
