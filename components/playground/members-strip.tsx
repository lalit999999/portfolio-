// STUB — Session C owns this file. Server component.
import type { PlaygroundMember } from "@/types/playground";
export interface MembersStripProps { members: PlaygroundMember[]; totalMessages?: number; className?: string; }
export function MembersStrip({ className }: MembersStripProps) { return <div className={className} />; }
