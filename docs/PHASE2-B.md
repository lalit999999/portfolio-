# Phase 2 — Session B: Chrome & Home

## What was built

**`components/site/`**
- `navbar.tsx` — async Server Component wrapper: awaits `getProfile()` and
  `getBlogSources()`, derives nav items (Blogs only when a source has
  `isActive: true`), passes them to the client leaf.
- `navbar-client.tsx` — the animated leaf. `position: fixed` (not `sticky`, to
  avoid transform/sticky interaction jank), shrinks 72px → 56px and deepens
  its blur past 80px of scroll via `useMotionValueEvent(scrollY, ...)`, hides
  past 200px on scroll-down / reveals on scroll-up. Active-route pill is a
  `motion.span` with `layoutId="nav-pill"`. `⌘K` button dispatches a
  `toggle-command-palette` window event rather than lifting state into the
  layout, since palette and navbar are siblings under `RootLayout`. Mobile
  nav is a shadcn `Sheet`; each link is wrapped in `SheetClose` so it closes
  on navigate for free — no extra effect needed.
- `footer.tsx` — four-column layout (brand+status / explore / connect /
  now+resume), server component taking `profile`, `socials`, `showBlogs` as
  props from the layout. Pulsing availability dot respects
  `motion-reduce:hidden`.
- `command-palette.tsx` — cmdk-based, global `⌘K`/`Ctrl+K` listener plus the
  navbar's custom event, skips the shortcut when an input/textarea/
  contenteditable is focused. Groups: Pages, Projects (search by title/tech),
  Theme, External (GitHub via `getBrandIcon`, Resume).
- `dot-grid-background.tsx` — thin wrapper, `fixed inset-0 -z-10`, low
  opacity, `pointer-events-none`.

**`components/portfolio/`** — all five shared cards from the contract, plus
the home page sections (`hero`, `profile-photo`, `about`, `education`,
`learning`, `socials`, `featured-projects`, `latest-posts`, `contact-cta`).

`profile-photo.tsx` is the one piece with real custom CSS: `app/globals.css`
gained an `@property --ring-angle` registration plus `ring-spin` /
`glow-breathe` `@keyframes` (appended after the existing `@layer base` block,
`:root`/`.dark` untouched) so the conic-gradient ring can actually animate
its angle instead of snapping. Orbit icons (Node/MongoDB/Docker/React) come
from `getBrandIcon` — the wrapping container has no `overflow-hidden` so they
can sit visually outside the avatar circle.

**`app/`**
- `layout.tsx` — stayed a Server Component. `generateMetadata` builds
  title/description/OG/Twitter from `getProfile()`. Fetches
  `getProfile/getSocials/getProjects/getBlogSources` once via `Promise.all`
  and passes them to Footer and CommandPalette (Navbar fetches its own slice
  independently, per the contract's explicit split). `data-scroll-behavior="smooth"`
  added to `<html>`.
- `page.tsx` — old Phase-1 smoke test fully deleted. `revalidate = 3600`,
  one `Promise.all`, sections composed Hero → About → Education → Learning →
  Featured Projects → Latest Posts → Socials → Contact CTA. Falls back to a
  plain message if `getProfile()` is null rather than crashing.
- `loading.tsx` — skeleton blocks sized to match Hero/About/Education/
  Featured-Projects proportions.
- `error.tsx`, `not-found.tsx` — built on `components/ui/empty.tsx`.

## Decisions worth flagging

- **Fixed, not sticky, navbar.** The contract says "sticky" but hide/reveal
  via `transform` on a `position: sticky` element fights the browser's own
  sticky recalculation. Used `fixed` with the same visual result; content
  sections got `pt-*`/`scroll-mt-24` to compensate for the navbar floating
  over content instead of pushing it.
- **Route casts.** `typedRoutes` is on and Session C's routes
  (`/projects`, `/skills`, `/certifications`, `/blogs`, `/contact`,
  `/projects/[slug]`) didn't exist yet when most of this was written, so
  every link to them uses `as Route`. Harmless once the routes exist — cast
  values still have to be real strings, this only widens the type.
- **`Github` isn't exported by this `lucide-react` version** (v1 dropped
  brand icons — same gotcha as `getBrandIcon("linkedin")` returning null).
  Session C caught this in `project-card.tsx` and `command-palette.tsx`;
  fixed both with the `getBrandIcon("github")` + inline `<svg>` pattern
  `SkillCard` already used.
- **CommandPalette takes `resumeUrl?` and `showBlogs?`** in addition to the
  `projects`/`socials` the prompt named — needed both to build the External
  and Pages groups and didn't want to fetch inside a client component.

## Verification

- `npx tsc --noEmit` — clean, repo-wide.
- `npm run build` — succeeds; all routes from all three sessions compile and
  prerender (`/`, `/projects`, `/projects/[slug]` ×7, `/skills`,
  `/certifications`, `/blogs`, `/contact`, `/motion-lab`).
- Seeded a local MongoDB (`.env.local` was pointed at it, separately) via
  `npx tsx scripts/seed.ts` and confirmed `/` renders real profile/education/
  project/social data through a fresh `next dev` — first check falsely
  suggested a null profile, which turned out to be a leftover zombie
  `next-server` process still bound to :3000 from an earlier run, not a code
  bug. Confirmed clean on a fresh port with `.next/cache` cleared.
- Did not get to a real browser for the 360/768/1440 × light/dark ×
  reduced-motion matrix — no browser tool available in this session. Please
  eyeball the dev server before merging; the animated pieces most worth a
  manual look are the navbar hide/reveal, the profile-photo ring/orbit, and
  the mobile Sheet stagger.

## Left for others

- `lib/db.ts` picked up a placeholder-URI guard (`isPlaceholderMongoUri`)
  sometime during this session — not authored by me, already present when I
  got to verification. Left it in place since it's a strict improvement and
  changes no signature.
- `.env.example` had a stray real-looking local URI briefly (flagged by
  Session C, already reverted); restored the `NEXT_PUBLIC_SITE_URL` line
  their revert had dropped.
- Everything under `app/projects`, `app/skills`, `app/certifications`,
  `app/blogs`, `app/contact`, `app/api`, `lib/data/**` is Session C's; not
  touched except by reading the exported signatures.
- `components/motion/**` real implementations are Session A's; consumed only
  through the documented props.
