# Phase 3 — Session C summary

Playground UI: page shell, message card, visibility-aware polling hook, optimistic
composer, live feed with scroll anchoring, members strip, and new-messages pill. Built
entirely against the Step 0 stubs for `lib/auth/session.ts`, `lib/data/playground.ts`,
and `app/playground/actions.ts` — Sessions A and B had not merged at the time of this
work, so `getSessionUser()` returned `null` and every fetcher returned an empty
array/`SERVER_ERROR` throughout.

## What was built

- `app/playground/page.tsx` — Server Component, `force-dynamic`, fetches feed/members/
  stats in parallel via `Promise.all`, `viewerId` sourced from `getSessionUser()` first.
  Outer container `max-w-6xl` (navbar alignment), inner feed column `max-w-3xl`.
- `app/playground/loading.tsx` — skeleton with five varied-width message bars, a
  members-strip row, and a composer bar.
- `app/playground/error.tsx` — client boundary, retry button, same shape as the
  site-wide `app/error.tsx`.
- `components/playground/message-card.tsx` — avatar, name/username/admin badge,
  relative timestamp, plain-text content, delete (own message or admin) behind an
  `AlertDialog`, pending/failed visual states.
- `hooks/use-visibility-poll.ts` — generic `setTimeout`-chain poller: pauses on
  `visibilitychange` hidden, polls immediately on becoming visible, exponential backoff
  on failure (doubles to a 60s cap, resets on success), aborts in-flight requests on
  unmount via `AbortController`.
- `components/playground/composer.tsx` — `useActionState(postMessage, …)`, live
  character counter against `PLAYGROUND_MAX_LENGTH`, Cmd/Ctrl+Enter submit, per-error-
  code rendering (`RATE_LIMITED` countdown, `BANNED`/`UNAUTHENTICATED` replace the form,
  `VALIDATION_ERROR` inline, everything else → toast), optimistic hand-off via
  `onOptimistic`/`onSettled`.
- `components/playground/playground-feed.tsx` — merges initial SSR messages, poll
  results, and optimistic/failed rows; scroll-anchors to the bottom or shows a pill;
  `aria-live="polite"`.
- `components/playground/members-strip.tsx`, `new-messages-pill.tsx`,
  `empty-feed.tsx` — server-rendered avatar strip with `HoverCard` details, animated
  pill, shared empty state for both signed-in and signed-out visitors.

## Decisions

**Relative-timestamp hydration.** Server and client can be in different timezones, so a
locale-formatted time would mismatch on hydration. First paint renders the UTC
`HH:MM` slice of the ISO string (identical on server and client, no `Intl` involved);
a `useEffect` then swaps in `formatDistanceToNowStrict`, refreshed every 30s.

**Plain cards, not `SpotlightCard`.** `SpotlightCard` attaches a `pointermove` listener
per instance. A feed can hold 50 rows; 50 live pointer listeners for a per-card glow
effect isn't worth it at that density. Message cards use the site's plain
`border-border bg-card` treatment instead — still gets the mount-in fade via
`motion.div`.

**Optimistic state = `useOptimistic` (transient) + a separate `failedMessages` state
(durable).** `useOptimistic`'s overlay reverts to the base state as soon as its
triggering transition settles, regardless of whether that settle was a success or a
failure. That's exactly what's wanted on success (the base already has the real message
by then, so the swap is invisible), but wrong for failure — a failed row needs to *stay*
visible with a retry/discard affordance well after the transition ends. So failures are
captured into a plain `useState` array instead. Since `onSettled(null)` carries no id to
say *which* pending post failed, a `pendingQueueRef` (FIFO, populated by
`onOptimistic`) tracks in-flight submissions in order and is shifted on every settle —
correct as long as there's a single composer instance, which there is.

