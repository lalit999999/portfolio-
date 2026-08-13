# Phase 3 — Session A summary (auth core, middleware, auth chrome)

## What was built

- `auth.config.ts` — edge-safe NextAuth config: GitHub provider (`read:user` scope
  only), JWT sessions, `pages.signIn: "/login"`, an `authorized` callback for `/admin`.
  No Mongoose/`@/lib/db`/`@/models` in its import graph.
- `auth.ts` — Node-runtime NextAuth instance. `signIn` upserts `User` by `githubId`
  (coerced to string), refreshes profile fields on every login, sets `role`/`isBanned`
  only on insert (`$setOnInsert`) so a login never re-promotes or un-bans anyone.
  Returns `false` for banned users. `jwt` re-reads the user doc on sign-in and stamps
  `id`/`githubId`/`username`/`role`/`isBanned` onto the token; `session` copies those
  onto `session.user`.
- `app/api/auth/[...nextauth]/route.ts` — thin handler re-export.
- `middleware.ts` — guards `/admin/:path*`. No session → redirect to
  `/login?callbackUrl=<path>`. Session but non-admin → `NextResponse.rewrite("/")`
  (see decisions below). Admin → `NextResponse.next()`. Instantiated from
  `auth.config` only, never from `@/auth`.
- `lib/auth/session.ts` — `getSessionUser()` (never throws, `null` when signed out),
  `requireUser()` (redirects to `/login` on null), `isAdmin()`. `"server-only"`.
- `components/auth/sign-in-button.tsx`, `user-menu.tsx`, `auth-status.tsx` — the
  client/server split the contract specifies. `SignInButton` uses `getBrandIcon("github")`
  with a `lucide-react` `LogIn` fallback (lucide-react v1 has no `Github` icon), wrapped
  in `Magnetic`, shows a `Spinner` while the redirect is in flight.
- `components/site/navbar.tsx` / `navbar-client.tsx` — added the Playground nav item
  after Certifications; `<AuthStatus />` rendered inline on desktop (`hidden sm:block`)
  and inside the mobile `Sheet`, pinned to the bottom with `mt-auto`.
- `app/login/page.tsx` — reads `callbackUrl` from `searchParams` (a Promise in Next 16),
  sanitizes it against open-redirect (must start with `/`, not `//`), redirects already
  signed-in users straight there.
- `app/admin/layout.tsx` + `page.tsx` — `requireUser()` + `isAdmin()` defense-in-depth
  guard, minimal placeholder showing username/role.
- `CLAUDE.md` — rewritten *Current state*, added an *Auth* section, updated *Layout &
  conventions* and *Notes* for Phase 3 reality.

## Decisions

- **403 vs. redirect for non-admin `/admin` access**: chose `NextResponse.rewrite("/")`
  in middleware, not a redirect and not an explicit 403 page. A rewrite keeps the URL
  bar on `/admin` but silently serves the homepage, so a non-admin visitor gets no
  distinct signal that `/admin` exists (as instructed). `app/admin/layout.tsx` mirrors
  this with a plain `redirect("/")` for the same case, since middleware's `rewrite` API
  isn't available from a layout.
