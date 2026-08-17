# Lalit Gurjar — Portfolio

Personal portfolio site for **Lalit Gurjar**, Full Stack Developer building full-stack
AI applications — LLM API integration (OpenAI, Anthropic), scalable backend
architecture, and responsive frontends. B.Tech Computer Science student at NIT Patna,
AWS Cloud Practitioner and Oracle OCI AI Foundations certified.

Built with Next.js 16 (App Router) + React 19 + Tailwind v4, backed by MongoDB, with
GitHub OAuth admin auth and a full CRUD dashboard for managing every piece of content
on the site — no hardcoded data, no CMS.

## What's on the site

- **`/`** — hero, about, currently-learning, featured projects, skills preview
- **`/projects`**, **`/projects/[slug]`** — project list and detail pages
- **`/skills`** — skills grouped by category (languages, frameworks, backend &
  infrastructure, database, devops & deployment, tools)
- **`/certifications`** — AWS, Oracle OCI, and course certifications with credential links
- **`/blogs`** — posts pulled live from Hashnode blog sources
- **`/contact`** — contact form (rate-limited via Upstash Redis)
- **`/playground`** — public live chat/message board, gated by GitHub sign-in
- **`/lalit`** — admin dashboard (GitHub OAuth, admin-only): stats overview plus CRUD
  for profile, projects, skills, certifications, education, socials, blog sources,
  inbox, and playground moderation

## Stack

- **Framework**: Next.js 16.3 (App Router, Turbopack), React 19, TypeScript
- **Styling**: Tailwind v4 (CSS-first theming, no `tailwind.config.js`), shadcn/ui
  (`radix-luma` style, stone base), Radix UI primitives, Motion for animation
- **Data**: MongoDB via Mongoose, `unstable_cache`-backed fetchers
- **Auth**: NextAuth v5 (GitHub provider, JWT sessions, no adapter)
- **Forms/validation**: react-hook-form + Zod
- **Media**: Cloudinary (signed uploads for admin content)
- **Rate limiting**: Upstash Redis (contact form)

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev                  # http://localhost:3000
```

### Environment variables

See `.env.example` for the full list. You'll need:

- `MONGODB_URI` — a running MongoDB instance
- `NEXT_PUBLIC_SITE_URL`
- `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `ADMIN_GITHUB_ID`,
  `AUTH_TRUST_HOST` — GitHub OAuth app + admin sign-in
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`,
  `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` — admin image uploads
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — contact form rate limiting

### Seeding data

`scripts/seed-data/*.json` holds the real content (profile, projects, skills,
certifications, education, socials, blog sources) used to seed a fresh database —
see the scripts in `scripts/` for the corresponding seeders.

### Other commands

```bash
npm run build   # production build (also typechecks)
npm run start   # serve a production build
npm run lint    # eslint
```

There's no test runner configured for this project.

## Project structure

```
app/(site)/        public + auth routes (home, projects, skills, certifications,
                    blogs, contact, playground, login) with shared nav/footer chrome
app/(admin)/lalit/  admin dashboard — GitHub-auth-gated CRUD for every content type
app/api/admin/      Cloudinary upload signing + drag-reorder endpoints
components/ui/      shadcn/ui component library
components/motion/  animation primitives (Reveal, Stagger, Magnetic, Tilt, ...)
components/admin/   admin data table, forms, uploader, sortable list, etc.
lib/data/           cached MongoDB data fetchers
lib/admin/          admin nav, collection registry, guards, revalidation
models/             Mongoose schemas
scripts/seed-data/  source-of-truth content used to seed the database
```

See `CLAUDE.md` and `AGENTS.md` for the full architecture notes, conventions, and
Next.js 16-specific gotchas this codebase relies on.
