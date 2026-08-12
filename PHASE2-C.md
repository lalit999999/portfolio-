# Phase 2 — Session C (lib/data, inner routes, contact)

## What was built

**`lib/data/`**
- Added explicit return types (from `types/models.ts`) to every existing
  fetcher: `getProfile`, `getEducation`, `getSkillsByCategory`, `getProjects`,
  `getProjectBySlug`, `getCertifications`, `getSocials`, `getBlogSources`.
  Cache keys, tags, and `revalidate: 3600` are untouched.
- Tightened `serialize()` from `serialize<T>(doc: T): T` (which let a plain
  `as X` cast through even when `X` didn't structurally overlap with the lean
  doc type) to `serialize<T>(doc: unknown): T`, so call sites now write
  `serialize<SerializedProject>(doc)` instead of `serialize(doc) as
  SerializedProject`. Internal to `lib/data`, no external signature change.
- New: `getProjectSlugs()` — slugs only, own cache entry, for
  `generateStaticParams`.
- New: `getAdjacentProjects(slug)` — prev/next by `order`. Ends return `null`
  on that side (not a ring — `order` is a curated sequence).
- New: `lib/data/blogPosts.ts` → `getBlogPosts(opts?)`. Mongo `BlogPost`
  query is wrapped in its own `unstable_cache` (tag `blogposts`, revalidate
  3600). When it returns nothing, falls back to live Hashnode queries — see
  below.

## Hashnode fallback: implemented, but currently fails closed

`gql.hashnode.com` (the endpoint the brief names) now returns a permanent
**301 redirect** to `https://hashnode.com/announcements/graphql-api` for
*both* GET and POST, with realistic headers, confirmed via `curl -v`. This
isn't a WAF challenge (same result with a browser `User-Agent` and
`Accept: application/json`) — the endpoint appears to have moved or been
retired since training data was current. I could not find its replacement:
`api.hashnode.com` redirects to `/legacy-api`, `hashnode.com/api` doesn't
serve the GraphQL schema either, and the announcement page itself is
client-rendered so it didn't yield a URL via `curl`. `WebFetch` was also
blocked by network policy for this domain.

Given that, `getBlogPosts()` still implements the documented Public API v2
shape (`publication(host) { posts(first) { edges { node {...} } } }`),
fetched per active Hashnode `BlogSource` host via `Promise.allSettled` with
`fetch`'s own `next: { revalidate: 21600, tags: ["blogposts"] }` cache, and
degrades a failed/non-JSON/schema-mismatched response to `[]` for that host
rather than throwing. Right now all 9 seeded hosts fail this way, so
`/blogs` renders its empty state ("Posts sync periodically...") — which is
exactly the required fail-safe, just active 100% of the time until either
Mongo's `BlogPost` collection is seeded (Phase 5's real sync) or someone
finds the current endpoint.

## Routes

- **`/projects`** — server page + `projects-grid.tsx` client island: search
  (title/summary/tech), category tabs, tech chips (real `<button
  aria-pressed>`, via `Badge asChild`), result count, empty state. Filter
  state stays client-side and is mirrored to the URL with
  `history.replaceState` after mount (not read server-side, so the page
  stays statically rendered). Grid uses `<Stagger>` for the initial reveal
  plus `AnimatePresence`/`layout` on each card so filtering reorders instead
  of popping — all gated on `useReducedMotion()`.
- **`/projects/[slug]`** — SSG via `generateStaticParams`/`getProjectSlugs`,
  `dynamicParams = false`, `generateMetadata`, `notFound()` on miss,
  prev/next from `getAdjacentProjects`. Description is plain text rendered
  as `<p>` per line, no `dangerouslySetInnerHTML`.
- **`/skills`** — sticky category rail (horizontally scrollable pills on
  mobile) built from `getSkillsByCategory()`'s nested shape directly, "All"
  + per-category counts, same `AnimatePresence`/`layout` grid pattern.
- **`/certifications`** — `<Stagger>` grid of `<CertificationCard>`, empty
  state if none visible.