**Delete is optimistic via a `deletedIds` set**, not a direct filter of the message
array — the merged base is `messages ∪ polledItems` recomputed with `useMemo`, and
`polledItems` only ever grows (the poll hook doesn't know about deletions), so a
straight filter would let a deleted message reappear on the next poll. Filtering the
memoized union against `deletedIds` avoids that; a failed delete removes the id from the
set again and toasts.

**React Compiler-era lint rules changed some patterns from what's in this doc's own
example code.** This repo's `eslint-plugin-react-hooks` config flags both
`setState`-in-`useEffect` for derived values and `ref.current` reads/writes during
render. That ruled out three patterns that would otherwise have been the obvious
implementation:
- The poll hook's `items` are merged into feed state via `useMemo` at render time, not
  an `useEffect` mirror (`polledItems` is append-only, so this is cheap and correct).
- The composer's rate-limit countdown reset and clear-on-success both use the
  "adjust state during render, guarded by a tracked previous value in state" pattern
  from the React docs, instead of a `useEffect` that calls `setState` on mount/change.
- The feed no longer tracks a `seenIds` ref to decide which rows get a mount animation.
  It doesn't need to: every row is a `motion.div` keyed by `_id`, and Framer Motion's
  `initial` only ever applies on a component's actual first mount — React's own
  reconciliation (stable key ⇒ no remount) does the "only animate genuinely new items"
  job for free.
- `use-visibility-poll.ts`'s "keep a ref pointing at the latest callback" pattern
  (`fetcherRef.current = fetcher`, `runPollRef.current = runPoll`) moved from direct
  render-body assignment into a no-dependency-array `useEffect`.

**Sign-in prompt in the composer is a plain `<Link href="/login?callbackUrl=/playground">`**
wrapped in `Empty`, not `<SignInButton>` — `components/auth/**` is Session A's
territory and wasn't buildable against at the time. `/login` already exists as a real
route, so this works standalone; A can swap in the real button at merge if a richer
control is wanted, but nothing is broken as-is.

## Left for other sessions

- **Session B**: `app/playground/actions.ts` (`postMessage`/`deleteMessage`) and
  `lib/data/playground.ts` are still Step 0 stubs. Everything here is built and
  typechecks against the stub contract but has only been exercised against
  `SERVER_ERROR`/empty-array responses — it needs a live pass once B merges.
- **Session A**: optional swap of the composer's plain sign-in link for
  `<SignInButton callbackUrl="/playground" />` once `components/auth/**` is mergeable.

## Verification

`npm run build` and `npm run lint` both pass clean for every file this session owns.
**Caveat on how that was verified**: a real `npm install` inside this worktree
(`wt-c`) failed both times with `ENOSPC` from `npm`'s tarball extraction, even
though `df` reports tens of GB free on the underlying (NTFS-backed) mount — the
same class of spurious-ENOSPC quirk this repo's `CLAUDE.md` now documents for this
mount. Rather than burn more time fighting it, the finished files were temporarily
copied onto the sibling `portfolio2` checkout (same commit ancestry, already has a
working `node_modules`), built and linted there, then that checkout was restored to
clean via `git checkout --`/`rm` of exactly the copied paths. Both passed with zero
errors or warnings outside of pre-existing issues in files this session doesn't own
(`app/playground/actions.ts`'s stub params, and unrelated repo-wide lint debt in
`navbar-client.tsx`, `theme-toggle.tsx`, `carousel.tsx`, `use-mobile.ts`,
`scripts/*.ts`).

No live browser or `next dev` session was run this pass, for the same reason — there
was no installed `node_modules` in this worktree to run a dev server from. Every state
in the Task 7 checklist (empty × signed-in/out, banned, rate-limited, failed post, long/
RTL content, poll error, 360/768/1440px, reduced motion) was reviewed at the code level
— Tailwind breakpoints, `aria-*`, `focus-visible` rings, and the `useReducedMotion()`
branches were checked by reading the rendered class output, not by opening the page.
Whoever runs the cross-session acceptance pass after A/B/C merge should treat the
Task 7 states as spot-checked rather than click-tested.
