"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Archive, ArchiveRestore, ChevronDown, Mail, MailOpen, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import type { SerializedMessage } from "@/types/models";
import { archiveMessage, deleteMessage, markMessageRead } from "./actions";

export function MessageDetail({ message }: { message: SerializedMessage }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isRead, setIsRead] = useState(message.isRead);
  const hasMarkedRead = useRef(false);

  useEffect(() => {
    if (!message.isRead && !hasMarkedRead.current) {
      hasMarkedRead.current = true;
      markMessageRead(message._id, true).then((state) => {
        if (state.status === "success") setIsRead(true);
      });
    }
  }, [message._id, message.isRead]);

  function toggleRead() {
    startTransition(async () => {
      const state = await markMessageRead(message._id, !isRead);
      if (state.status === "success") {
        setIsRead(!isRead);
        toast.success(state.message ?? "Updated.");
      } else if (state.status === "error") {
        toast.error(state.message);
      }
    });
  }

  function toggleArchive() {
    startTransition(async () => {
      const state = await archiveMessage(message._id, !message.isArchived);
      if (state.status === "success") {
        toast.success(state.message ?? "Updated.");
        router.push("/lalit/inbox");
        router.refresh();
      } else if (state.status === "error") {
        toast.error(state.message);
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const state = await deleteMessage(message._id);
      if (state.status === "success") {
        toast.success("Message deleted.");
        router.push("/lalit/inbox");
        router.refresh();
      } else if (state.status === "error") {
        toast.error(state.message);
      }
    });
  }

  const replyHref = `mailto:${message.email}?subject=${encodeURIComponent(
    `Re: ${message.subject || "Your message"}`
  )}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">
              {message.subject || "(No subject)"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {message.name} · {message.email}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            </p>
          </div>
          {message.isArchived && <Badge variant="secondary">Archived</Badge>}
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm text-card-foreground">
          {message.message}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button asChild>
          <a href={replyHref}>
            <Mail aria-hidden />
            Reply
          </a>
        </Button>
        <Button variant="outline" disabled={isPending} onClick={toggleRead}>
          <MailOpen aria-hidden />
          Mark {isRead ? "unread" : "read"}
        </Button>
        <Button variant="outline" disabled={isPending} onClick={toggleArchive}>
          {message.isArchived ? <ArchiveRestore aria-hidden /> : <Archive aria-hidden />}
          {message.isArchived ? "Unarchive" : "Archive"}
        </Button>
        <ConfirmDialog
          trigger={
            <Button variant="destructive" disabled={isPending}>
              <Trash2 aria-hidden />
              Delete
            </Button>
          }
          title="Delete this message?"
          description="This action cannot be undone."
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleDelete}
        />
      </div>

      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-fit gap-1 text-muted-foreground">
            <ChevronDown aria-hidden className="size-3.5" />
            Technical details
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
          <p>IP hash: {message.ipHash ?? "—"}</p>
          <p className="mt-1 break-all">User agent: {message.userAgent ?? "—"}</p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
