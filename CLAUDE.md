@AGENTS.md

# portfolio-

Personal portfolio site. Next.js 16 App Router + React 19 + Tailwind v4, with a full
shadcn/ui component library already vendored into `components/ui/`.

## Current state (read this first)

Phase 1 (data layer: models, validators, seed scripts) and Phase 2 (public site +
animation system) are both merged. The site is real: `/`, `/projects`,
`/projects/[slug]`, `/skills`, `/certifications`, `/blogs`, `/contact`, and the
dev-only `/motion-lab` harness all render actual content, and `app/layout.tsx` sets
real metadata (title derived from the profile data, not the CNA default).

Routes read from MongoDB via `lib/db.ts` / `models/**`. Without a live `MONGODB_URI`
(`.env.local`, gitignored) some routes will error — that's a missing-env-var issue,
not broken code.

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

## Stack specifics that will trip you up

**Next.js 16.3.0.** See `AGENTS.md` above — this is newer than most training data and
has breaking changes. Read `node_modules/next/dist/docs/` before writing anything that
touches framework APIs (params, searchParams, caching, route handlers, config).

**Typed routes are generated.** `app/layout.tsx` uses `LayoutProps<"/">` — a global type
Next generates into `.next/types/`. Use `LayoutProps<route>` / `PageProps<route>` rather
than hand-writing `{ children }: { children: React.ReactNode }`. These types only exist
after a dev/build run, so a cold clone will show phantom TS errors until then.

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
the top of `app/globals.css`.

## Layout & conventions

```
app/          routes, layout, globals.css
components/ui/  61 shadcn components — generated, treat as vendored
hooks/        use-mobile.ts (768px breakpoint)
lib/utils.ts  cn() = twMerge(clsx(...))
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
- `.env*` and `next-env.d.ts` are gitignored. No environment variables are used yet.
- `next.config.ts` is empty apart from the type import.
- The `AGENTS.md` block is rewritten by `next dev`. If it reappears as an uncommitted
  change, commit it alongside your work rather than reverting it.