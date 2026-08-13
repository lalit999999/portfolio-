"use client";
// STUB — Session A owns this file.
import type { PlaygroundViewer } from "@/types/playground";
export interface UserMenuProps { user: PlaygroundViewer; className?: string; }
export function UserMenu({ user, className }: UserMenuProps) { return <div className={className}>{user.username}</div>; }
