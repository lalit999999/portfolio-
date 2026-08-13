"use client";

import Link from "next/link";
import type { Route } from "next";
import { signOut } from "next-auth/react";
import { LogOut, Shield } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PlaygroundViewer } from "@/types/playground";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface UserMenuProps {
  user: PlaygroundViewer;
  className?: string;
}

export function UserMenu({ user, className }: UserMenuProps) {
  const initial = (user.name ?? user.username).charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-slot="user-menu-trigger"
        className={cn(
          "rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
        aria-label={`Signed in as ${user.username}`}
      >
        <Avatar>
          {user.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt={user.username} />
          ) : null}
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="font-semibold text-foreground">
            {user.name ?? user.username}
          </span>
          <span className="text-xs text-muted-foreground">
            @{user.username}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.role === "admin" ? (
          <DropdownMenuItem asChild>
            <Link href={"/admin" as Route}>
              <Shield data-icon="inline-start" aria-hidden />
              Admin
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => void signOut({ callbackUrl: "/" })}
        >
          <LogOut data-icon="inline-start" aria-hidden />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
