# Phase 2 — Setup & Contract

**Commit this file to the repo root before starting any session.** All three prompts begin by reading it.

Repo: `github.com/lalit999999/portfolio-` · Phase 1 is merged and working.

---

## What already exists (do not rebuild)

| Path | State |
|---|---|
| `models/*` | 12 Mongoose models, all done |
| `lib/db.ts` | `globalThis` connection cache, done |
| `lib/data/*` | 7 fetchers, already wrapped in `unstable_cache` + tags + `revalidate: 3600` |
| `lib/icons.ts` | `getIcon(name)` → LucideIcon, `getBrandIcon(name)` → SimpleIcon \| null, `certColorMap` |
| `lib/validators/*` | Zod schemas incl. `message.ts` |
| `types/models.ts` | `SerializedProfile`, `SerializedProject`, `SerializedSkill`, … — **import types from here, never redefine** |
| `components/ui/*` | ~60 shadcn components, `radix-luma` style, stone base |
| `components/providers.tsx` | next-themes wrapper |
| `components/theme-toggle.tsx` | done |
| `app/globals.css` | Full oklch token set, violet/indigo primary, light + dark |
| `app/layout.tsx` | Geist / Geist Mono / Space Grotesk via CSS vars |
| `hooks/use-mobile.ts` | done |

**`app/page.tsx` is a Phase-1 smoke-test dump. It gets deleted in Phase 2.**

---

## ⚠️ STEP 0 — run ONCE, before opening any session

Three sessions running `npm install` at the same time will corrupt `package-lock.json`.

```bash
# 1. the only new runtime dependency in Phase 2
npm i motion

# 2. regenerate Next 16 route types (PageProps / LayoutProps helpers)
npx next typegen

# 3. reference copy of the old Vite site — all sessions read from here, none write
git clone --depth 1 https://github.com/lalit999999/lalit_portfolio.git /tmp/old-portfolio

# 4. confirm .env.local has a REAL Atlas URI, not the placeholder.
#    Phase 1 left a placeholder and `/` 500s because of it.
grep MONGODB_URI .env.local

# 5. generate the shared stubs — THIS IS WHAT MAKES THE SESSIONS PARALLEL
bash scripts/phase2-stubs.sh
```

Then open three terminals in the repo root and paste one prompt into each.

> Optional extra safety: `git worktree add ../wt-a && git worktree add ../wt-b && git worktree add ../wt-c`, then merge at the end. Not required — the ownership table below already guarantees zero file collisions on a single branch.

---

## Why stubs

Session B and Session C both import motion primitives that Session A is still writing. Without stubs, two of the three sessions spend the whole run staring at unresolved-import errors and start "helpfully" creating each other's files. With stubs, everything typechecks from minute one, and each session only ever *replaces* files it owns.

Save this as `scripts/phase2-stubs.sh` and run it once:

