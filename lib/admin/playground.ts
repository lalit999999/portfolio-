import "server-only";
import type { Types } from "mongoose";
import dbConnect from "@/lib/db";
import { PlaygroundMessage, User } from "@/models";
import type { IUser } from "@/models/User";

const AUTHOR_PROJECTION = "username name avatarUrl role";

type LeanId = Types.ObjectId | string;

interface LeanAdminAuthor {
  _id: LeanId;
  username: string;
  name?: string;
  avatarUrl?: string;
  role: string;
}

interface LeanAdminMessage {
  _id: LeanId;
  content: string;
  isPinned: boolean;
  isHidden: boolean;
  editedAt?: Date;
  createdAt: Date;
  author: LeanAdminAuthor;
}

export interface AdminPlaygroundMessage {
  _id: string;
  content: string;
  isPinned: boolean;
  isHidden: boolean;
  editedAt?: string;
  createdAt: string;
  author: {
    _id: string;
    username: string;
    name?: string;
    avatarUrl?: string;
    role: string;
  };
}

function toAdminMessage(doc: LeanAdminMessage): AdminPlaygroundMessage {
  return {
    _id: String(doc._id),
    content: doc.content,
    isPinned: doc.isPinned,
    isHidden: doc.isHidden,
    editedAt: doc.editedAt?.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    author: {
      _id: String(doc.author._id),
      username: doc.author.username,
      name: doc.author.name,
      avatarUrl: doc.author.avatarUrl,
      role: doc.author.role,
    },
  };
}

export type PlaygroundMessageFilter = "all" | "pinned" | "hidden";

export async function getAdminPlaygroundMessages(opts?: {
  filter?: PlaygroundMessageFilter;
  search?: string;
}): Promise<AdminPlaygroundMessage[]> {
  await dbConnect();

  const query: Record<string, unknown> = {};
  if (opts?.filter === "pinned") query.isPinned = true;
  if (opts?.filter === "hidden") query.isHidden = true;

  const docs = (await PlaygroundMessage.find(query)
    .sort({ isPinned: -1, createdAt: -1 })
    .populate("author", AUTHOR_PROJECTION)
    .lean()) as unknown as LeanAdminMessage[];

  let messages = docs.map(toAdminMessage);

  if (opts?.search) {
    const needle = opts.search.toLowerCase();
    messages = messages.filter(
      (m) =>
        m.content.toLowerCase().includes(needle) ||
        m.author.username.toLowerCase().includes(needle)
    );
  }

  return messages;
}

export interface AdminPlaygroundMember {
  _id: string;
  username: string;
  name?: string;
  avatarUrl?: string;
  role: IUser["role"];
  messageCount: number;
  lastMessageAt?: string;
  isBanned: boolean;
}

export async function getAdminPlaygroundMembers(): Promise<AdminPlaygroundMember[]> {
  await dbConnect();

  const docs = await User.find()
    .sort({ lastMessageAt: -1 })
    .select("username name avatarUrl role messageCount lastMessageAt isBanned")
    .lean();

  return docs.map((doc) => ({
    _id: String(doc._id),
    username: doc.username,
    name: doc.name,
    avatarUrl: doc.avatarUrl,
    role: doc.role,
    messageCount: doc.messageCount,
    lastMessageAt: doc.lastMessageAt?.toISOString(),
    isBanned: doc.isBanned,
  }));
}
