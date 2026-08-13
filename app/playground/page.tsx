import type { Metadata } from "next";

import { getSessionUser } from "@/lib/auth/session";
import {
  getPlaygroundFeed,
  getPlaygroundMembers,
  getPlaygroundStats,
} from "@/lib/data/playground";
import { Reveal } from "@/components/motion";
import { PlaygroundFeed, MembersStrip } from "@/components/playground";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "A live guestbook — sign in with GitHub and drop a message for other visitors to see.",
};

export default async function PlaygroundPage() {
  const viewer = await getSessionUser();

  const [messages, members, stats] = await Promise.all([
    getPlaygroundFeed({ viewerId: viewer?.id }),
    getPlaygroundMembers(),
    getPlaygroundStats(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8">
      <Reveal as="header" className="flex flex-col gap-3">
        <span className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
          Live
        </span>
        <h1 className="text-balance font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Playground
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          A live guestbook for anyone passing through. Sign in with GitHub and
          leave a message — it shows up here for every visitor, in real time.
        </p>
      </Reveal>

      <MembersStrip members={members} totalMessages={stats.totalMessages} />

      <div className="mx-auto w-full max-w-3xl">
        <PlaygroundFeed initialMessages={messages} viewer={viewer} />
      </div>
    </div>
  );
}
