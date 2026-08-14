"use client";

import type { Route } from "next";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { EyeOff, Eye, MessagesSquare, Pin, PinOff, Search, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import type { AdminPlaygroundMessage, PlaygroundMessageFilter } from "@/lib/admin/playground";
import { deletePlaygroundMessage, toggleHideMessage, togglePinMessage } from "./actions";

export function PlaygroundMessages({
  messages,
  filter,
  search,
}: {
  messages: AdminPlaygroundMessage[];
  filter: PlaygroundMessageFilter;
  search: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}` as Route);
  }

  function runAction(action: () => Promise<{ status: string; message?: string }>) {
    startTransition(async () => {
      const state = await action();
      if (state.status === "success") {
        toast.success(state.message ?? "Done.");
        router.refresh();
      } else {
        toast.error(state.message ?? "Something went wrong.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={filter}
          onValueChange={(v) => updateParams({ filter: v === "all" ? "" : v })}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pinned">Pinned</TabsTrigger>
            <TabsTrigger value="hidden">Hidden</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            defaultValue={search}
            placeholder="Search content or author…"
            className="pl-8"
            onChange={(e) => updateParams({ q: e.target.value })}
          />
        </div>
      </div>

      {messages.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessagesSquare aria-hidden />
            </EmptyMedia>
            <EmptyTitle>No messages</EmptyTitle>
            <EmptyDescription>Nothing matches this filter yet.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="flex flex-col gap-2">
          {messages.map((message) => (
            <li
              key={message._id}
              className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-3"
            >
              <div className="flex min-w-0 items-start gap-3">
                <Avatar className="size-8">
                  <AvatarImage src={message.author.avatarUrl} alt="" />
                  <AvatarFallback>
                    {message.author.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-medium text-card-foreground">
                      {message.author.name || message.author.username}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      @{message.author.username}
                    </span>
                    {message.isPinned && <Badge variant="secondary">Pinned</Badge>}
                    {message.isHidden && <Badge variant="secondary">Hidden</Badge>}
                    <span className="text-xs text-muted-foreground">
                      · {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-card-foreground">{message.content}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isPending}
                  aria-label={message.isPinned ? "Unpin" : "Pin"}
                  onClick={() =>
                    runAction(() => togglePinMessage(message._id, !message.isPinned))
                  }
                >
                  {message.isPinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isPending}
                  aria-label={message.isHidden ? "Unhide" : "Hide"}
                  onClick={() =>
                    runAction(() => toggleHideMessage(message._id, !message.isHidden))
                  }
                >
                  {message.isHidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </Button>
                <ConfirmDialog
                  trigger={
                    <Button variant="ghost" size="icon" aria-label="Delete" disabled={isPending}>
                      <Trash2 className="size-4" />
                    </Button>
                  }
                  title="Delete this message?"
                  description="This action cannot be undone."
                  confirmLabel="Delete"
                  variant="destructive"
                  onConfirm={() => runAction(() => deletePlaygroundMessage(message._id))}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
