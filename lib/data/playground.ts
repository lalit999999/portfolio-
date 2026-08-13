// STUB — Session B owns this file. Replace it.
// NOT cached. Do not wrap these in unstable_cache — the feed must be live.
import type { PlaygroundFeedItem, PlaygroundMember } from "@/types/playground";

export async function getPlaygroundFeed(_opts?: {
  limit?: number;
  before?: string;
  viewerId?: string;
}): Promise<PlaygroundFeedItem[]> {
  return [];
}

export async function getMessagesSince(
  _since: string,
  _opts?: { limit?: number; viewerId?: string }
): Promise<PlaygroundFeedItem[]> {
  return [];
}

export async function getPlaygroundMembers(_opts?: {
  limit?: number;
}): Promise<PlaygroundMember[]> {
  return [];
}

export async function getPlaygroundStats(): Promise<{
  totalMessages: number;
  totalMembers: number;
}> {
  return { totalMessages: 0, totalMembers: 0 };
}