```bash
#!/usr/bin/env bash
set -euo pipefail
mkdir -p components/motion components/portfolio

stub_motion () { # $1 = filename, $2 = body
  [ -f "components/motion/$1" ] || printf '%s\n' "$2" > "components/motion/$1"
}

cat > components/motion/tokens.ts <<'EOF'
// Shared motion constants. Session A owns this file.
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_BACK_OUT = [0.34, 1.56, 0.64, 1] as const;
export const SPRING_SOFT = { type: "spring", stiffness: 120, damping: 20 } as const;
export const SPRING_SNAPPY = { type: "spring", stiffness: 300, damping: 25 } as const;
export const SPRING_MAGNETIC = { type: "spring", stiffness: 200, damping: 15, mass: 0.5 } as const;
export const VIEWPORT_ONCE = { once: true, margin: "-80px" } as const;
export const DUR = { fast: 0.3, base: 0.5, slow: 0.8 } as const;
EOF

stub_motion reveal.tsx '"use client";
import type { ReactNode } from "react";
export interface RevealProps { children: ReactNode; delay?: number; y?: number; blur?: boolean; once?: boolean; className?: string; as?: "div" | "section" | "article" | "li" | "header"; id?: string; }
export function Reveal({ children, className, id }: RevealProps) { return <div id={id} className={className}>{children}</div>; }'

stub_motion stagger.tsx '"use client";
import type { ReactNode } from "react";
export interface StaggerProps { children: ReactNode; gap?: number; delay?: number; className?: string; as?: "div" | "ul" | "section"; }
export function Stagger({ children, className }: StaggerProps) { return <div className={className}>{children}</div>; }
export interface StaggerItemProps { children: ReactNode; y?: number; className?: string; as?: "div" | "li"; }
export function StaggerItem({ children, className }: StaggerItemProps) { return <div className={className}>{children}</div>; }'

stub_motion magnetic.tsx '"use client";
import type { ReactNode } from "react";
export interface MagneticProps { children: ReactNode; strength?: number; radius?: number; className?: string; }
export function Magnetic({ children, className }: MagneticProps) { return <span className={className}>{children}</span>; }'

stub_motion shine.tsx '"use client";
export interface ShineProps { className?: string; duration?: number; }
export function Shine({ className }: ShineProps) { return <span aria-hidden className={className} />; }'

stub_motion spotlight-card.tsx '"use client";
import type { ReactNode } from "react";
export interface SpotlightCardProps { children: ReactNode; className?: string; beam?: boolean; lift?: boolean; delay?: number; as?: "div" | "article" | "li"; }
export function SpotlightCard({ children, className }: SpotlightCardProps) { return <div className={className}>{children}</div>; }'

stub_motion tilt.tsx '"use client";
import type { ReactNode } from "react";
export interface TiltProps { children: ReactNode; max?: number; perspective?: number; className?: string; disabled?: boolean; }
export function Tilt({ children, className }: TiltProps) { return <div className={className}>{children}</div>; }'

stub_motion typewriter.tsx '"use client";
export interface TypewriterProps { text: string | string[]; prefix?: string; speed?: number; startDelay?: number; loop?: boolean; className?: string; cursorClassName?: string; }
export function Typewriter({ text, className }: TypewriterProps) { return <span className={className}>{Array.isArray(text) ? text[0] : text}</span>; }'

stub_motion dot-grid.tsx '"use client";
export interface DotGridProps { gap?: number; radius?: number; dotSize?: number; className?: string; }
export function DotGrid({ className }: DotGridProps) { return <div aria-hidden className={className} />; }'

stub_motion orbit.tsx '"use client";
import type { ReactNode } from "react";
export interface OrbitItem { id: string; node: ReactNode; }
export interface OrbitProps { items: OrbitItem[]; radius?: number; duration?: number; reverse?: boolean; counterRotate?: boolean; className?: string; }
export function Orbit({ className }: OrbitProps) { return <div aria-hidden className={className} />; }'

stub_motion count-up.tsx '"use client";
export interface CountUpProps { to: number; from?: number; duration?: number; suffix?: string; className?: string; }
export function CountUp({ to, suffix, className }: CountUpProps) { return <span className={className}>{to}{suffix}</span>; }'

stub_motion scroll-progress.tsx '"use client";
export interface ScrollProgressProps { className?: string; height?: number; }
export function ScrollProgress({ className }: ScrollProgressProps) { return <div aria-hidden className={className} />; }'

cat > components/motion/index.ts <<'EOF'
export * from "./tokens";
export * from "./reveal";
export * from "./stagger";
export * from "./magnetic";
export * from "./shine";
export * from "./spotlight-card";
export * from "./tilt";
export * from "./typewriter";
export * from "./dot-grid";
export * from "./orbit";
export * from "./count-up";
export * from "./scroll-progress";
EOF

stub_card () { [ -f "components/portfolio/$1" ] || printf '%s\n' "$2" > "components/portfolio/$1"; }

stub_card project-card.tsx '"use client";
import type { SerializedProject } from "@/types/models";
export interface ProjectCardProps { project: SerializedProject; index?: number; compact?: boolean; className?: string; }
export function ProjectCard({ project, className }: ProjectCardProps) { return <div className={className}>{project.title}</div>; }'

stub_card certification-card.tsx '"use client";
import type { SerializedCertification } from "@/types/models";
export interface CertificationCardProps { certification: SerializedCertification; index?: number; className?: string; }
export function CertificationCard({ certification, className }: CertificationCardProps) { return <div className={className}>{certification.title}</div>; }'

stub_card skill-card.tsx '"use client";
import type { SerializedSkill } from "@/types/models";
export interface SkillCardProps { skill: SerializedSkill; index?: number; accent?: string; className?: string; }
export function SkillCard({ skill, className }: SkillCardProps) { return <div className={className}>{skill.name}</div>; }'

stub_card blog-post-card.tsx '"use client";
import type { SerializedBlogPost } from "@/types/models";
export interface BlogPostCardProps { post: SerializedBlogPost; sourceName?: string; index?: number; className?: string; }
export function BlogPostCard({ post, className }: BlogPostCardProps) { return <div className={className}>{post.title}</div>; }'

stub_card section-heading.tsx 'export interface SectionHeadingProps { eyebrow?: string; title: string; description?: string; align?: "left" | "center"; className?: string; }
export function SectionHeading({ title, className }: SectionHeadingProps) { return <h2 className={className}>{title}</h2>; }'

echo "Phase 2 stubs written."
```

