"use client";
// STUB — Session C owns this file.
import type { PlaygroundFeedItem, PlaygroundViewer } from "@/types/playground";
export interface PlaygroundFeedProps { initialMessages: PlaygroundFeedItem[]; viewer: PlaygroundViewer | null; pollIntervalMs?: number; className?: string; }
export function PlaygroundFeed({ className }: PlaygroundFeedProps) { return <div className={className} />; }
