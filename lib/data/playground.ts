// NOT cached. Do not wrap these in unstable_cache — every other fetcher in
// this directory uses unstable_cache with revalidate: 3600, but the
// playground feed is live: pattern-matching that convention here would make
// the chat feed update once an hour. The page that renders these sets
// `export const dynamic = "force-dynamic"` instead.
import dbConnect from "@/lib/db";
import { PlaygroundMessage, User } from "@/models";
import {
  toFeedItem,
  toMember,
  type LeanMessageWithAuthor,
  type LeanUser,
} from "@/lib/playground/serialize";
import {
  PLAYGROUND_FEED_LIMIT,
  type PlaygroundFeedItem,
  type PlaygroundMember,
} from "@/types/playground";

const AUTHOR_PROJECTION = "username name avatarUrl profileUrl role";
const MESSAGES_SINCE_HARD_CAP = 100;
const DEFAULT_MEMBERS_LIMIT = 24;

export async function getPlaygroundFeed(opts?: {
  limit?: number;
  before?: string;
  viewerId?: string;
}): Promise<PlaygroundFeedItem[]> {
  await dbConnect();

  const limit = opts?.limit ?? PLAYGROUND_FEED_LIMIT;
  const filter: Record<string, unknown> = { isHidden: false };
  if (opts?.before) {
    const cursor = new Date(opts.before);
    if (!Number.isNaN(cursor.getTime())) {
      filter.createdAt = { $lt: cursor };
    }
  }

  const docs = (await PlaygroundMessage.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("author", AUTHOR_PROJECTION)
    .lean()) as unknown as LeanMessageWithAuthor[];

  return docs.reverse().map((doc) => toFeedItem(doc, opts?.viewerId));
}

export async function getMessagesSince(
  since: string,
  opts?: { limit?: number; viewerId?: string }
): Promise<PlaygroundFeedItem[]> {
  const sinceDate = new Date(since);
  if (Number.isNaN(sinceDate.getTime())) {
    return [];
  }

  await dbConnect();

  const limit = Math.min(
    opts?.limit ?? MESSAGES_SINCE_HARD_CAP,
    MESSAGES_SINCE_HARD_CAP
  );

  const docs = (await PlaygroundMessage.find({
    isHidden: false,
    createdAt: { $gt: sinceDate },
  })
    .sort({ createdAt: 1 })
    .limit(limit)
    .populate("author", AUTHOR_PROJECTION)
    .lean()) as unknown as LeanMessageWithAuthor[];

  return docs.map((doc) => toFeedItem(doc, opts?.viewerId));
}

export async function getPlaygroundMembers(opts?: {
  limit?: number;
}): Promise<PlaygroundMember[]> {
  await dbConnect();

  const docs = (await User.find({ messageCount: { $gt: 0 } })
    .sort({ lastMessageAt: -1 })
    .limit(opts?.limit ?? DEFAULT_MEMBERS_LIMIT)
    .select(
      "username name avatarUrl profileUrl role messageCount lastMessageAt"
    )
    .lean()) as unknown as LeanUser[];

  return docs.map(toMember);
}

export async function getPlaygroundStats(): Promise<{
  totalMessages: number;
  totalMembers: number;
}> {
  await dbConnect();

  const [totalMessages, totalMembers] = await Promise.all([
    PlaygroundMessage.countDocuments({ isHidden: false }),
    User.countDocuments({ messageCount: { $gt: 0 } }),
  ]);

  return { totalMessages, totalMembers };
}