Every stub uses `[ -f ] ||` so re-running never clobbers real work.

---

## File ownership — this is what makes it parallel-safe

| | **A — Motion system** | **B — Chrome & home** | **C — Inner routes & data** |
|---|---|---|---|
| **Owns (writes)** | `components/motion/**`, `app/motion-lab/**` | `app/layout.tsx`, `app/page.tsx`, `app/loading.tsx`, `app/error.tsx`, `app/not-found.tsx`, `components/site/**`, `components/portfolio/**` | `lib/data/**`, `app/projects/**`, `app/skills/**`, `app/certifications/**`, `app/blogs/**`, `app/contact/**`, `app/api/**`, `types/ui.ts` |
| **Imports (read-only)** | `lib/icons.ts` | `components/motion/**`, `lib/data/**`, `lib/icons.ts`, `types/models.ts` | `components/motion/**`, `components/portfolio/**`, `lib/icons.ts`, `types/models.ts` |
| **Never touches** | anything under `app/` except `app/motion-lab`, all of `lib/` | `components/motion/**`, `lib/data/**`, `app/projects` and siblings | `components/motion/**`, `components/portfolio/**`, `app/layout.tsx`, `app/page.tsx` |

`components/ui/**`, `models/**`, `lib/icons.ts`, `lib/db.ts`, `lib/validators/**`, `types/models.ts`, `scripts/**`, `next.config.ts`, `package.json` are **read-only for all three sessions**. If you think one of them needs a change, write it in your summary file instead of making it.

**Rule:** replace a stub only if you own it. If a stub in someone else's territory looks wrong, leave it and note it in your summary.

---

## THE CONTRACT — exported signatures

These are already in the stubs. Do not change names, prop names, or defaults; other sessions are writing against them right now.

### `components/motion/*` — Session A owns

```ts
<Reveal delay? y=20 blur=false once=true as="div" className? id?>
<Stagger gap=0.08 delay=0 as="div" className?> / <StaggerItem y=16 as="div" className?>
<Magnetic strength=8 radius=100 className?>          // wraps any element, renders a <span>
<Shine duration=700 className?>                       // absolute overlay; parent needs relative + overflow-hidden
<SpotlightCard beam=true lift=true delay=0 as="div" className?>
<Tilt max=12 perspective=1000 disabled=false className?>
<Typewriter text speed=45 prefix? startDelay=0 loop=false className? cursorClassName?>
<DotGrid gap=28 radius=120 dotSize=1.5 className?>    // canvas, absolute inset-0, pointer-events-none
<Orbit items radius=130 duration=20 reverse=false counterRotate=true className?>
<CountUp to from=0 duration=1.2 suffix? className?>
<ScrollProgress height=2 className?>
```

