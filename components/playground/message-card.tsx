"use client";
// STUB — Session C owns this file.
import type { PlaygroundFeedItem, PlaygroundViewer } from "@/types/playground";
export interface MessageCardProps { message: PlaygroundFeedItem; viewer: PlaygroundViewer | null; pending?: boolean; failed?: boolean; onDelete?: (id: string) => void; index?: number; className?: string; }
export function MessageCard({ message, className }: MessageCardProps) { return <div className={className}>{message.content}</div>; }
