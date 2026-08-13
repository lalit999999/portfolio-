/**
 * Dev-only. Inserts a handful of fabricated users + playground messages so
 * the feed has something to render before real GitHub auth exists.
 * Not wired into scripts/seed.ts (the production seed) — run directly:
 *
 *   npx tsx scripts/seed-playground.ts
 */
import dotenv from "dotenv";
import path from "node:path";
import mongoose from "mongoose";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import dbConnect from "@/lib/db";
import { User, PlaygroundMessage } from "@/models";

const FAKE_USERS = [
  {
    githubId: "seed-1001",
    username: "octo-dev",
    name: "Octo Dev",
    avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4",
    profileUrl: "https://github.com/octo-dev",
    role: "visitor" as const,
  },
  {
    githubId: "seed-1002",
    username: "pixel-pusher",
    name: "Pixel Pusher",
    avatarUrl: "https://avatars.githubusercontent.com/u/2?v=4",
    profileUrl: "https://github.com/pixel-pusher",
    role: "visitor" as const,
  },
  {
    githubId: "seed-1003",
    username: "code-nomad",
    name: "Code Nomad",
    avatarUrl: "https://avatars.githubusercontent.com/u/3?v=4",
    profileUrl: "https://github.com/code-nomad",
    role: "visitor" as const,
  },
];

const longMessage = "This is a deliberately long message meant to test how the playground feed wraps text across multiple lines in the message card, since chat UIs tend to break in interesting ways once content runs past a couple of lines and starts interacting with avatars, timestamps, and action buttons that sit alongside it".slice(
  0,
  500
);
const exactly500 = (longMessage + "x".repeat(500)).slice(0, 500);

const MESSAGES = [
  "hey, is this thing on?",
  "Just shipped the new orange theme 🍊 looking good so far",
  "Check out the repo: https://github.com/lalit999999/portfolio-",
  "short one",
  "Testing emoji rendering 🚀✨🔥",
  longMessage,
  exactly500,
  "Anyone else seeing the dark mode contrast pop more now?",
  "gm ☀️",
];

async function main() {
  await dbConnect();

  const userDocs = await Promise.all(
    FAKE_USERS.map((u) =>
      User.findOneAndUpdate(
        { githubId: u.githubId },
        { $setOnInsert: u },
        { upsert: true, new: true }
      )
    )
  );

  for (let i = 0; i < MESSAGES.length; i++) {
    const author = userDocs[i % userDocs.length];
    await PlaygroundMessage.create({
      author: author._id,
      content: MESSAGES[i],
    });
    await User.findByIdAndUpdate(author._id, {
      $inc: { messageCount: 1 },
      $set: { lastMessageAt: new Date() },
    });
  }

  console.log(`Seeded ${userDocs.length} users and ${MESSAGES.length} messages.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
