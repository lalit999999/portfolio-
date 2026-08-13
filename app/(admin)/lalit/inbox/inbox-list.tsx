"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Archive, ArchiveRestore, Inbox as InboxIcon, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import type { SerializedMessage } from "@/types/models";
import type { InboxFilter } from "@/lib/admin/messages";
import { bulkArchive, bulkDelete, bulkMarkRead } from "./actions";

export function InboxList({
  messages,
  filter,
  unreadCount,
}: {
  messages: SerializedMessage[];
  filter: InboxFilter;
  unreadCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  function setFilter(next: InboxFilter) {
    const params = new URLSearchParams(searchParams);
    params.set("filter", next);
    router.push(`${pathname}?${params.toString()}`);
    setSelected(new Set());
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function runBulk(action: (ids: string[]) => Promise<{ status: string; message?: string }>) {
    const ids = Array.from(selected);
    startTransition(async () => {
      const state = await action(ids);
      if (state.status === "success") {
        toast.success(state.message ?? "Done.");
        setSelected(new Set());
        router.refresh();
      } else {
        toast.error(state.message ?? "Something went wrong.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as InboxFilter)}>
          <TabsList>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1.5">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>

        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{selected.size} selected</span>
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => runBulk((ids) => bulkMarkRead(ids, true))}
            >
              Mark read
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() =>
                runBulk((ids) => bulkArchive(ids, filter !== "archived"))
              }
            >
              {filter === "archived" ? (
                <ArchiveRestore aria-hidden />
              ) : (
                <Archive aria-hidden />
              )}
              {filter === "archived" ? "Unarchive" : "Archive"}
            </Button>
            <ConfirmDialog
              trigger={
                <Button variant="destructive" size="sm" disabled={isPending}>
                  <Trash2 aria-hidden />
                  Delete
                </Button>
              }
              title={`Delete ${selected.size} message(s)?`}
              description="This action cannot be undone."
              confirmLabel="Delete"
              variant="destructive"
              onConfirm={() => runBulk(bulkDelete)}
            />
          </div>
        )}
      </div>

      {messages.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <InboxIcon aria-hidden />
            </EmptyMedia>
            <EmptyTitle>Nothing here</EmptyTitle>
            <EmptyDescription>
              {filter === "unread"
                ? "You're all caught up."
                : filter === "archived"
                  ? "No archived messages."
                  : "No contact messages yet."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
          {messages.map((message) => (
            <li
              key={message._id}
              className={`flex items-center gap-3 p-4 ${
                !message.isRead ? "border-l-2 border-l-primary" : "border-l-2 border-l-transparent"
              }`}
            >
              <Checkbox
                checked={selected.has(message._id)}
                onCheckedChange={() => toggle(message._id)}
                aria-label={`Select message from ${message.name}`}
              />
              <a
                href={`/lalit/inbox/${message._id}`}
                className="flex min-w-0 flex-1 items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`truncate text-sm ${!message.isRead ? "font-semibold text-card-foreground" : "text-card-foreground"}`}
                    >
                      {message.name}
                    </p>
                    <span className="truncate text-xs text-muted-foreground">
                      {message.email}
                    </span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {message.subject || message.message}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