- **`/blogs`** — source filter deduped by `name` (several seeded Hashnode
  hosts share `"Git & GitHub"`); a post matches a filter group if its
  `source` id is in that group's set of ids, not a single host.
- **`/contact`** — `app/contact/actions.ts` Server Action
  (`submitContactForm`) using `contactSchema` from
  `lib/validators/message.ts` on both client (`required`/`maxLength`/`type`
  attributes) and server (authoritative). Honeypot field `website`
  (`max(0)`) silently no-ops on fill. Never echoes the submitted email back
  in the returned state. Form built with `components/ui/field.tsx` +
  `useActionState` + `useFormStatus` — no `react-hook-form`, none installed.

### Throttle

Module-scope `Map<ipHash, timestamp[]>` in `actions.ts`: max **3 submissions
per 60s window** per hashed IP (`sha256` of `x-forwarded-for` /
`x-real-ip`, never the raw IP), map capped at 500 entries (oldest evicted
past that). `await headers()` per Next 16. Per-instance and resets on
redeploy — comment in the file flags Upstash as the Phase 5 replacement.

### Toaster

No `<Toaster />` exists anywhere yet (checked `app/layout.tsx` and
`components/providers.tsx`) and I can't add one there — that file is Session
B's. Mounted `<Toaster />` locally at the bottom of `app/contact/page.tsx`
so contact-form toasts work. **Follow-up for whoever owns `app/layout.tsx`**:
hoist it to the root layout so toasts work sitewide, then this local one can
come out.

## Left in other sessions' territory

- Found `components/portfolio/project-card.tsx` importing `Github` from
  `lucide-react`, which doesn't exist in this version (same "brand icons
  removed" gotcha as `getBrandIcon("linkedin")` returning `null`). Flagged
  to Session B; they fixed it (same file, plus `command-palette.tsx`) using
  the `getBrandIcon` + inline-`<svg>` pattern already in `SkillCard`. My own
  `app/projects/[slug]/page.tsx` and `app/contact/page.tsx` use that same
  pattern for their own GitHub/social icons.
- `lib/data/*.ts` still doesn't `import "server-only"` — the package isn't
  in `package-lock.json` and `package.json` is off-limits this session, same
  gap Phase 1 Session C noted. Add it once someone who owns `package.json`
  installs the dependency.

## Verification

- `npx tsc --noEmit` is clean for the **entire repo** (not just my files) as
  of this write-up.
- `npm run lint`: clean for my files except one systemic issue —
  `react-hooks/set-state-in-effect` (a stricter, newer rule) flags
  `app/projects/projects-grid.tsx`'s "hydrate filter state from the URL
  after mount" effect. The identical pattern (`setState` directly in a
  mount effect) is already present and unfixed throughout the vendored/other
  code — `hooks/use-mobile.ts`, `components/theme-toggle.tsx`,
  `components/site/navbar-client.tsx`, `components/ui/carousel.tsx`,
  `components/motion/tilt.tsx`, `components/motion/typewriter.tsx`,
  `components/portfolio/skill-card.tsx` all trip the same rule. Left as-is
  for consistency with the rest of the codebase rather than inventing a
  one-off pattern; flagging here since `npm run lint` isn't in the
  contract's "Done when" list but is worth a follow-up pass by whoever owns
  the eslint config.
- **`npm run build` does not complete** — same blocker Session A already
  flagged: `.env.local` still has `MONGODB_URI="mongodb+srv://..."`, the
  Phase 1 placeholder. Build gets past compile and typecheck, then fails at
  "Collecting page data" with `querySrv EBADNAME` while statically
  generating `/projects/[slug]` (identical failure signature to Phase 1
  Session C's `npm run dev` check against `/`). Since every route I own
  exports `revalidate = 3600`, all of them need a real Atlas connection at
  build time, not just the SSG project pages — so I can't confirm
  `/projects/[slug]` actually generates one static page per seeded slug,
  can't confirm real-data rendering at 360/768/1440, and can't confirm a
  contact submission actually lands in Atlas. All of that is code-complete
  and typechecks against the real model/schema shapes, but is unverified
  against live data pending a real `MONGODB_URI`.
