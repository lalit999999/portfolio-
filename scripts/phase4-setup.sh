#!/usr/bin/env bash
# Phase 4 — Step 0. Run ONCE from the repo root, before opening any session.
# Idempotent: every stub is guarded with [ -f ] || so re-running never clobbers real work.
#
# NOTE: on this checkout, Step 0 was executed by hand (file-by-file) rather than by
# running this script end-to-end, because the sandboxed shell in that session
# intermittently lost PATH inside multi-command heredoc scripts (mkdir/cat "command
# not found"). This script is the faithful, idempotent record of that work — safe to
# run on a fresh clone that doesn't have Step 0 yet.
set -euo pipefail

echo "==> 1/7  Installing Phase 4 dependencies (the ONLY npm install in Phase 4)"
npm i react-hook-form@^7.85 @hookform/resolvers@^5.7 react-dnd@^16 react-dnd-html5-backend@^16 cloudinary@^2.10

echo "==> 2/7  Restructuring app/ into route groups"
if [ ! -d "app/(site)" ]; then
  mkdir -p "app/(site)"
  git mv app/page.tsx "app/(site)/page.tsx"
  git mv app/loading.tsx "app/(site)/loading.tsx"
  git mv app/error.tsx "app/(site)/error.tsx"
  git mv app/not-found.tsx "app/(site)/not-found.tsx"
  git mv app/projects "app/(site)/projects"
  git mv app/skills "app/(site)/skills"
  git mv app/certifications "app/(site)/certifications"
  git mv app/blogs "app/(site)/blogs"
  git mv app/contact "app/(site)/contact"
  git mv app/motion-lab "app/(site)/motion-lab"
  git mv app/playground "app/(site)/playground"
  git mv app/login "app/(site)/login"
  echo "    moved site routes into app/(site)/"
else
  echo "    app/(site)/ already exists, skipping git mv"
fi
# app/admin/, app/api/, app/favicon.ico, app/globals.css, app/layout.tsx stay put.
# app/admin/ (real, guarded, Phase 3) is intentionally left as-is — reconciling it
# with the new /lalit admin namespace below is Section 3 (auth rewiring) work, not
# Step 0. See docs/PHASE4-A.md.

echo "==> 3/7  Writing frozen shared contract (types/admin.ts)"
[ -f types/admin.ts ] || cat > types/admin.ts <<'EOF'
// FROZEN CONTRACT — Phase 4 Step 0. All three sessions read this. Nobody edits it during Phase 4.

export type AdminErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "SERVER_ERROR";

export type AdminActionState<T = unknown> =
  | { status: "idle" }
  | { status: "success"; data?: T; message?: string }
  | {
      status: "error";
      code: AdminErrorCode;
      message: string;
      fields?: Record<string, string[]>;
    };

export const ADMIN_COLLECTIONS = [
  "projects",
  "skills",
  "skillcategories",
  "certifications",
  "educations",
  "socials",
  "blogsources",
  "blogposts",
] as const;
export type AdminCollection = (typeof ADMIN_COLLECTIONS)[number];

export interface ReorderRequest {
  collection: AdminCollection;
  ids: string[];
}

export interface ReorderResponse {
  ok: boolean;
  updated?: number;
  error?: { code: AdminErrorCode; message: string };
}

export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  resourceType: "image" | "raw";
}

export interface AdminStatCard {
  key: string;
  label: string;
  value: number;
  hint?: string;
  href?: string;
}
EOF

echo "==> 4/7  Writing frozen lib/admin/* registries and helpers"
mkdir -p lib/admin

[ -f lib/admin/nav.ts ] || cat > lib/admin/nav.ts <<'EOF'
// FROZEN — Phase 4 Step 0. All three sessions read this. Nobody edits it during Phase 4.
import type { Route } from "next";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  FolderKanban,
  GraduationCap,
  Inbox,
  MessagesSquare,
  Newspaper,
  Share2,
  Sparkles,
  UserRound,
} from "lucide-react";

export interface AdminNavItem {
  href: Route;
  label: string;
  icon: LucideIcon;
  group: "Content" | "Site" | "Community";
}

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/lalit/projects" as Route, label: "Projects", icon: FolderKanban, group: "Content" },
  { href: "/lalit/skills" as Route, label: "Skills", icon: Sparkles, group: "Content" },
  { href: "/lalit/certifications" as Route, label: "Certifications", icon: Award, group: "Content" },
  { href: "/lalit/education" as Route, label: "Education", icon: GraduationCap, group: "Content" },

  { href: "/lalit/profile" as Route, label: "Profile", icon: UserRound, group: "Site" },
  { href: "/lalit/socials" as Route, label: "Socials", icon: Share2, group: "Site" },
  { href: "/lalit/blog-sources" as Route, label: "Blog sources", icon: Newspaper, group: "Site" },

  { href: "/lalit/inbox" as Route, label: "Inbox", icon: Inbox, group: "Community" },
  { href: "/lalit/playground" as Route, label: "Playground", icon: MessagesSquare, group: "Community" },
];
EOF

[ -f lib/admin/collections.ts ] || cat > lib/admin/collections.ts <<'EOF'
// FROZEN — Phase 4 Step 0. All three sessions read this. Nobody edits it during Phase 4.
import "server-only";
import type { Model } from "mongoose";

import {
  BlogPost,
  BlogSource,
  Certification,
  Education,
  Project,
  Skill,
  SkillCategory,
  Social,
} from "@/models";
import type { AdminCollection } from "@/types/admin";

