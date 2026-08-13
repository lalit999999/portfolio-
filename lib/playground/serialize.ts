import type { Types } from "mongoose";
import type { IPlaygroundMessage } from "@/models/PlaygroundMessage";
import type { IUser } from "@/models/User";
import type {
  PlaygroundAuthor,
  PlaygroundFeedItem,
  PlaygroundMember,
} from "@/types/playground";

type LeanId = Types.ObjectId | string;

export type LeanAuthor = Pick<
  IUser,
  "username" | "name" | "avatarUrl" | "profileUrl" | "role"
> & { _id: LeanId };

export type LeanMessageWithAuthor = Omit<IPlaygroundMessage, "author"> & {
  _id: LeanId;
  author: LeanAuthor;
};

export type LeanUser = Pick<
  IUser,
  | "username"
  | "name"
  | "avatarUrl"
  | "profileUrl"
  | "role"
  | "messageCount"
  | "lastMessageAt"
> & { _id: LeanId };

function toAuthor(doc: LeanAuthor): PlaygroundAuthor {
  return {
    _id: String(doc._id),
    username: doc.username,
    name: doc.name,
    avatarUrl: doc.avatarUrl,
    profileUrl: doc.profileUrl,
    role: doc.role,
  };
}

export function toFeedItem(
  doc: LeanMessageWithAuthor,
  viewerId?: string
): PlaygroundFeedItem {
  return {
    _id: String(doc._id),
    content: doc.content,
    isPinned: doc.isPinned,
    createdAt: doc.createdAt.toISOString(),
    editedAt: doc.editedAt?.toISOString(),
    author: toAuthor(doc.author),
    isOwn: viewerId ? String(doc.author._id) === viewerId : false,
  };
}

export function toMember(doc: LeanUser): PlaygroundMember {
  return {
    _id: String(doc._id),
    username: doc.username,
    name: doc.name,
    avatarUrl: doc.avatarUrl,
    profileUrl: doc.profileUrl,
    role: doc.role,
    messageCount: doc.messageCount,
    lastMessageAt: doc.lastMessageAt?.toISOString(),
  };
}
