// SHARED CONTRACT — written by Step 0. All three sessions read this.
// Nobody edits it during Phase 3. Needs a change? Put it in your summary file.
import type { UserRole } from "@/models/User";

export interface PlaygroundAuthor {
  _id: string;
  username: string;
  name?: string;
  avatarUrl?: string;
  profileUrl?: string;
  role: UserRole;
}

export interface PlaygroundFeedItem {
  _id: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  editedAt?: string;
  author: PlaygroundAuthor;
  isOwn: boolean;
}

export interface PlaygroundMember {
  _id: string;
  username: string;
  name?: string;
  avatarUrl?: string;
  profileUrl?: string;
  role: UserRole;
  messageCount: number;
  lastMessageAt?: string;
}

export interface PlaygroundViewer {
  id: string;
  githubId: string;
  username: string;
  name?: string;
  avatarUrl?: string;
  role: UserRole;
  isBanned: boolean;
}

export type PlaygroundErrorCode =
  | "UNAUTHENTICATED"
  | "BANNED"
  | "RATE_LIMITED"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "SERVER_ERROR";

export type PlaygroundActionState =
  | { status: "idle" }
  | { status: "success"; message: PlaygroundFeedItem }
  | {
      status: "error";
      code: PlaygroundErrorCode;
      message: string;
      retryAfterMs?: number;
    };

export type DeleteResult =
  | { ok: true; id: string }
  | { ok: false; code: PlaygroundErrorCode; message: string };

export const PLAYGROUND_FEED_LIMIT = 50;
export const PLAYGROUND_MAX_LENGTH = 500;
export const PLAYGROUND_COOLDOWN_MS = 10_000;
export const PLAYGROUND_BURST_WINDOW_MS = 60_000;
export const PLAYGROUND_BURST_MAX = 5;
