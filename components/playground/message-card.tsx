"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { PlaygroundFeedItem, PlaygroundViewer } from "@/types/playground";

export interface MessageCardProps {
  message: PlaygroundFeedItem;
  viewer: PlaygroundViewer | null;
  pending?: boolean;
  failed?: boolean;
  onDelete?: (id: string) => void;
  index?: number;
  className?: string;
}

// Server and client must agree on the very first paint, and the server's
// clock/timezone can differ from the browser's. toISOString() is timezone-
// and locale-free, so it renders identically both places; the relative
// "2m ago" string is computed only after mount, once hydration is safe.
function RelativeTime({ dateTime }: { dateTime: string }) {
  const [label, setLabel] = useState(() => dateTime.slice(11, 16) + " UTC");

  useEffect(() => {
    const update = () =>
      setLabel(formatDistanceToNowStrict(new Date(dateTime), { addSuffix: true }));
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [dateTime]);

  return (
    <time dateTime={dateTime} title={new Date(dateTime).toLocaleString()} className="shrink-0">
      {label}
    </time>
  );
}

export function MessageCard({
  message,
  viewer,
  pending = false,
  failed = false,
  onDelete,
  index = 0,
  className,
}: MessageCardProps) {
  const { author } = message;
  const displayName = author.name || author.username;
  const canDelete = Boolean(onDelete) && (message.isOwn || viewer?.role === "admin");

  return (
    <article
      aria-label={`Message from ${displayName}`}
      style={{ transitionDelay: pending ? undefined : `${index * 0.04}s` }}
      className={cn(
        "flex flex-col gap-2 rounded-2xl border border-border/70 bg-card p-4 transition-opacity",
        pending && "opacity-60",
        failed && "border-destructive/50",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Avatar size="sm" className="shrink-0">
          {author.avatarUrl ? <AvatarImage src={author.avatarUrl} alt={displayName} /> : null}
          <AvatarFallback>{author.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>

        <span className="truncate text-sm font-medium text-foreground">{displayName}</span>
        <span className="truncate text-sm text-muted-foreground">@{author.username}</span>
        {author.role === "admin" ? (
          <Badge variant="secondary" className="text-[10px] uppercase">
            admin
          </Badge>
        ) : null}

        <span className="ml-auto flex items-center gap-2 font-mono text-xs text-muted-foreground">
          {pending ? <Spinner className="size-3.5" /> : <RelativeTime dateTime={message.createdAt} />}
        </span>
      </div>

      <p className="text-sm whitespace-pre-wrap break-words text-foreground [overflow-wrap:anywhere]">
        {message.content}
      </p>

      {failed ? (
        <div className="flex items-center justify-between gap-2 text-xs text-destructive">
          <span>Failed to send.</span>
          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(message._id)}
              className="rounded-md font-medium underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Discard
            </button>
          ) : null}
        </div>
      ) : null}

      {canDelete && !failed ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="ml-auto self-end text-muted-foreground hover:text-destructive"
              aria-label="Delete message"
            >
              <Trash2 aria-hidden />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this message?</AlertDialogTitle>
              <AlertDialogDescription>
                This can&apos;t be undone. The message will be removed from the
                playground for everyone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={() => onDelete?.(message._id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </article>
  );
}
