"use client";
// STUB — Session C owns this file.
import type { PlaygroundFeedItem, PlaygroundViewer } from "@/types/playground";
export interface ComposerProps { viewer: PlaygroundViewer | null; onOptimistic?: (m: PlaygroundFeedItem) => void; onSettled?: (m: PlaygroundFeedItem | null) => void; className?: string; }
export function Composer({ className }: ComposerProps) { return <div className={className} />; }
