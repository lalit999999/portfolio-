@AGENTS.md

# portfolio-

Personal portfolio site. Next.js 16 App Router + React 19 + Tailwind v4, with a full
shadcn/ui component library already vendored into `components/ui/`.

## Current state (read this first)

Phase 1 (data layer), Phase 2 (public site + animation system), and Phase 3 (GitHub
auth + live playground) are merged. Ten public/auth routes render actual content: `/`,
`/projects`, `/projects/[slug]`, `/skills`, `/certifications`, `/blogs`, `/contact`,
`/playground`, `/login`, plus the dev-only `/motion-lab` harness. `/admin` is a
middleware- and layout-guarded placeholder for the Phase 4 CMS. `app/layout.tsx` sets
real metadata (title derived from the profile data, not the CNA default).

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
deliberately near-black in *both* modes, since orange at a lightness that reads as
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

## Layout & conventions

```
app/          routes, layout, globals.css
app/admin/    middleware- + layout-guarded, Phase 4 placeholder
app/playground/  public-read live chat, gated at the action level
components/ui/  61 shadcn components — generated, treat as vendored
components/motion/  12 motion primitives (Reveal, Stagger, Magnetic, Tilt, ...)
components/auth/  SignInButton, UserMenu, AuthStatus
hooks/        use-mobile.ts (768px breakpoint)
lib/utils.ts  cn() = twMerge(clsx(...))
lib/data/     cached fetchers per model, plus playground.ts (deliberately uncached)
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