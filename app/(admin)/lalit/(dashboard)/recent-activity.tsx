import type { Route } from "next";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Inbox, MessagesSquare } from "lucide-react";

import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import type { AdminStats } from "@/lib/admin/stats";

export function RecentActivity({
  messages,
  playgroundMessages,
}: {
  messages: AdminStats["recentMessages"];
  playgroundMessages: AdminStats["recentPlaygroundMessages"];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-medium text-card-foreground">Recent messages</h3>
        {messages.length === 0 ? (
          <Empty className="py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Inbox aria-hidden />
              </EmptyMedia>
              <EmptyTitle>No messages yet</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="mt-3 flex flex-col divide-y divide-border">
            {messages.map((m) => (
              <li key={m._id} className="py-2">
                <Link
                  href={`/lalit/inbox/${m._id}` as Route}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-card-foreground">{m.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {m.subject || "(No subject)"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(m.createdAt), { addSuffix: true })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-medium text-card-foreground">Recent playground activity</h3>
        {playgroundMessages.length === 0 ? (
          <Empty className="py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessagesSquare aria-hidden />
              </EmptyMedia>
              <EmptyTitle>No messages yet</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="mt-3 flex flex-col divide-y divide-border">
            {playgroundMessages.map((m) => (
              <li key={m._id} className="py-2">
                <Link href="/lalit/playground" className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-card-foreground">@{m.author}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.content}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(m.createdAt), { addSuffix: true })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
