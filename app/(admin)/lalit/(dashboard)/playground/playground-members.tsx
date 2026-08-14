"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ShieldOff, ShieldCheck, Users } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import type { AdminPlaygroundMember } from "@/lib/admin/playground";
import { toggleBanMember } from "./actions";

export function PlaygroundMembers({
  members,
  viewerId,
}: {
  members: AdminPlaygroundMember[];
  viewerId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function runToggleBan(id: string, isBanned: boolean) {
    startTransition(async () => {
      const state = await toggleBanMember(id, isBanned);
      if (state.status === "success") {
        toast.success(state.message ?? "Done.");
        router.refresh();
      } else if (state.status === "error") {
        toast.error(state.message);
      }
    });
  }

  if (members.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Users aria-hidden />
          </EmptyMedia>
          <EmptyTitle>No members yet</EmptyTitle>
          <EmptyDescription>Members appear once someone signs in and posts.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {members.map((member) => {
        const isSelf = member._id === viewerId;
        return (
          <li
            key={member._id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="size-8">
                <AvatarImage src={member.avatarUrl} alt="" />
                <AvatarFallback>{member.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-sm font-medium text-card-foreground">
                    {member.name || member.username}
                  </span>
                  <span className="text-xs text-muted-foreground">@{member.username}</span>
                  <Badge variant="secondary" className="capitalize">
                    {member.role}
                  </Badge>
                  {member.isBanned && <Badge variant="destructive">Banned</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {member.messageCount} message(s)
                  {member.lastMessageAt &&
                    ` · last ${formatDistanceToNow(new Date(member.lastMessageAt), { addSuffix: true })}`}
                </p>
              </div>
            </div>
            {member.isBanned ? (
              <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => runToggleBan(member._id, false)}
              >
                <ShieldCheck aria-hidden />
                Unban
              </Button>
            ) : (
              <ConfirmDialog
                trigger={
                  <Button variant="destructive" size="sm" disabled={isPending || isSelf}>
                    <ShieldOff aria-hidden />
                    Ban
                  </Button>
                }
                title={`Ban @${member.username}?`}
                description="They won't be able to post in the playground until unbanned."
                confirmLabel="Ban"
                variant="destructive"
                onConfirm={() => runToggleBan(member._id, true)}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
