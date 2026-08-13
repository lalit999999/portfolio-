@AGENTS.md

# portfolio-

Personal portfolio site. Next.js 16 App Router + React 19 + Tailwind v4, with a full
shadcn/ui component library already vendored into `components/ui/`.

## Current state (read this first)

Phase 1 (data layer), Phase 2 (public site + animation system), and Phase 3 (GitHub
auth + live playground) are merged into `main`. Ten public/auth routes render actual
content: `/`, `/projects`, `/projects/[slug]`, `/skills`, `/certifications`, `/blogs`,
`/contact`, `/playground`, `/login`, plus the dev-only `/motion-lab` harness.
`app/layout.tsx` sets real metadata (title derived from the profile data, not the CNA
default).

**Branch `phase-4-a-foundation` (not yet merged) adds real `/lalit` auth, a real admin
shell, real shared admin primitives, and — merged in from session B's
`phase-4-b-content` branch — real CRUD UI for four collections** — see "Phase 4 (in
progress)" below. On `main`, `/admin` is still the middleware- and layout-guarded
Phase 3 placeholder; on this branch `/admin` no longer exists at all, superseded by
`/lalit`.

Routes read from MongoDB via `lib/db.ts` / `models/**` (12 Mongoose models). Without a
live `MONGODB_URI` (`.env.local`, gitignored) some routes will error — that's a
missing-env-var issue, not broken code. `lib/data/*` wraps most fetchers in
`unstable_cache` (1h revalidate); the playground fetchers in `lib/data/playground.ts`
are deliberately bare `async` functions — see the Auth section below for why.

## Commands

```bash
npm install
npm run dev     # next dev — http://localhost:3000
npm run build   # next build
npm run start   # next start (requires a prior build)
npm run lint    # bare `eslint`, NOT `next lint`
```

There is no test framework configured. Don't write tests against a runner that isn't
installed, and don't add one without asking. To verify changes, run `npm run build` —
it typechecks as part of the build (`tsc` is `noEmit`, so there is no standalone
typecheck script).

Only run `npm run build`/`npm run dev` from one process at a time per checkout. Turbopack's
`.next/` lockfile does not tolerate a concurrent `next dev` and `next build` sharing the
same directory — on this repo's NTFS-backed dev mount that collision surfaces as a
spurious `ENOSPC`/lockfile error with plenty of real disk free. Kill the dev server (or
build elsewhere) before running a one-off build. For the same reason, if you use
`git worktree` for parallel sessions, run a real `npm install` in each worktree rather
than symlinking `node_modules` from another checkout — Turbopack refuses to resolve a
symlink that points outside the project root.

## Stack specifics that will trip you up

**Next.js 16.3.0.** See `AGENTS.md` above — this is newer than most training data and
has breaking changes. Read `node_modules/next/dist/docs/` before writing anything that
touches framework APIs (params, searchParams, caching, route handlers, config).

**Typed routes are generated.** `app/layout.tsx` uses `LayoutProps<"/">` — a global type
Next generates into `.next/types/`. Use `LayoutProps<route>` / `PageProps<route>` rather
than hand-writing `{ children }: { children: React.ReactNode }`. These types only exist
after a dev/build run, so a cold clone will show phantom TS errors until then — run
`npx next typegen` after adding a new route if the new `PageProps<'/your-route'>` isn't
resolving yet.

**Tailwind v4, CSS-first.** There is no `tailwind.config.js` and there should not be.
All theming lives in `app/globals.css`:

- `@theme inline` maps Tailwind tokens to CSS custom properties
- `:root` / `.dark` define those properties as `oklch()` values
- radius is a scale computed from a single `--radius: 0.75rem` (`rounded-4xl` etc. are
  real, project-defined utilities — not typos)

Style with semantic tokens (`bg-background`, `text-muted-foreground`, `border-border`).
Avoid raw palette classes like `bg-zinc-50` — the CNA page uses them, but that page is
placeholder code, not a pattern to copy.

**Three primitive libraries coexist.** Don't consolidate them:

- `radix-ui` (the unified package) — most components. Import as
  `import { Slot } from "radix-ui"`, **not** `@radix-ui/react-slot`.
