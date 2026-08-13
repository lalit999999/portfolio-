// DB-backed rate limiting. Unlike app/contact/actions.ts's in-memory Map,
// this coordinates across serverless instances because the state lives in
// Mongo, not process memory.
import dbConnect from "@/lib/db";
import { PlaygroundMessage, User } from "@/models";
import {
  PLAYGROUND_BURST_MAX,
  PLAYGROUND_BURST_WINDOW_MS,
  PLAYGROUND_COOLDOWN_MS,
} from "@/types/playground";

export type RateLimitResult =
  | { ok: true }
  | {
      ok: false;
      code: "BANNED" | "RATE_LIMITED" | "NOT_FOUND";
      retryAfterMs?: number;
    };

export async function checkAndConsume(userId: string): Promise<RateLimitResult> {
  await dbConnect();

  // Burst window first: rejecting here means the cooldown update below never
  // runs, so a rejected burst doesn't also charge the user a cooldown/count.
  const windowStart = new Date(Date.now() - PLAYGROUND_BURST_WINDOW_MS);
  const burstCount = await PlaygroundMessage.countDocuments({
    author: userId,
    createdAt: { $gte: windowStart },
  });

  if (burstCount >= PLAYGROUND_BURST_MAX) {
    const oldest = await PlaygroundMessage.findOne({
      author: userId,
      createdAt: { $gte: windowStart },
    })
      .sort({ createdAt: 1 })
      .select("createdAt")
      .lean<{ createdAt: Date }>();

    const retryAfterMs = oldest
      ? Math.max(
          0,
          oldest.createdAt.getTime() + PLAYGROUND_BURST_WINDOW_MS - Date.now()
        )
      : PLAYGROUND_BURST_WINDOW_MS;

    return { ok: false, code: "RATE_LIMITED", retryAfterMs };
  }

  // Atomic cooldown check-and-set: the condition is part of the filter, so
  // two concurrent requests can't both read a stale lastMessageAt and both
  // pass. Exactly one findOneAndUpdate matches.
  const cutoff = new Date(Date.now() - PLAYGROUND_COOLDOWN_MS);
  const updated = await User.findOneAndUpdate(
    {
      _id: userId,
      isBanned: false,
      $or: [
        { lastMessageAt: { $lte: cutoff } },
        { lastMessageAt: { $exists: false } },
      ],
    },
    { $set: { lastMessageAt: new Date() }, $inc: { messageCount: 1 } },
    { new: true }
  );

  if (updated) {
    return { ok: true };
  }

  // The atomic update didn't match — one follow-up read to disambiguate why.
  // Only reached on the failure path, so it costs nothing in the common case.
  const user = await User.findById(userId)
    .select("isBanned lastMessageAt")
    .lean<{ isBanned: boolean; lastMessageAt?: Date }>();

  if (!user) {
    return { ok: false, code: "NOT_FOUND" };
  }
  if (user.isBanned) {
    return { ok: false, code: "BANNED" };
  }

  const retryAfterMs = user.lastMessageAt
    ? Math.max(
        0,
        user.lastMessageAt.getTime() + PLAYGROUND_COOLDOWN_MS - Date.now()
      )
    : undefined;

  return { ok: false, code: "RATE_LIMITED", retryAfterMs };
}

// Compensating write for when checkAndConsume succeeded but the message
// insert that followed it failed. No transaction: Atlas has a replica set
// but local `mongodb://127.0.0.1` typically doesn't, and this codebase
// supports both, so a compensating write is the portable choice.
export async function refund(userId: string): Promise<void> {
  await dbConnect();
  await User.findByIdAndUpdate(userId, { $inc: { messageCount: -1 } });
}
