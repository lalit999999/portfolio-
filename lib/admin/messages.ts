import "server-only";
import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import { Message } from "@/models";
import type { SerializedMessage } from "@/types/models";

function serialize<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}

export type InboxFilter = "unread" | "all" | "archived";

// SerializedMessage (types/models.ts, frozen) omits ipHash/userAgent even though
// IMessage has them — same situation as PlaygroundFeedItem deliberately omitting
// isHidden. The admin inbox detail view needs them for the technical-details
// disclosure, so this defines its own richer type rather than editing the
// frozen one.
export interface AdminSerializedMessage extends SerializedMessage {
  ipHash?: string;
  userAgent?: string;
}

export async function getAdminMessages(
  filter: InboxFilter = "all"
): Promise<AdminSerializedMessage[]> {
  await dbConnect();

  const query: Record<string, unknown> =
    filter === "unread"
      ? { isRead: false, isArchived: false }
      : filter === "archived"
        ? { isArchived: true }
        : { isArchived: false };

  const docs = await Message.find(query).sort({ createdAt: -1 }).lean();
  return serialize<AdminSerializedMessage[]>(docs);
}

export async function getAdminMessage(id: string): Promise<AdminSerializedMessage | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  await dbConnect();
  const doc = await Message.findById(id).lean();
  if (!doc) return null;
  return serialize<AdminSerializedMessage>(doc);
}

export async function getUnreadMessageCount(): Promise<number> {
  await dbConnect();
  return Message.countDocuments({ isRead: false, isArchived: false });
}