Tokens: `EASE_OUT`, `EASE_BACK_OUT`, `SPRING_SOFT`, `SPRING_SNAPPY`, `SPRING_MAGNETIC`, `VIEWPORT_ONCE`, `DUR`.

Import as `import { Reveal, SpotlightCard } from "@/components/motion"`.

### `components/portfolio/*` shared cards — Session B owns

```ts
<ProjectCard project index? compact=false className?>
<CertificationCard certification index? className?>
<SkillCard skill index? accent? className?>
<BlogPostCard post sourceName? index? className?>
<SectionHeading title eyebrow? description? align="left" className?>   // server component, no "use client"
```

`index` drives stagger delay: `delay={index * 0.08}`.

### `lib/data/*` — Session C owns

Existing signatures stay. C adds explicit return types and these new exports:

```ts
getProfile(): Promise<SerializedProfile | null>
getEducation(): Promise<SerializedEducation[]>
getSkillsByCategory(): Promise<(SerializedSkillCategory & { skills: SerializedSkill[] })[]>
getProjects(opts?: { featured?: boolean; limit?: number }): Promise<SerializedProject[]>
getProjectBySlug(slug: string): Promise<SerializedProject | null>
getCertifications(): Promise<SerializedCertification[]>
getSocials(): Promise<SerializedSocial[]>
getBlogSources(): Promise<SerializedBlogSource[]>
// new in Phase 2:
getBlogPosts(opts?: { limit?: number }): Promise<SerializedBlogPost[]>
getProjectSlugs(): Promise<string[]>
getAdjacentProjects(slug: string): Promise<{ prev: SerializedProject | null; next: SerializedProject | null }>
```

Until C lands the return types, annotate at your call site: `const projects: SerializedProject[] = await getProjects(...)`.

---

## Next.js 16.3 rules — verified against `node_modules/next/dist/docs/`

This project is on **Next 16.3.0 / React 19.2.8**, not 15. `AGENTS.md` requires reading the relevant doc in `node_modules/next/dist/docs/` before writing code. These are the ones that will actually bite:

1. **`params` and `searchParams` are Promises.** Synchronous access was fully removed in 16.
   ```tsx
   export default async function Page(props: PageProps<'/projects/[slug]'>) {
     const { slug } = await props.params;
   }
   ```
   `PageProps<'/route'>`, `LayoutProps<'/route'>`, `RouteContext<'/route'>` are global — no import. Run `npx next typegen` if they're missing.

2. **`unstable_cache` is deprecated in favour of `use cache`, but still works.** `cacheComponents` is not enabled in `next.config.ts`. **Keep `unstable_cache`. Do not migrate to `use cache` in Phase 2** — it's a config-level change that would break the other two sessions mid-flight.

3. **`revalidateTag` now takes a second `cacheLife` argument.** Single-arg form is a TypeScript error. Not needed in Phase 2 (no mutations yet) — flagged for Phase 4.

4. **Smooth scrolling needs an opt-in.** Next 16 no longer overrides `scroll-behavior` during navigation. If any anchor scrolling is used, `<html>` needs `data-scroll-behavior="smooth"`. Session B owns that line.

5. **`images.qualities` defaults to `[75]` only.** Any `quality` prop other than 75 is silently coerced. Don't pass `quality` unless `next.config.ts` is updated — and it's read-only this phase.

6. **View Transitions need no config.** `import { ViewTransition } from 'react'` — route navigations are Transitions, so it activates automatically. Chromium 125+ / recent Safari & Firefox; degrades silently elsewhere.

7. `images.domains` is deprecated — `remotePatterns` is already correct in `next.config.ts`. Cloudinary, `avatars.githubusercontent.com`, and `cdn.hashnode.com` are allowed; **any other image host will throw at runtime.**

8. Turbopack is the default bundler. Don't add webpack config.

---

## Design rules — all three sessions

