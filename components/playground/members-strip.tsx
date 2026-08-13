import { Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { CountUp } from "@/components/motion";
import type { PlaygroundMember } from "@/types/playground";

export interface MembersStripProps {
  members: PlaygroundMember[];
  totalMessages?: number;
  className?: string;
}

const VISIBLE_LIMIT = 12;

export function MembersStrip({ members, totalMessages, className }: MembersStripProps) {
  if (members.length === 0) return null;

  const visible = members.slice(0, VISIBLE_LIMIT);
  const overflow = members.length - visible.length;

  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      <div
        tabIndex={0}
        role="group"
        aria-label="Playground members"
        className="flex -space-x-2 overflow-x-auto rounded-full py-1 pr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {visible.map((member) => {
          const name = member.name || member.username;
          return (
            <HoverCard key={member._id} openDelay={150}>
              <HoverCardTrigger asChild>
                <Avatar
                  size="sm"
                  tabIndex={0}
                  aria-label={name}
                  className="shrink-0 ring-2 ring-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {member.avatarUrl ? <AvatarImage src={member.avatarUrl} alt={name} /> : null}
                  <AvatarFallback>{member.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </HoverCardTrigger>
              <HoverCardContent className="w-56">
                <div className="flex items-center gap-3">
                  <Avatar size="lg">
                    {member.avatarUrl ? <AvatarImage src={member.avatarUrl} alt={name} /> : null}
                    <AvatarFallback>{member.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">{name}</span>
                    <span className="truncate text-xs text-muted-foreground">@{member.username}</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {member.messageCount} {member.messageCount === 1 ? "message" : "messages"}
                </p>
              </HoverCardContent>
            </HoverCard>
          );
        })}

        {overflow > 0 ? (
          <div
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground ring-2 ring-background"
          >
            +{overflow}
          </div>
        ) : null}
      </div>

      {typeof totalMessages === "number" ? (
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users aria-hidden className="size-4" />
          <CountUp to={totalMessages} className="font-medium text-foreground" />
          {totalMessages === 1 ? "message" : "messages"}
        </span>
      ) : null}
    </div>
  );
}
