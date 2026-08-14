# Phase 5 — framework migrations, SEO, rate limiting, deployment prep

## Status

Code-complete for everything reachable without external account access (Vercel,
Atlas, GitHub OAuth app settings). **Not yet deployed** — see "Deployment" below
for what's still outstanding and why it couldn't be done from this session.

## What shipped

### `middleware.ts` → `proxy.ts`

Renamed per Next 16.3's deprecation of the `middleware` file convention. The
`@next/codemod@canary middleware-to-proxy` codemod made no changes — it only
rewrites files with an identifiable `middleware` function identifier
(`export function middleware() {}`, `export { middleware }`, etc.), and this
file's default export is the anonymous return value of `auth((req) => {...})`,
so the codemod's file-path/AST match never fired. Renamed by hand (`git mv`);
the content needed no changes for the rename itself.

**Bug found and fixed while live-testing the three auth paths this step
requires:** `auth.config.ts`'s `authorized` callback checks
`auth?.user?.role === "admin"`, but NextAuth's default session shape only
carries `name`/`email`/`image` — `auth.config.ts` never defined a `session`
callback to project the rest of the JWT onto it (that only existed in
`auth.ts`, which proxy.ts's standalone `NextAuth(authConfig)` instantiation
doesn't use). `session.user.role` was `undefined` for every request through
the proxy layer. Non-admins correctly got rewritten to `/lalit/403`, but so
would a real admin — the role check could never be `true`. This is a
pre-existing bug, not something the rename introduced (`middleware.ts` had
the identical instantiation pattern), but nothing before this session had
live-tested the admin path with a real decoded token to catch it.

Fix: added `projectTokenToSession()` to `auth.config.ts` — pure, reads only
already-decoded JWT claims (stamped onto the token by `auth.ts`'s real `jwt`
callback at sign-in time), no DB access, so it's still edge-safe. `auth.ts`
now calls the same function instead of duplicating the five field-copy lines,
so the two configs can't drift apart again.

Verified live (not just reading response bodies) by minting signed session
JWTs locally with `next-auth/jwt`'s `encode()` against the real `AUTH_SECRET`,
for a `visitor` and an `admin` role, and hitting `/lalit` and `/lalit/projects`
with each as a cookie:

| Path | Result |
| --- | --- |
| Unauthenticated → `/lalit` | 307 → `/lalit/signin?callbackUrl=%2Flalit` |
| `/lalit/signin` unauthenticated | 200, no redirect loop |
| Non-admin → `/lalit`, `/lalit/projects` | 200 with `x-middleware-rewrite: /lalit/403` |
| Admin → `/lalit`, `/lalit/projects` | 200, no rewrite header |

### Admin dashboard crash (found via the same live test)

Getting the admin path to actually render (rather than just pass the proxy
guard) surfaced a second, unrelated bug: `/lalit` 500'd with `Tooltip must be
used within TooltipProvider`. `components/admin/admin-sidebar.tsx` passes a
`tooltip` prop to `SidebarMenuButton`, which renders `components/ui/tooltip.tsx`'s
`Tooltip` — but nothing in the admin shell ever rendered a `TooltipProvider`
ancestor. Fixed by wrapping `app/(admin)/lalit/(dashboard)/layout.tsx`'s
returned tree in `<TooltipProvider>`. Scoped to the admin layout, not the root
`Providers`, since it's the only place in the app that uses `Tooltip` today.

This means the admin dashboard was unreachable for a real signed-in admin
before this session — both bugs (`session.user.role` and the Tooltip crash)
had to be fixed together for `/lalit` to actually work.

### `unstable_cache` — kept, not migrated

Investigated the replacement path before touching anything, per the session
brief. `unstable_cache`'s only real replacement, `'use cache'`, requires
opting into Next's `cacheComponents` flag — this is **not a syntax swap**.
Per `node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md`,
enabling it means:

- Every `cookies()`/`headers()`/`searchParams` read outside a `<Suspense>`
  boundary becomes a build error, including `<AuthStatus />` in the navbar —
  which CLAUDE.md documents as *deliberately* forcing every route dynamic via
  `auth()` today. That architecture decision would need to be unwound.
- `generateStaticParams` returning `[]` becomes an error (projects currently
  render fully on-demand, no static params).
- Every route needs per-segment validation against the "instant navigation"
  model, with `instant = false` as an escape hatch to opt out incrementally.

That's a whole-app rendering-model migration touching the navbar, every admin
route (`requireAdmin()` reads the session via `cookies()`), the playground's
intentionally-dynamic routes, and `generateMetadata` functions — not the 9
files in `lib/data/`. Next's own "Previous Model" guide
(`caching-without-cache-components.md`) still documents `unstable_cache` with
the exact `tags`/`revalidate` API this codebase already uses, as the correct
approach for apps not on Cache Components. There's also no active build
warning for `unstable_cache` (unlike `middleware`, which printed one) —
confirmed by grepping Next's compiled build/server code for the string.

**Decision (confirmed with the user):** keep `unstable_cache` as-is. Adopting
Cache Components is real future work, but it's its own project with its own
regression surface — not something to fold into an "migrate 9 files" step
right before a deploy.

### Upstash rate limiting — contact form only

`app/(site)/contact/actions.ts`'s in-memory `Map` throttle is replaced with
`@upstash/ratelimit` (`Ratelimit.slidingWindow(3, "60 s")`, same numbers as
before) against Upstash Redis, configured in the new `lib/upstash.ts`. Same
IP-hash key, same honeypot, same Zod validation — only the storage backend for
the count changed. New env vars: `UPSTASH_REDIS_REST_URL`,
`UPSTASH_REDIS_REST_TOKEN` (added to `.env.example`).

Not live-tested end-to-end locally — this dev environment has no Upstash
credentials in `.env.local`. `Redis.fromEnv()` doesn't throw at construction
without them (confirmed directly), only when a request is actually attempted,
so the `/contact` page itself still renders; a real submission would fail at
request time until real credentials are set. Same shape of gap as Cloudinary
(`/api/admin/upload` 500s without its env vars) — an environment issue to
close during deployment, not a code defect.

### Playground rate limiter — kept DB-backed, not migrated to Redis

`lib/playground/rate-limit.ts`'s `checkAndConsume` does one atomic
`User.findOneAndUpdate` that combines the ban check and the cooldown
check-and-set in a single query — `{ _id, isBanned: false, lastMessageAt: ... }`
as the filter means a banned user or a user mid-cooldown can't slip through a
race window.

Moving the cooldown counter to Redis would split that into two systems:
Redis would own the rate/cooldown state, Mongo would still own `isBanned`
(the actual moderation source of truth, edited from `/lalit/playground`).
A request would need to check both — and in the gap between "Redis says
you're not rate-limited" and "Mongo says you're not banned," a user banned
moments earlier could still get one message through. The current single-query
approach can't have that race by construction. Redis would also not reduce
round trips — the ban check still requires a Mongo read either way. Net: a new
external dependency, for a coordination problem the existing design already
solves correctly. Left as-is; comment in the file points back to this doc.

### SEO

- `app/sitemap.ts` — static routes plus project entries from
  `getProjectSlugs()`, wrapped in `try/catch` (falls back to the static routes
  alone on an Atlas blip rather than failing the build).
- `app/robots.ts` — disallows `/lalit` and `/api`; points `sitemap` at
  `${NEXT_PUBLIC_SITE_URL}/sitemap.xml`.
- Person JSON-LD on `/` (name, tagline, avatar, email, location, `sameAs`
  from socials). `SoftwareSourceCode` JSON-LD on `/projects/[slug]` (title,
  summary, tech as `programmingLanguage`, `codeRepository`, `dateCreated`).
- Per-route `title`/`description` metadata for `/projects`, `/skills`,
  `/certifications`, `/blogs`, `/contact` already existed — that part of the
  original audit predates the work that added it and is stale on this point.
- **What was actually missing, found by checking rendered `<meta>` tags with
  curl rather than trusting the presence of a `title` field:** none of those
  five pages set their own `openGraph` object. Next's metadata merge is
  shallow *per segment* — a page that only sets top-level `title`/`description`
  inherits the root layout's entire `openGraph` object unchanged, so all five
  were sharing the homepage's `og:title`/`og:description` in real crawler-facing
  output. `/projects/[slug]` had the mirror-image bug: it already set its own
  `openGraph`, but only `{ images }`, which (same shallow-merge rule) replaced
  the parent's `openGraph` outright — so project pages had an OG image but no
  `og:title`/`og:description` at all. Fixed by giving every one of these six
  routes an explicit `openGraph.title`/`description` (plus `images` on the
  project page). Verified via `curl | grep` against the actual rendered
  `<meta property="og:*">` tags, before and after.
- Not yet verified against a real external crawler (Facebook/Twitter/LinkedIn
  debugger tools) — that requires a public URL, which doesn't exist until
  deployment. The rendered-HTML verification above is the furthest this could
  be checked pre-deploy; re-verify with a real crawler once live.

## Deployment

**Not done in this session.** Everything under this heading requires access
to external accounts (Vercel dashboard, MongoDB Atlas dashboard, the GitHub
OAuth app's settings) that this environment doesn't have credentials for.
What's left, for whoever has that access:

1. **Atlas Network Access** — allowlist `0.0.0.0/0` (Vercel build/runtime IPs
   aren't static). Without it the build fails at "Collecting page data for
   /projects/[slug]" (the `sitemap.ts` try/catch added this session softens
   the build-time symptom there specifically, but every other DB-backed route
   still needs real access at runtime).
2. **Vercel env vars** — all of: `MONGODB_URI`, `NEXT_PUBLIC_SITE_URL`,
   `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `ADMIN_GITHUB_ID`,
   `AUTH_TRUST_HOST`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
   `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`,
   `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`. Do **not** set
   `NEXTAUTH_URL` or `NEXTAUTH_SECRET` — v4 names, NextAuth v5 silently
   ignores them.
3. **GitHub OAuth app** — add the production callback URL
   (`https://<production-domain>/api/auth/callback/github`). The dev callback
   won't work in production.
4. **`NEXT_PUBLIC_SITE_URL`** must be the real production origin —
   `metadataBase`, every OG URL, the sitemap/robots URLs, and both new JSON-LD
   blocks all derive from it.

### What was verified locally, that deployment depends on

- `npm ci` succeeds in a genuinely clean clone (`git clone` to a scratch
  directory, not just `rm -rf node_modules`) — confirmed this session.
- `npx next typegen && npx tsc --noEmit && npx eslint && npm run build` all
  pass clean on every commit in this phase — no deprecation warnings in the
  build output (the middleware warning is gone; there was never a hard
  `unstable_cache` one to begin with).

### Post-deploy smoke test — still to run once live

- `/` renders with real data
- GitHub sign-in works end to end
- `/lalit` is guarded: unauthenticated → signin, non-admin → 403 (proxy logic
  re-verified locally with minted tokens this session; still worth confirming
  against a real GitHub sign-in in production)
- An admin edit appears on the public site without a redeploy
- Playground posts and polls
- Contact form sends and is rate-limited (first real test of the Upstash
  wiring — untested locally, no credentials in this environment)
- Cloudinary upload works (resume + photo)
- Dark and light mode reviewed on a real device
- OG previews checked with a real crawler/debugger tool (Facebook Sharing
  Debugger, Twitter Card Validator, or similar) — not just curl against the
  HTML, which only proves the tags are correct, not that a crawler renders
  them
- Lighthouse SEO ≥ 95
- `robots.txt` disallows `/lalit` and `/api` (code verified; re-check the
  deployed output matches)