- `@base-ui/react` — `combobox.tsx` only
- `@shadcn/react` — `questionnaire.tsx`, `message-scroller.tsx`

## Theming

Colors come only from the semantic tokens defined in `app/globals.css` — never raw
Tailwind palette classes (`bg-blue-500`, `text-red-600`, ...) or raw hex/`rgba()`/`hsla()`
in components. The one exception is brand icons (e.g. `profile-photo.tsx`'s
`style={{ color: '#' + icon.hex }}`) — those are supposed to be literal brand colors.

**Dark mode is the reference design.** `.dark` in `app/globals.css` is designed first;
`:root` (light) is a derived, inverted-lightness version of the same hue family, not an
independently chosen palette.

Adding a token means touching three places together, or a shadcn component will
silently break: `:root`, `.dark`, and the `@theme inline` map (`--color-x: var(--x)`) at
the top of `app/globals.css`. The active palette is warm orange (primary `oklch(0.72
0.175 52)` in dark, `oklch(0.70 0.18 48)` in light) — `--primary-foreground` is
deliberately near-black in _both_ modes, since orange at a lightness that reads as
orange can't carry white text at 4.5:1. Don't "fix" that by putting white on primary.

## Auth

NextAuth v5 (`next-auth@beta`), GitHub provider, JWT sessions — no adapter, no database
sessions. The split is mandatory and easy to get wrong:

- `auth.config.ts` — edge-safe only (providers, `session.strategy`, `pages`, the
  `authorized` callback). Bundled into `middleware.ts`, which runs on the edge runtime.
  **Never import `mongoose`, `@/lib/db`, or `@/models` from this file or its import
  graph** — that silently balloons the edge bundle and can break the build with an
  opaque module-resolution error. `middleware.ts` instantiates `NextAuth(authConfig)`
  directly; it never imports `auth` from `@/auth`, for the same reason.
- `auth.ts` — Node runtime. Spreads `auth.config.ts` and adds the DB-touching
  `signIn`/`jwt`/`session` callbacks (upserts `User` on sign-in, stamps Mongo `_id` +
  `role` onto the JWT, copies them onto `session.user`).
- `lib/auth/session.ts` — `getSessionUser()` / `requireUser()` / `isAdmin()`, the
  read-only surface the rest of the app should use instead of calling `auth()`
  directly. Marked `"server-only"`.

`role` is resolved once, at sign-in, from `ADMIN_GITHUB_ID === String(profile.id)` —
never from anything client-supplied. A ban (`isBanned`) takes effect on next sign-in,
not mid-session, since the JWT isn't re-checked against the DB on every request; call
sites that mutate (e.g. posting a playground message) re-check `isBanned` from the DB
themselves rather than trusting the token.

`<AuthStatus />` (a Server Component) is rendered from the navbar, which is rendered
from the root layout — so every route now calls `auth()` during render and is forced
dynamic (no more static generation for `/`, `/projects`, etc., short of enabling PPR,
which isn't turned on). That's a deliberate trade-off of putting session-aware chrome
in global nav, not a bug.

Required env vars beyond the Phase 1/2 set: `AUTH_SECRET`, `AUTH_GITHUB_ID`,
`AUTH_GITHUB_SECRET`, `ADMIN_GITHUB_ID` (the admin's numeric GitHub id, not their
username), `AUTH_TRUST_HOST="true"`. Do not add `NEXTAUTH_URL` / `NEXTAUTH_SECRET` —
those are v4 names and NextAuth v5 silently ignores them.

## Phase 4 (in progress)

`phase-4-a-foundation` branch. Auth, the admin shell, and the shared admin primitives
are real. Session B's `phase-4-b-content` branch is merged in on top, so **certifications,
education, projects, and skills also have real per-collection CRUD UI now** — see below
for what's still a placeholder. Details and decisions in `docs/PHASE4-A.md` (this
session) and `docs/PHASE4-B.md` (session B).

- **New deps** (the only Phase 4 `npm install`): `react-hook-form`,
  `@hookform/resolvers` (v5, required for Zod 4 — v3 does not support it),
  `react-dnd` + `react-dnd-html5-backend`, `cloudinary` (Node SDK, server-side signing
  only — never install `next-cloudinary`, its peer range stops at Next 15).
