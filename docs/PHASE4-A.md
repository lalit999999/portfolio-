# Phase 4 — Session A: Step 0 summary

Step 0 only (scaffolding to unblock Sessions B/C). Sections 1–8 of the full Phase 4
Session A brief (real `/lalit` auth, the real `DataTable`/`EntityForm`/upload/reorder
implementations, the admin shell) are **not** done — this branch stops at Step 0 on
purpose, per explicit instruction. Everything below is stub-level, matching the
brief's own Step 0 scope.

## What was built

- **Deps**: `react-hook-form@^7.85`, `@hookform/resolvers@^5.7`, `react-dnd@^16`,
  `react-dnd-html5-backend@^16`, `cloudinary@^2.10`.
- **Route groups**: `app/layout.tsx` stripped to html/body/fonts/`Providers`/`Toaster`.
  All former root-level site routes moved into `app/(site)/` with a new
  `app/(site)/layout.tsx` carrying the chrome (`DotGridBackground`, `Navbar`, `Footer`,
  `CommandPalette`). New minimal `app/not-found.tsx` (no site chrome, since the root
  layout no longer supplies any).
- **`types/admin.ts`** — frozen contract: `AdminErrorCode`, `AdminActionState`,
  `ADMIN_COLLECTIONS`/`AdminCollection` (tag names verified against `grep -rn "tags:"
  lib/data/`), `ReorderRequest`/`ReorderResponse`, `UploadSignature`, `AdminStatCard`.
- **`lib/admin/*`** — `nav.ts` (frozen sidebar nav, grouped Content/Site/Community),
  `collections.ts` (`COLLECTION_REGISTRY` mapping `AdminCollection` to
  `{ model, tags, label }`), `revalidate.ts`, `guard.ts` (`requireAdmin`/`getAdmin`,
  built on the real `lib/auth/session.ts` from Phase 3 — not stubbed, since that
  underlying auth is already real on this repo), `action.ts` (`ok`/`fail`/`fromZodError`).
- **`components/admin/*`** — stub bodies with real exported signatures for
  `data-table.tsx`, `entity-form.tsx`, `form-fields.tsx` (all 8 field wrappers),
  `image-uploader.tsx`, `sortable-list.tsx`, `row-actions.tsx`, `confirm-dialog.tsx`,
  `admin-page-header.tsx`, `stat-card.tsx`.
- **24 placeholder pages** under `app/(admin)/lalit/**` (every route from the brief's
  §0.5 list), generated from a loop, each rendering `AdminPageHeader` + an `Empty`
  "Coming in Phase 4" state.
- **`.env.example`** — appended the four `CLOUDINARY_*` vars.
- **`scripts/phase4-setup.sh`** — idempotent record of the above, house-styled after
  `scripts/phase3-setup.sh`. Note: on this checkout Step 0 was executed file-by-file
  rather than by running this script top to bottom, because the sandboxed shell in
  this session intermittently lost `PATH` inside multi-command heredoc scripts
  (`mkdir`/`cat` reported "command not found" mid-script, silently producing empty or
  missing files). The script is nonetheless a faithful, guarded, re-runnable version
  of everything that was actually created — verified with `bash -n`.

## Decisions

- **`/admin` vs `/lalit` — left unreconciled, on purpose.** This repo already has a
  real, working, guarded admin implementation from Phase 3 at `/admin`
  (`middleware.ts` matcher `/admin/:path*`, `app/admin/layout.tsx`+`page.tsx`,
  end-to-end tested). The Phase 4 brief's own IA uses `/lalit` as the admin path
  (site-owner's name instead of `/admin`, for obscurity) and Step 0 §0.5 builds a
  parallel placeholder tree there. Migrating the real `/admin` implementation onto
  `/lalit` — updating `middleware.ts`'s matcher and `auth.config.ts`'s `authorized`
  callback, then deleting the old `app/admin/*` — is explicitly brief §3 ("real
  auth") work, not Step 0, and this session was scoped to Step 0 only. Both trees
  currently coexist: `/admin` is real and guarded; `/lalit/*` are new, unguarded
  placeholders (no middleware wired to them yet). **Whoever does §3 needs to make
  this migration** — see `middleware.ts` and `auth.config.ts`'s `authorized` callback.
- **`app/(site)/layout.tsx` prop typing** — Next's typed-routes generator only emits
  `LayoutRoutes` entries for layouts that own a real URL segment (`"/"`, `"/admin"`).
  A route-group-only layout like `app/(site)/layout.tsx` has no URL of its own, so
  there's no `LayoutProps<"/(site)">` to reach for; hand-wrote
  `{ children: React.ReactNode }` instead, with a comment explaining why.
- **`revalidateTag` takes two arguments as of Next 16** (`revalidateTag(tag, profile)`
  — single-arg is deprecated). Used `revalidateTag(tag, "max")` in
  `lib/admin/revalidate.ts`, matching the Next docs' own recommended Server Action
  example (`node_modules/next/dist/docs/.../revalidateTag.md`).
- **`EntityForm`'s generic**: `TSchema extends z.ZodType` alone left `z.input<TSchema>`
  resolving to `unknown`, breaking `zodResolver`. Constrained to
  `z.ZodType<unknown, FieldValues>` per the brief's own hint, and cast
  `zodResolver(schema)` through `unknown` to `Resolver<z.input<TSchema>>` at the one
  call site where `@hookform/resolvers`' generic inference still doesn't narrow
  correctly — a targeted, commented cast, not a blanket `any`.
- **Build verification**: `npm run build` couldn't be run cleanly end-to-end in this
  session — a live `next dev` kept running in the same checkout throughout (per
  CLAUDE.md's documented NTFS/Turbopack hazard, `next build` while `next dev` is live
  produces a spurious `ENOSPC`/lockfile error). Verified instead with
  `./node_modules/.bin/tsc --noEmit -p tsconfig.json` (zero errors, using the same
  `.next/dev/types` the live dev server was already generating) and `npm run lint`
  (zero issues in every new/touched file; the handful of pre-existing lint errors
  elsewhere in the repo — `hooks/use-mobile.ts`, `components/ui/carousel.tsx`,
  `scripts/extract.ts`, `scripts/seed.ts` — predate this branch). **Run a full
  `npm run build` with the dev server stopped before merging**, per the brief's own
  Definition of Done.

## Left for Sessions B, C, and future Session A work

- Everything in brief §1–8 beyond Step 0: real auth on `/lalit` (+ the `/admin` →
  `/lalit` migration above), the real `DataTable`/`EntityForm` implementations, real
  Cloudinary upload route + `ImageUploader`, real reorder route + `SortableList`
  (drag via `react-dnd`, with keyboard up/down fallback since HTML5 backend has no
  touch support), the admin shell (`app/(admin)/lalit/layout.tsx` with
  `requireAdmin()` + sidebar built on `components/ui/sidebar.tsx`).
- A full `npm run build` run with no concurrent dev server (see above).
- Visual QA of the new placeholder pages in both themes.
