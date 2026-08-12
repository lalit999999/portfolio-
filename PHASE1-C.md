# Phase 1 — Session C (scripts/, lib/data/, app/page.tsx)

## Commands

```bash
npx tsx scripts/extract.ts          # old data -> scripts/seed-data/*.json (safe, no DB)
npx tsx scripts/seed.ts             # upsert seed-data/*.json into Atlas (idempotent, never deletes)
npx tsx scripts/seed.ts --fresh     # deleteMany() every seeded collection first, then upsert
                                     # (prints the Atlas host and requires typing "yes")
```

`extract.ts` has been run and verified — see counts below. `seed.ts` has been
written, typechecks, and its validation path has been exercised
end-to-end (all 8 collections pass Zod validation); the actual Atlas write
has **not** been run because `.env.local` still holds a placeholder
`MONGODB_URI="mongodb+srv://..."`. Run it for real once a live connection
string is in place.

## Source data deviation

The brief points at `/tmp/old-portfolio`, which does not exist on this
machine. `scripts/extract.ts` falls back (in order) to `$OLD_DATA_DIR`, then
`/tmp/old-portfolio/src/app/data`, then the sibling project
`../portfolio1/src/app/data` — the last of which is what was actually used.

## Content fixes applied

- **Tagline**: trimmed trailing whitespace and fixed grammar —
  `"Node js guy which build scalable solution "` → `"...who builds scalable solution"`.
- **Profile description**: fixed 3 missing spaces after periods
  (`frontends.Technical`, `Socket.IO.Currently`, `workflows.Looking`) and
  split the ~1400-char blob into 4 paragraphs along its natural topic breaks
  (background → tech stack → education/certs → what I'm looking for).
- **MiniYouTube Backend**: `liveUrl` pointed at its own GitHub URL — cleared
  to `""`, `githubUrl` kept.
- **Blog sources**: 3 entries named `"GIt & github"` normalised to
  `"Git & GitHub"`. Numeric `id` fields dropped entirely (see discrepancy
  note below — no host collisions existed, so "de-duplicate by host" was a
  no-op beyond dropping the ids).
- **All records**: numeric `id` fields dropped, replaced with `order` =
  array index; every array-collection record stamped `isVisible: true`.

## Discrepancy vs. the brief

The brief states blog-config.ts has "four entries sharing `id: 5`" — the
actual source file has **five** (`nteworkdevices`, `jwtexplainedsimply`,
`recursivednsworking`, `dnsrecordsineasywayo`, `curlcommandinlinux`, all
`id: 5`). All 9 total entries were kept (ids dropped regardless); none were
duplicates by `host`.

## Project title → slug

| Title | Slug |
|---|---|
| PollMan – Full-Stack Real-Time Poll & Survey Platform | `pollman-full-stack-real-time-poll-survey-platform` |
| Super Alein - AI-powered Gmail + Google Calendar command center | `super-alein-ai-powered-gmail-google-calendar-command-center` |
| Real-time Rider Location Tracking Application | `real-time-rider-location-tracking-application` |
| Local Service Booking Platform (Full stack application) | `local-service-booking-platform-full-stack-application` |
| Nebula CheckGrid (Real-time Application) | `nebula-checkgrid-real-time-application` |
| WDC Induction Platform | `wdc-induction-platform` |
| MiniYouTube Backend | `miniyoutube-backend` |

No collisions occurred (no `-2` suffixing was needed).

## Record counts (extract.ts output)

| Collection | Records |
|---|---|
| profile | 1 |
| education | 2 |
| skill-categories | 6 |
| skills | 25 |
| projects | 7 |
| certifications | 3 |
| socials | 4 |
| blog-sources | 9 |

## Fields invented / approximated (not confidently derivable from old data)

Session B's actual models (`models/`) landed with more required fields than
the old data ever captured. Rather than block on that, `extract.ts` fills
them with clearly-documented placeholders/derivations:

- **`Skill.proficiency`** (required, 0–100): old data has no notion of skill
  proficiency. Every skill defaulted to **75**. This needs a real content
  pass before the value means anything.
- **`Project.summary`** (required): old data only has one `description`
  field. Derived as the first sentence of `description`, capped at 160
  chars (falls back to a truncated `description` when there's no
  sentence-ending punctuation, e.g. the PollMan project).
- **`Education.field`** (required): old data has no separate "field of
  study". Derived from the degree title via an `" in X"` regex match (e.g.
  `"B.Tech in Computer Science"` → `"Computer Science"`); falls back to the
  full degree string when the pattern doesn't match (the 12th-grade entry).
- **`Education.startDate`/`endDate`** (required/optional `Date`): old data
  only had loose strings (`"2024 - present"`, `"2023"`). Parsed to
  `Date(year, 0, 1)`; a bare single year is used for both `startDate` and
  `endDate` (a school record with only one data point). Approximate by
  construction — there's no day/month precision in the source.
- **`Education.description`**: the old `board` field (`"RBSE"`) has no
  matching schema field, so it was folded in as `"Board: RBSE"`.

## Could not confidently migrate

- **`portfolioData.learning.note`** (`"Currently deep diving into AI
  integration and system design things."`) has no home on the `Profile`
  schema (`name/tagline/description/avatarUrl/location/email/resumeUrl/
  currentlyLearning/availableForWork`). Dropped. `currentlyLearning`
  (the `technologies` array) was migrated.

## Known gap: `server-only` package not installed

`lib/data/*.ts` should import `"server-only"` per the contract, but the
`server-only` npm package isn't in `node_modules` or `package-lock.json`,
and `package.json` is outside this session's scope (and `npm install` is
off-limits). The files were written **without** that import so the app
isn't left broken. Once someone who owns `package.json` adds
`server-only` as a dependency, add `import "server-only";` as the first
line of each file in `lib/data/`.

## app/page.tsx verification

Ran `npm run dev` and hit `/` with a placeholder `MONGODB_URI`: the route
compiled and rendered its `force-dynamic` server read, failing only at the
expected DNS step (`querySrv EBADNAME`) — confirms the page, `lib/data`,
and `@/models`/`@/lib/db` wiring are all correct up to the point where a
real Atlas connection string is needed.