**Use the existing tokens. Do not port the old site's colours.** Phase 1 deliberately replaced the old zinc/emerald/blue palette with a violet-indigo oklch system. Port *structure and content* from `/tmp/old-portfolio`, never its class names.

- Colour: `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-primary`, `bg-primary/10`, `ring-ring`. Zero hardcoded `zinc-*`, `emerald-*`, `blue-*`, `white`, `black`.
- One exception: `certColorMap` in `lib/icons.ts` has full static class strings for certification accents. Index into it — never build a class name by interpolation (`bg-${color}-500` gets purged by Tailwind v4).
- Radius: `rounded-lg` / `rounded-xl` / `rounded-2xl` (they derive from `--radius: 0.75rem`).
- Fonts: `font-sans` (Geist) body, `font-heading` (Space Grotesk) for headings, `font-mono` (Geist Mono) for terminal/code.
- The navbar's card treatment is the site's signature and is worth keeping: `rounded-xl border border-border/70 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75`, `max-w-6xl` container.

**Accessibility floor, enforced everywhere:**
- Every animated component calls `useReducedMotion()` from `motion/react`. When reduced motion is on: no transform, no parallax, no orbit, no typing, no canvas animation — opacity-only or instant. This is not optional; vestibular disorders make spinning and parallax genuinely nauseating.
- Animate **only `transform` and `opacity`**. Never `width`, `height`, `top`, `left` — they trigger layout on every frame.
- Works down to 360px wide.
- Visible focus rings on every interactive element (`focus-visible:ring-2 focus-visible:ring-ring`).
- Filter chips are real `<button>`s with `aria-pressed`. Icons that convey meaning get `aria-label`; decorative ones get `aria-hidden`.

**Server/client boundaries:**
- `app/layout.tsx` stays a **Server Component**. Never add `"use client"` to it — the whole tree would follow and SSG is lost.
- Pages are Server Components that fetch through `lib/data/*` and pass plain serialized objects down.
- `"use client"` goes on the smallest animated leaf, not the page.
- Anything using `motion/react`, `useState`, `useEffect`, or `cmdk` is a client leaf.

---

## Known Phase 1 gotchas

- `lucide-react` v1 has **no brand icons**. Brands come from `simple-icons` via `getBrandIcon()`, which returns `{ path, hex, title } | null`. Render as `<svg viewBox="0 0 24 24" fill="currentColor"><path d={icon.path} /></svg>`.
- **`getBrandIcon("linkedin")` returns `null`** — `siLinkedin` isn't in the installed simple-icons version. Every brand-icon call site needs a lucide fallback.
- There is **no `components/ui/form.tsx`** in this shadcn style. Use `components/ui/field.tsx` + a React 19 Server Action with `useActionState`. Don't install react-hook-form.
- `components/ui/` also has `empty.tsx` (empty states), `kbd.tsx` (⌘K hints), `spinner.tsx`, `skeleton.tsx` — use them instead of hand-rolling.
- Blog sources seed to **9 separate Hashnode publications**, several sharing the name "Git & GitHub". Group the `/blogs` filter by `name`, deduped.

---

## Definition of done — Phase 2 as a whole

The public site is complete, fully animated, respects `prefers-reduced-motion`, and needs no login.

Per session:
1. `npx tsc --noEmit` passes for the files you own.
2. `npm run build` succeeds (run it last; if it fails only on another session's files, say so in your summary rather than fixing them).
3. Every page you own renders with real Atlas data at 360px, 768px and 1440px, in both themes.
4. `prefers-reduced-motion: reduce` (DevTools → Rendering → Emulate CSS media feature) kills all motion on your pages without breaking layout.
5. Write `PHASE2-A.md` / `PHASE2-B.md` / `PHASE2-C.md` at the repo root — same format as the Phase 1 summaries: what you built, decisions you made, anything you deliberately left for another session.

## Merge order

A → B → C. A has no inbound dependencies, C has the most. Run `npm run build` and click through every route once after all three land.