- **Route groups**: `app/layout.tsx` is minimal (html/body/fonts/`Providers`/
  `Toaster` only). Site routes live in `app/(site)/`, which has its own `layout.tsx`
  carrying the chrome (`Navbar`, `Footer`, `DotGridBackground`, `CommandPalette`).
  Admin routes live in `app/(admin)/lalit/`. Route groups don't affect URLs. A
  route-group-only layout has no `LayoutProps<route>` from Next's typed-routes
  generator (no URL segment of its own) — hand-write `{ children: React.ReactNode }`
  for those, as `app/(site)/layout.tsx` and `app/(admin)/lalit/(dashboard)/layout.tsx`
  both do.
- **`/admin` is gone, superseded by `/lalit`.** The Phase 3 placeholder at `/admin`
  was deleted; all admin routes live under `/lalit` now (site-owner's name instead of
  `/admin`, for obscurity — a deliberate Phase 4 IA choice, not a typo).
  `middleware.ts` guards `["/lalit/:path*"]`: unauthenticated → redirect to
  `/lalit/signin?callbackUrl=...` (with `/lalit/signin` itself let through
  unconditionally, or it'd redirect to itself forever); authenticated non-admin →
  `NextResponse.rewrite` to `/lalit/403` (rewrite, not redirect, so a rewritten
  response can't loop back through the same guard). `app/(admin)/lalit/signin/` and
  `.../403/` are siblings of `app/(admin)/lalit/(dashboard)/`, not inside it — the
  `(dashboard)` group is what actually carries the `requireAdmin()` guard + sidebar
  shell, and signin/403 must stay outside that or visiting them would trigger the
  guard they exist to handle.
- **Frozen contracts**: `types/admin.ts` (`AdminActionState`, `AdminCollection`,
  `ReorderRequest`/`Response`, `UploadSignature`), `lib/admin/nav.ts` (sidebar nav),
  `lib/admin/collections.ts` (`COLLECTION_REGISTRY`, the only place a `reorder`
  request's `collection` field is trusted from — always validated against this
  enum, never interpolated from client input).
- **`components/admin/**` are real**, not stubs: `data-table.tsx` (client-side
  sort/search/paginate over an in-memory array — click-driven pagination, not
  URL-driven), `entity-form.tsx` (react-hook-form + Zod, pending state, field-error
  mapping, toast, dirty-reset, `beforeunload` guard), `form-fields.tsx`,
  `image-uploader.tsx`/`FileUploader` (real Cloudinary upload via
  `app/api/admin/upload`, `XMLHttpRequest` for real progress percentages),
  `sortable-list.tsx` (real `react-dnd` drag via `app/api/admin/reorder`, with
  keyboard up/down buttons on every row since the HTML5 DnD backend has no touch
  support), `row-actions.tsx`, `confirm-dialog.tsx`, `admin-page-header.tsx`,
  `stat-card.tsx`.
- **Certifications, education, projects, and skills have real CRUD UI**, each with its
  own `actions.ts` (Server Actions), Zod `schema.ts`, and a table/tabs component built
  on `data-table.tsx` (certifications/education/projects also have a dedicated
  `[id]`/`new` route pair and a form component). **Certifications alone also has a
  `client-schema.ts`**: `lib/validators/certification.ts` imports `CERT_COLORS` from
  `models/Certification.ts`, and that model file imports `mongoose` at module scope, so
  any client form importing the real validator would drag `mongoose` into the browser
  bundle and break the build. `client-schema.ts` hand-mirrors the schema with
  `CERT_COLORS` duplicated as a local literal for the client-side `zodResolver` only;
  the real, model-backed validator still runs server-side in `actions.ts`, which is the
  actual validation boundary regardless. `project.ts`/`skill.ts`/`skillCategory.ts`/
  `education.ts` don't import from `models/`, so they don't need this split. **Skills is
  the odd one out** for routing:
  it's a single page (`skills/page.tsx` → `skills-tabs.tsx`) with `category-dialog.tsx`
  / `skill-dialog.tsx` handling create/edit, not `[id]`/`new` routes — don't add those
  for skills, the UI doesn't link to them. Supporting data-layer reads live in
  `lib/admin/{certifications,education,projects,skills}.ts`, with shared Mongoose→JSON
  shaping in `lib/admin/serialize.ts`. blog-sources, inbox, playground, profile, and
  socials are still "Coming in Phase 4" placeholders — that CRUD UI is later work, out
  of scope for both sessions A and B.
- **New env vars**: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
  `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` (see `.env.example`) —
  without these `/api/admin/upload` 500s.
- **`revalidateTag` takes two arguments as of Next 16.3** — `revalidateTag(tag,
  profile)`. The single-arg form is deprecated. `lib/admin/revalidate.ts` uses
  `revalidateTag(tag, "max")`, matching Next's own recommended Server Action pattern.
- **react-dnd ref callbacks**: connect with `ref={(node) => { drag(node); }}`, not
  `ref={drag}` directly — react-dnd v16's connector return type doesn't structurally
  satisfy a plain ref-callback signature, and calling the connector directly during
  render also trips the `react-hooks/refs` lint rule.
- **Standing rule, restated because it's easy to get wrong**: never run `npx
  shadcn@latest init` (with or without a preset flag) on this repo, ever. It rewrites
  `app/globals.css` and would destroy the finished theme. `components.json` already
  has the right config (`style: "radix-luma"`, `baseColor: "stone"`); only `npx
  shadcn@latest add <component>` is safe.

## Layout & conventions

```
app/                    root layout (minimal), globals.css, favicon
app/(site)/             public/auth routes — has its own layout.tsx with site chrome
app/(admin)/lalit/      real admin auth guard + shell; signin/ and 403/ are unguarded
                        siblings, everything else is inside (dashboard)/ which is
app/api/admin/          upload (Cloudinary signing) and reorder — both admin-guarded
app/playground/         (inside app/(site)/) public-read live chat, action-level gate
components/ui/          61 shadcn components — generated, treat as vendored
components/motion/      12 motion primitives (Reveal, Stagger, Magnetic, Tilt, ...)
components/auth/        SignInButton, UserMenu, AuthStatus
components/admin/       real Phase 4 admin primitives (DataTable, EntityForm, ...)
hooks/                  use-mobile.ts (768px breakpoint)
lib/utils.ts            cn() = twMerge(clsx(...))
lib/data/                cached fetchers per model, plus playground.ts (uncached)
lib/admin/               nav.ts, collections.ts, guard.ts, action.ts, revalidate.ts
```

`@/*` resolves to the repo root, so `@/components/ui/button`, `@/lib/utils`.

Component authoring follows the shadcn house style already visible in
`components/ui/button.tsx`:

- plain `function Foo()` declarations, not `React.forwardRef`
- props typed as `React.ComponentProps<"button"> & VariantProps<typeof fooVariants>`
- a `data-slot="foo"` attribute on every rendered element (used for styling hooks)
- variants via `cva`, merged through `cn()` with `className` last so callers can override
- `asChild` implemented with `Slot.Root`
- **no default exports** — named exports only

Server Components are the default. 41 of the 61 UI components carry `"use client"`;
the other 20 are server-safe. Only add the directive when you actually need state,
effects, or event handlers, and put it on the leaf rather than a shared parent.

## Adding components

Use the CLI rather than hand-writing files — it respects `components.json`
(style `radix-luma`, base color `stone`, RSC on, lucide icons):

```bash
npx shadcn@latest add <component>
```

Existing files under `components/ui/` are generated output. Editing them is fine when
needed, but note the change clearly, since a future `add` can overwrite it.

## Notes

- Branch is `main`. Package name is `portfolio2`; repo is `portfolio-`.
- `.env*` and `next-env.d.ts` are gitignored. See the Auth section above for the full
  set of environment variables now required.
- `next.config.ts` is empty apart from the type import.
- The `AGENTS.md` block is rewritten by `next dev`. If it reappears as an uncommitted
  change, commit it alongside your work rather than reverting it.