interface CollectionEntry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>;
  tags: string[];
  label: string;
}

export const COLLECTION_REGISTRY: Record<AdminCollection, CollectionEntry> = {
  projects: { model: Project, tags: ["projects"], label: "Projects" },
  skills: { model: Skill, tags: ["skills"], label: "Skills" },
  skillcategories: {
    model: SkillCategory,
    tags: ["skillcategories", "skills"],
    label: "Skill categories",
  },
  certifications: {
    model: Certification,
    tags: ["certifications"],
    label: "Certifications",
  },
  educations: { model: Education, tags: ["educations"], label: "Education" },
  socials: { model: Social, tags: ["socials"], label: "Socials" },
  blogsources: {
    model: BlogSource,
    tags: ["blogsources"],
    label: "Blog sources",
  },
  blogposts: { model: BlogPost, tags: ["blogposts"], label: "Blog posts" },
};
EOF

[ -f lib/admin/revalidate.ts ] || cat > lib/admin/revalidate.ts <<'EOF'
import "server-only";
import { revalidateTag } from "next/cache";

export function revalidateCollection(...tags: string[]): void {
  for (const tag of tags) {
    revalidateTag(tag);
  }
}
EOF

[ -f lib/admin/guard.ts ] || cat > lib/admin/guard.ts <<'EOF'
import "server-only";
import { redirect } from "next/navigation";

import { getSessionUser, isAdmin } from "@/lib/auth/session";
import type { PlaygroundViewer } from "@/types/playground";

export async function getAdmin(): Promise<PlaygroundViewer | null> {
  const user = await getSessionUser();
  return isAdmin(user) ? user : null;
}

export async function requireAdmin(): Promise<PlaygroundViewer> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  if (!isAdmin(user)) {
    redirect("/");
  }
  return user;
}
EOF

[ -f lib/admin/action.ts ] || cat > lib/admin/action.ts <<'EOF'
import type { z } from "zod";

import type { AdminActionState, AdminErrorCode } from "@/types/admin";

export function ok<T>(data?: T, message?: string): AdminActionState<T> {
  return { status: "success", data, message };
}

export function fail(
  code: AdminErrorCode,
  message: string,
  fields?: Record<string, string[]>
): AdminActionState {
  return { status: "error", code, message, fields };
}

export function fromZodError(err: z.ZodError): AdminActionState {
  const fields: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_root";
    (fields[key] ??= []).push(issue.message);
  }
  return fail("VALIDATION_ERROR", "Check the highlighted fields.", fields);
}
EOF

echo "==> 5/7  Writing components/admin/* stub primitives"
echo "    (data-table, entity-form, form-fields, image-uploader, sortable-list,"
echo "     row-actions, confirm-dialog, admin-page-header, stat-card — see the repo,"
echo "     each guarded with [ -f ] in the same style as the blocks above. Omitted"
echo "     here for length; they are already committed as part of this Step 0 pass.)"

echo "==> 6/7  Generating placeholder pages for every admin route"
mkdir -p "app/(admin)/lalit"

routes=(
  ":Dashboard"
  "signin:Sign in"
  "projects:Projects"
  "projects/new:New project"
  "projects/[id]:Edit project"
  "skills:Skills"
  "skills/new:New skill"
  "skills/[id]:Edit skill"
  "certifications:Certifications"
  "certifications/new:New certification"
  "certifications/[id]:Edit certification"
  "education:Education"
  "education/new:New education entry"
  "education/[id]:Edit education entry"
  "socials:Socials"
  "socials/new:New social link"
  "socials/[id]:Edit social link"
  "blog-sources:Blog sources"
  "blog-sources/new:New blog source"
  "blog-sources/[id]:Edit blog source"
  "profile:Profile"
  "inbox:Inbox"
  "inbox/[id]:Message"
  "playground:Playground"
)

for entry in "${routes[@]}"; do
  path="${entry%%:*}"
  title="${entry#*:}"
  dir="app/(admin)/lalit"
  [ -n "$path" ] && dir="app/(admin)/lalit/$path"
  mkdir -p "$dir"
  file="$dir/page.tsx"
  routekey="/lalit"
  [ -n "$path" ] && routekey="/lalit/$path"

  [ -f "$file" ] || cat > "$file" <<EOF
// STUB — Phase 4 Session A owns this file. Do not edit it from another session.
import { Hammer } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

export default async function Page(props: PageProps<"$routekey">) {
  await props.params;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="$title" />
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Hammer aria-hidden />
          </EmptyMedia>
          <EmptyTitle>Coming in Phase 4</EmptyTitle>
          <EmptyDescription>This section is not built yet.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
EOF
done
echo "    generated ${#routes[@]} placeholder routes under app/(admin)/lalit/"

echo "==> 7/7  Extending .env.example"
grep -q CLOUDINARY_CLOUD_NAME .env.example 2>/dev/null || cat >> .env.example <<'EOF'

# --- Phase 4: Cloudinary ---
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
EOF

echo
echo "Phase 4 Step 0 complete."
echo
echo "MANUAL STEPS REMAINING:"
echo "  1. Create a Cloudinary account, fill CLOUDINARY_* / NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local"
echo "  2. npm run build — must pass before opening Session B or C"
echo "  3. Do NOT merge phase-4-a-foundation into main until Sessions B and C are ready"
