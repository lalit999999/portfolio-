# Phase 3 — Session B summary

Playground data layer: fetchers, serialization, rate limiting, Server Actions,
and the polling endpoint. All work is on `phase-3-b-data`, in the `wt-b`
worktree.

## What was built

- `lib/playground/serialize.ts` — `toFeedItem` / `toMember` typed mappers.
  Dates → ISO strings, ObjectIds → strings, `isOwn` resolved server-side by
  comparing `author._id` to `viewerId`. `isHidden` is never emitted to the
  client (it isn't part of `PlaygroundFeedItem` in the contract, so this is
  enforced by the type alone — no explicit strip needed).
- `lib/data/playground.ts` — `getPlaygroundFeed`, `getMessagesSince`,
  `getPlaygroundMembers`, `getPlaygroundStats`. Bare `async` functions, no
  `unstable_cache` (verified: `grep -rn unstable_cache lib/data/playground.ts`
  only matches the warning comment at the top of the file). Feed query
  descends on `createdAt` to hit the `{ isHidden: 1, createdAt: -1 }` index,
  then reverses in memory to return oldest-first.
- `lib/data/index.ts` — appended the four playground exports after the
  existing lines, no reordering.
- `lib/playground/rate-limit.ts` — `checkAndConsume` / `refund`. Burst check
  (`countDocuments` in the last 60s, cap 5) runs before the atomic cooldown
  `findOneAndUpdate`, so a rejected burst never touches `lastMessageAt` or
  `messageCount`. Cooldown failure gets one follow-up read to disambiguate
  `BANNED` / `NOT_FOUND` / `RATE_LIMITED`, with `retryAfterMs` computed from
  the stored timestamp.
- `app/playground/actions.ts` — `postMessage` (session → zod → whitespace
  check → rate limit → create → refund-on-failure → re-read with populate)
  and `deleteMessage` (ObjectId validation → ownership-filtered
  `findOneAndDelete`, admin bypasses the `author` filter → follow-up read to
  distinguish `NOT_FOUND` from `FORBIDDEN`).
- `app/api/playground/messages/route.ts` — `GET ?since=<iso>`, `force-dynamic`,
  `Cache-Control: no-store`, `since` validated with `z.string().datetime()`.
- `scripts/seed-playground.ts` — dev-only, not wired into `scripts/seed.ts`.
  3 fabricated users, 9 messages (emoji, URL, short, long, and one exactly
  500 chars).

## Decisions

- **Compensating write, not a transaction.** `refund()` is a plain
  `$inc: { messageCount: -1 }` on catch, not a session-wrapped transaction.
  Atlas has a replica set; local `mongodb://127.0.0.1` typically doesn't, and
  this codebase is meant to run against both. A transaction would be cleaner
  but would break local dev without a replica set.
- **`since` is required on the polling endpoint, not optional.** Missing or
  malformed `since` returns `400 VALIDATION_ERROR` rather than silently
  defaulting to "last 20" or "everything". Session C's poller always has a
  `since` value once it's rendered the initial feed, so this never fires in
  normal operation — it's a defense against a client bug or a hand-crafted
  request, not a UX path.
- **Burst window numbers**: used the contract's `PLAYGROUND_BURST_MAX = 5`
  over `PLAYGROUND_BURST_WINDOW_MS = 60_000` as-is, no tuning. Verified with
  a throwaway script (not committed) that 5 posts spaced 11s apart succeed
  and the 6th is rejected by the burst check with a `retryAfterMs` counting
  down to when the oldest of the 5 ages out of the window.
- **`lib/data/users.ts` was left unwritten.** It's in Session B's ownership
  column in the setup doc, but nothing in the numbered task list or in
  Session A/C's documented imports references it, and no other file in the
  repo imports from it. Writing it speculatively would mean guessing a
  contract nobody's building against yet. If Session A or C needs a
  user-lookup fetcher, add it then with the actual call site driving the
  signature.
- **Dev environment**: the worktree's `node_modules` was initially symlinked
  to the main checkout per the setup doc's suggestion, but Turbopack refused
  to build through the symlink (`Symlink [project]/node_modules is invalid,
  it points out of the filesystem root`). Replaced with a real `npm install`
  in `wt-b`. Noting this in case Sessions A or C hit the same thing.

## Verification

- `npm run build` — succeeds (Turbopack, all existing routes render;
  `/playground` doesn't appear yet since Session C hasn't added
  `app/playground/page.tsx`).
- `npx eslint` on every file this session owns — zero warnings/errors. (The
  repo-wide `npm run lint` has pre-existing errors in files outside this
  session's ownership — `navbar-client.tsx`, `theme-toggle.tsx`,
  `carousel.tsx`, `use-mobile.ts`, `scripts/extract.ts`, `scripts/seed.ts` —
  all pre-existing `react-hooks/set-state-in-effect` and
  `@typescript-eslint/no-explicit-any` findings, not touched here.)
- Polling endpoint, live against the seeded data: valid `since` → ascending
  ISO-dated messages with no `isHidden` field; garbage `since` → clean `400`;
  missing `since` → clean `400`.
- Rate limiting, via a throwaway script (not committed): cooldown blocks a
  second immediate call with a `retryAfterMs` around 10s; a banned user gets
  `BANNED`; a nonexistent id gets `NOT_FOUND`; `refund` decrements
  `messageCount` by exactly 1; 5 posts spaced 11s apart succeed and the 6th
  is `RATE_LIMITED` from the burst window.
- `postMessage` / `deleteMessage` both correctly return `UNAUTHENTICATED`
  against the current `getSessionUser` stub (still owned by Session A, not
  landed yet) — this is the expected state until A merges.
- `git log --format="%b"` across this session's commits — no
  `Co-Authored-By`, no "Generated with" footer.

## Left for other sessions

- Nothing found wrong in `models/**` or `types/playground.ts` — both
  supported everything this session needed without modification.
- `deleteMessage`'s `FORBIDDEN` vs `NOT_FOUND` disambiguation and
  `postMessage`'s full happy path (real session → real insert →
  `toFeedItem` with a real `isOwn: true`) are only exercisable end-to-end
  once Session A's `lib/auth/session.ts` lands and a real signed-in user
  exists. The underlying rate-limit + create pipeline was verified directly
  (see above); the session-gating wrapper around it is a two-line null check
  that was also verified against the current stub.
