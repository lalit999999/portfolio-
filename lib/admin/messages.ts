import "server-only";
import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import { Message } from "@/models";
import type { SerializedMessage } from "@/types/models";

function serialize<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}

export type InboxFilter = "unread" | "all" | "archived";

export async function getAdminMessages(
  filter: InboxFilter = "all"
): Promise<SerializedMessage[]> {
  await dbConnect();

  const query: Record<string, unknown> =
    filter === "unread"
      ? { isRead: false, isArchived: false }
      : filter === "archived"
        ? { isArchived: true }
        : { isArchived: false };

  const docs = await Message.find(query).sort({ createdAt: -1 }).lean();
  return serialize<SerializedMessage[]>(docs);
}

export async function getAdminMessage(id: string): Promise<SerializedMessage | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  await dbConnect();
  const doc = await Message.findById(id).lean();
  if (!doc) return null;
  return serialize<SerializedMessage>(doc);
}

export async function getUnreadMessageCount(): Promise<number> {
  await dbConnect();
  return Message.countDocuments({ isRead: false, isArchived: false });
}