- **Ban / JWT staleness**: intentionally *not* solved with a DB read on every `jwt`
  call (that's a query per request). A ban applied mid-session won't take effect until
  the JWT rotates or the user re-authenticates; real enforcement is at the mutation
  call sites (Session B's `postMessage` re-checks `isBanned` from the DB).
- **`requireUser()` has no `callbackUrl` param** — the contract fixes its signature
  with no arguments, so on redirect it goes to a plain `/login` rather than
  `/login?callbackUrl=...`. Only middleware (which does have the request) attaches a
  precise `callbackUrl`.
- **Motion glow retune (Task 6, second half): no changes made.** `spotlight-card.tsx`,
  `shine.tsx`, `scroll-progress.tsx`, and `profile-photo.tsx` were already retuned for
  the warm-orange primary in the pre-Phase-3 theme migration (`git log` shows this in
  `b94aa08` and `64a1730`, both ancestors of the Step 0 commit) — `profile-photo.tsx`
  even carries a comment explaining the dimmer halo gradient. Verified they read
  correctly in dark mode; left untouched rather than making a no-op commit.
- **Navbar shadow**: the setup doc expected a literal `rgba(28,20,12,0.35)` replacing
  an old hardcoded slate value. What's actually there is
  `color-mix(in oklch, var(--color-foreground), transparent 85%)` — theme-aware and
  strictly better than a literal color, so left as-is.

## Left for other sessions / the user

- **`.env.local` is missing `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`,
  `ADMIN_GITHUB_ID`, `AUTH_TRUST_HOST`.** This is one of the setup doc's explicit hard-stop
  conditions. Everything here builds and typechecks, and the redirect logic is verified
  (see below), but the actual GitHub OAuth round-trip, the `User` upsert, the
  duplicate-login/ban checks, and `session.user.role` end-to-end all need those vars —
  I could not test them this session. Local MongoDB (`127.0.0.1:27017`) is up and
  reachable (`/projects` renders fine), so once the auth vars are added the flow should
  just work.
- **Every route is now server-rendered on demand, not static.** `<AuthStatus />` is a
  Server Component that calls `auth()`, rendered from the navbar, which lives in the
  root layout (read-only this phase) — so `/`, `/projects`, `/skills`, etc. all lost
  static generation, confirmed by `npm run build`'s route table (all `ƒ` now, previously
  mostly `○`). This is an inherent consequence of putting session-aware chrome in
  global nav under the current (non-PPR) rendering model, not a bug — flagged here
  because it's a real build-output change worth knowing about, and because enabling
  `experimental.ppr` in a later phase would be the fix (requires touching
  `next.config.ts`, out of scope this phase).
- **Two dev-environment hazards found on this machine**, now documented in `CLAUDE.md`:
  Turbopack refuses a `node_modules` symlink pointing outside the project root (so
  `git worktree` + shared `node_modules` doesn't work here), and running `next build`
  while a `next dev` server is live in the same directory produces a spurious `ENOSPC`
  on this NTFS-backed mount even with disk space free. Neither is a Phase 3 code issue.
- **Visual QA at 360/768/1440px across both themes and `prefers-reduced-motion`**
  wasn't done in a real browser this session (no browser automation available). Code
  review: `SignInButton` wraps in `Magnetic` (already `useReducedMotion`-aware), the
  mobile auth slot is inside the existing `Sheet` with `mt-auto`, desktop slot is
  `hidden sm:block`. Worth a manual spot-check before calling the phase fully done.

## Verification performed

- `npm run build` — succeeds (exit 0). Only console noise is a non-fatal
  `UntrustedHost` warning during static-generation of the auth-aware pages, caused by
  the missing `AUTH_TRUST_HOST`/`AUTH_*` vars above; it doesn't fail the build.
- `npx tsc --noEmit` — clean.
- `npm run lint` — zero errors/warnings in every file this session touched. The
  repo-wide lint run has 39 pre-existing errors / 8 warnings, all outside Session A's
  ownership (`components/ui/carousel.tsx`, `hooks/use-mobile.ts`,
  `hooks/use-visibility-poll.ts`, `scripts/extract.ts`, `scripts/seed.ts`,
  `lib/data/playground.ts` stub warnings).
- `curl` against a live `next dev` on port 3000: `/admin` signed-out → `307` to
  `/login?callbackUrl=%2Fadmin` ✓; `/login` renders the expected copy ✓; `/` renders
  the signed-out navbar with "Sign in with GitHub" and the new "Playground" nav item ✓.
- Edge bundle check: the middleware chunk (`.next/server/edge/chunks/...`) is 304K
  and contains zero occurrences of `mongoose`.
- `git log --format="%an %ae%n%b" -12` — no `Co-Authored-By`, no "Generated with".
