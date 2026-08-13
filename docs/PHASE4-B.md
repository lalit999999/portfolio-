# Phase 4 — Session B: Content entities

Branch `phase-4-b-content`. Built the admin CMS for the four content entities:
Projects, Skills (+ SkillCategory), Certifications, Education.

## What's built

All four entities have: live (uncached) admin data layer in `lib/admin/`,
server actions in `app/(admin)/lalit/<entity>/actions.ts` (each starting with
`requireAdmin()`, each mutation ending with `revalidateCollection(...)`),
list UI, create/edit UI, delete, toggle-visibility, and drag-reorder.

- **Projects** (`/lalit/projects`) — the full pattern: async slug-availability
  check on blur, a creatable category field, image upload slot, live preview
  link (disabled when hidden), read-only view count, duplicate action,
  featured/hidden filter, type-to-confirm delete (types the project title).
- **Skills** (`/lalit/skills`) — one route, two tabs. Categories use inline
  dialogs and drag-reorder; skills are grouped by category with reorder
  scoped to each group. Deleting a category with skills attached is blocked
  (`CONFLICT`, "Move or delete its N skills first").
- **Certifications** (`/lalit/certifications`) — color enum driven by
  `CERT_COLORS`/`certColorMap`, expiry-after-issue validation, "Expired"
  badge in the list.
- **Education** (`/lalit/education`) — simplest of the four; empty `endDate`
  renders as "Present".

Every list route has a `loading.tsx` skeleton, matching the public-site
convention.

## Decisions made along the way

**Pre-existing broken build on `main`, fixed with explicit user sign-off.**
Before touching anything, `npm run build` failed on a clean pull of `main`:
`components/playground/composer.tsx` and `playground-feed.tsx` imported
`@/app/playground/actions`, which stopped existing when Step 0 restructured
into route groups — the actions module moved to
`app/(site)/playground/actions.ts`, but `page.tsx`/`loading.tsx`/`error.tsx`
never moved with it, so `/playground` was also rendering outside the
`app/(site)` chrome. Fixed by moving the three files into
`app/(site)/playground/` and repointing the two broken imports. First commit
on this branch, kept separate from entity work.

**`certificationCreateSchema` can't be imported into client code.**
`lib/validators/certification.ts` imports `CERT_COLORS` from
`models/Certification.ts`, which imports `mongoose` — pulling that into a
`"use client"` component breaks the browser bundle (`Can't resolve 'tls'`,
`'timers/promises'`). `lib/validators/*` and `models/*` are frozen/read-only
for this phase, so instead of editing them, `certifications/client-schema.ts`
hand-mirrors the shape with a duplicated `CERT_COLORS_CLIENT` tuple, used
only for the client form. Server actions still validate against the real
`certificationFormSchema` (`certifications/schema.ts`, importing the real
model-backed schema) — the client copy only drives form UX, per the house
rule that client validation isn't the security boundary. **Worth fixing at
the source eventually**: moving `CERT_COLORS` to a constants module with no
model import would remove the need for this workaround. None of the other
three validators have this problem — `project.ts`, `skill.ts`,
`skillCategory.ts`, and `education.ts` don't import from `models/`.

**Drag-reorder is wired against the frozen contract, not a working endpoint.**
`POST /api/admin/reorder` (`ReorderRequest`/`ReorderResponse` from
`types/admin.ts`) doesn't exist yet — it's Session A's file and Step 0 didn't
include it. All four entities' reorder UI calls it exactly per the frozen
shape (`{ collection, ids }`), so reordering will 404 until that route ships,
but nothing on this branch needs to change when it does.

**Two form-fields.tsx gaps worked around locally, not by editing the stub:**
- `SelectField` has no creatable/free-text option, so Projects' category
  field (which needs "pick an existing one or type a new one") is a small
  local `CategoryField` using a plain `<input list>` + `<datalist>` instead —
  native creatable-with-suggestions, no new dependency.
- `TextareaField` has no way to request a taller/monospace textarea, so
  Projects' `description` field is a local `DescriptionField` built directly
  on `Controller` + `Textarea` rather than the shared component.
- `TextField` has no `type` passthrough, so `githubUrl`/`liveUrl`/
  `credentialUrl` render as `type="text"` rather than `type="url"`; URL
  shape is still enforced by the Zod `.url()` validators.

**Type-to-confirm delete (Projects only) is a controlled dialog, not
`RowActions`' built-in delete.** `RowActions.onDelete` always opens the
generic `ConfirmDialog` internally — no way to swap in a different dialog
through that prop. `ProjectDeleteDialog` is instead driven by one piece of
state on the table (`deleteTarget`), opened via a `RowActions` `extra` item
rather than `onDelete`.

**Skills' pre-scaffolded `new/` and `[id]/` routes were deleted.** Skills and
categories are both created/edited via dialog on the single `/lalit/skills`
route (§7 of the brief), so the two placeholder routes Step 0 scaffolded
were dead code — nothing links to them. Deleted rather than left as
unreachable "Coming in Phase 4" pages.

**`ImageUploader`/`FileUploader` are still visual-only stubs** (Session A's
file, correctly untouched) — the image fields render and accept a value/
onChange, but there's no real Cloudinary upload wired up yet. Expected per
Step 0 scope, not a bug in this branch.

**`ConfirmDialog`'s `variant="destructive"` prop is accepted but not
applied** — the stub doesn't use it for styling. Left as-is; not mine to fix.

## Testing performed vs. not performed

- `npm run build` (typecheck + full route generation) passes.
- `npm run lint` is clean on every file this branch touches. The pre-existing
  repo-wide lint failures (`react-hooks/set-state-in-effect` in
  `theme-toggle.tsx`, `carousel.tsx`, `use-mobile.ts`, `navbar-client.tsx`;
  `@typescript-eslint/no-explicit-any` in `scripts/extract.ts`/`seed.ts`) are
  untouched by this branch and were already present/in progress elsewhere
  before this session started.
- All Definition-of-Done greps pass: every action starts with
  `requireAdmin()`; every `revalidateCollection(...)` tag matches
  `lib/data/`'s real tags (including plural `"educations"`); no raw palette
  classes/hex/rgba in any file this branch touches; `git diff main` is empty
  for `app/globals.css`, `package.json`, `package-lock.json`,
  `lib/validators/**`, `models/**`, and every frozen `components/admin/*` /
  `lib/admin/{guard,revalidate,action,nav,collections}.ts` file; zero
  `Co-Authored-By` trailers in this branch's history.
- Verified live against `dev` + the real `MONGODB_URI`: all five new guarded
  routes (`/lalit/{projects,skills,certifications,education}`,
  `/lalit/projects/new`) correctly redirect unauthenticated requests to
  `/login` (confirms `requireAdmin()` end-to-end, not just typechecking),
  and the playground regression fix serves real content again.
- **Not performed**: signed-in click-through of the actual admin screens
  (create/edit/delete/reorder against live data, dark-vs-light visual
  review). Every one of these routes is behind `requireAdmin()`, and
  exercising them needs a real GitHub sign-in as the configured
  `ADMIN_GITHUB_ID` user — credentials this session doesn't have. Build and
  lint catch structural issues; they don't confirm the screens look or
  behave right. Worth a manual pass before merging.

## Things Session A or C should know

- The playground fix above touches files outside this session's ownership
  list (`components/playground/*`, `app/(site)/playground/*`) — flagged to
  the user before making the change, approved, and kept in its own commit
  (`fix: finish playground route-group move, repair broken action imports`)
  so it's easy to review or revert independently of the entity work.
- `/api/admin/reorder` needs to exist for any of the four entities' reorder
  UI to actually work — see "Drag-reorder" above.
- The `certificationCreateSchema`/`models/Certification.ts` coupling
  described above will bite anyone else who tries to import
  `lib/validators/certification.ts` into client code, not just this branch.
