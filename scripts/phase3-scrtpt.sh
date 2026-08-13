#!/usr/bin/env bash
# Phase 3 — Step 0. Run ONCE from the repo root, before opening any session.
# Idempotent: every stub is guarded with [ -f ] || so re-running never clobbers real work.
set -euo pipefail

echo "==> 1/6  Installing next-auth v5"
npm i next-auth@beta

echo "==> 2/6  Swapping theme tokens (violet -> dark-first warm orange)"
python3 - <<'PY'
import re, pathlib

css = pathlib.Path("app/globals.css")
src = css.read_text()

ROOT = """:root {
  /* Light mode is the WARM ORANGE derivation of the dark palette below.
     Same hue family (~48-75), same primary, inverted lightness. */
  --background: oklch(0.985 0.006 75);
  --foreground: oklch(0.19 0.012 55);
  --card: oklch(0.995 0.004 75);
  --card-foreground: oklch(0.19 0.012 55);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.19 0.012 55);
  --primary: oklch(0.70 0.18 48);
  --primary-foreground: oklch(0.18 0.025 50);
  --secondary: oklch(0.955 0.012 72);
  --secondary-foreground: oklch(0.26 0.015 55);
  --muted: oklch(0.955 0.012 72);
  --muted-foreground: oklch(0.47 0.022 58);
  --accent: oklch(0.94 0.045 68);
  --accent-foreground: oklch(0.32 0.08 45);
  --destructive: oklch(0.55 0.21 27);
  --border: oklch(0.90 0.014 68);
  --input: oklch(0.89 0.016 68);
  --ring: oklch(0.70 0.18 48);
  --chart-1: oklch(0.66 0.19 48);
  --chart-2: oklch(0.70 0.16 75);
  --chart-3: oklch(0.60 0.18 28);
  --chart-4: oklch(0.74 0.14 92);
  --chart-5: oklch(0.57 0.16 14);
  --radius: 0.75rem;
  --sidebar: oklch(0.97 0.010 72);
  --sidebar-foreground: oklch(0.19 0.012 55);
  --sidebar-primary: oklch(0.70 0.18 48);
  --sidebar-primary-foreground: oklch(0.18 0.025 50);
  --sidebar-accent: oklch(0.94 0.045 68);
  --sidebar-accent-foreground: oklch(0.32 0.08 45);
  --sidebar-border: oklch(0.90 0.014 68);
  --sidebar-ring: oklch(0.70 0.18 48);
}"""

DARK = """.dark {
  /* FULLY DARK. Near-black, faint warm cast (hue 60, chroma <= 0.006).
     Zero cool cast. Nothing above L 0.28 except text and primary. */
  --background: oklch(0.13 0.004 60);
  --foreground: oklch(0.96 0.004 75);
  --card: oklch(0.165 0.005 60);
  --card-foreground: oklch(0.96 0.004 75);
  --popover: oklch(0.175 0.005 60);
  --popover-foreground: oklch(0.96 0.004 75);
  --primary: oklch(0.72 0.175 52);
  --primary-foreground: oklch(0.16 0.03 52);
  --secondary: oklch(0.24 0.006 60);
  --secondary-foreground: oklch(0.96 0.004 75);
  --muted: oklch(0.21 0.005 60);
  --muted-foreground: oklch(0.68 0.012 65);
  --accent: oklch(0.28 0.045 52);
  --accent-foreground: oklch(0.90 0.06 62);
  --destructive: oklch(0.62 0.21 25);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 14%);
  --ring: oklch(0.72 0.175 52);
  --chart-1: oklch(0.72 0.175 52);
  --chart-2: oklch(0.75 0.15 78);
  --chart-3: oklch(0.68 0.16 28);
  --chart-4: oklch(0.78 0.13 95);
  --chart-5: oklch(0.65 0.14 12);
  --sidebar: oklch(0.155 0.005 60);
  --sidebar-foreground: oklch(0.96 0.004 75);
  --sidebar-primary: oklch(0.72 0.175 52);
  --sidebar-primary-foreground: oklch(0.16 0.03 52);
  --sidebar-accent: oklch(0.28 0.045 52);
  --sidebar-accent-foreground: oklch(0.90 0.06 62);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.72 0.175 52);
}"""

src = re.sub(r":root \{.*?\n\}", ROOT, src, count=1, flags=re.S)
src = re.sub(r"\.dark \{.*?\n\}", DARK, src, count=1, flags=re.S)
css.write_text(src)
print("    globals.css tokens replaced")
PY

echo "==> 3/6  Purging purple"
# certColorMap + CertColor type
sed -i 's/"purple"/"orange"/g; s/^  purple: {/  orange: {/; s/bg-purple-500/bg-orange-500/; s/text-purple-500/text-orange-500/; s/border-purple-500/border-orange-500/' lib/icons.ts
# Certification enum
sed -i 's/^  "purple",/  "orange",/' models/Certification.ts
# seed data
sed -i 's/"color": "purple"/"color": "orange"/g' scripts/seed-data/certifications.json
# navbar slate-900 shadow -> warm
sed -i 's/rgba(15,23,42,0.3)/rgba(28,20,12,0.35)/' components/site/navbar-client.tsx

if grep -rn "purple\|violet\|indigo\|fuchsia" --include="*.ts" --include="*.tsx" --include="*.css" --include="*.json" \
   app components lib models scripts types 2>/dev/null; then
  echo "    !! purple survivors above — fix before opening sessions"
else
  echo "    codebase is purple-free"
fi

echo "==> 4/6  Writing shared stubs"
mkdir -p lib/auth lib/playground components/auth components/playground app/playground

# ---------- auth.ts ----------
[ -f auth.ts ] || cat > auth.ts <<'EOF'
// STUB — Session A owns this file. Replace it.
import NextAuth from "next-auth";
import authConfig from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
EOF

# ---------- auth.config.ts ----------
[ -f auth.config.ts ] || cat > auth.config.ts <<'EOF'
// STUB — Session A owns this file. Replace it.
// EDGE-SAFE ONLY. Never import mongoose, @/lib/db, or @/models from here.
import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";

export default {
  providers: [GitHub],
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;
EOF

# ---------- types/next-auth.d.ts ----------
[ -f types/next-auth.d.ts ] || cat > types/next-auth.d.ts <<'EOF'
// STUB — Session A owns this file.
import type { UserRole } from "@/models/User";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      githubId: string;
      username: string;
      name?: string | null;
      image?: string | null;
      role: UserRole;
      isBanned: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    githubId?: string;
    username?: string;
    role?: UserRole;
    isBanned?: boolean;
  }
}

export {};
EOF

# ---------- types/playground.ts ----------
cat > types/playground.ts <<'EOF'
// SHARED CONTRACT — written by Step 0. All three sessions read this.
// Nobody edits it during Phase 3. Needs a change? Put it in your summary file.
import type { UserRole } from "@/models/User";

export interface PlaygroundAuthor {
  _id: string;
  username: string;
  name?: string;
  avatarUrl?: string;
  profileUrl?: string;
  role: UserRole;
}

export interface PlaygroundFeedItem {
  _id: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  editedAt?: string;
  author: PlaygroundAuthor;
  isOwn: boolean;
}

export interface PlaygroundMember {
  _id: string;
  username: string;
  name?: string;
  avatarUrl?: string;
  profileUrl?: string;
  role: UserRole;
  messageCount: number;
  lastMessageAt?: string;
}

export interface PlaygroundViewer {
  id: string;
  githubId: string;
  username: string;
  name?: string;
  avatarUrl?: string;
  role: UserRole;
  isBanned: boolean;
}

export type PlaygroundErrorCode =
  | "UNAUTHENTICATED"
  | "BANNED"
  | "RATE_LIMITED"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "SERVER_ERROR";

export type PlaygroundActionState =
  | { status: "idle" }
  | { status: "success"; message: PlaygroundFeedItem }
  | {
      status: "error";
      code: PlaygroundErrorCode;
      message: string;
      retryAfterMs?: number;
    };

export type DeleteResult =
  | { ok: true; id: string }
  | { ok: false; code: PlaygroundErrorCode; message: string };

export const PLAYGROUND_FEED_LIMIT = 50;
export const PLAYGROUND_MAX_LENGTH = 500;
export const PLAYGROUND_COOLDOWN_MS = 10_000;
export const PLAYGROUND_BURST_WINDOW_MS = 60_000;
export const PLAYGROUND_BURST_MAX = 5;
EOF

# ---------- lib/auth/session.ts ----------
[ -f lib/auth/session.ts ] || cat > lib/auth/session.ts <<'EOF'
// STUB — Session A owns this file. Replace it.
import type { PlaygroundViewer } from "@/types/playground";

export async function getSessionUser(): Promise<PlaygroundViewer | null> {
  return null;
}

export async function requireUser(): Promise<PlaygroundViewer> {
  throw new Error("stub");
}

export function isAdmin(user: PlaygroundViewer | null): boolean {
  return user?.role === "admin";
}
EOF

# ---------- lib/data/playground.ts ----------
[ -f lib/data/playground.ts ] || cat > lib/data/playground.ts <<'EOF'
// STUB — Session B owns this file. Replace it.
// NOT cached. Do not wrap these in unstable_cache — the feed must be live.
import type { PlaygroundFeedItem, PlaygroundMember } from "@/types/playground";

export async function getPlaygroundFeed(_opts?: {
  limit?: number;
  before?: string;
  viewerId?: string;
}): Promise<PlaygroundFeedItem[]> {
  return [];
}

export async function getMessagesSince(
  _since: string,
  _opts?: { limit?: number; viewerId?: string }
): Promise<PlaygroundFeedItem[]> {
  return [];
}

export async function getPlaygroundMembers(_opts?: {
  limit?: number;
}): Promise<PlaygroundMember[]> {
  return [];
}

export async function getPlaygroundStats(): Promise<{
  totalMessages: number;
  totalMembers: number;
}> {
  return { totalMessages: 0, totalMembers: 0 };
}
EOF

# ---------- app/playground/actions.ts ----------
[ -f app/playground/actions.ts ] || cat > app/playground/actions.ts <<'EOF'
"use server";
// STUB — Session B owns this file. Replace it.
import type {
  DeleteResult,
  PlaygroundActionState,
} from "@/types/playground";

export async function postMessage(
  _prev: PlaygroundActionState,
  _formData: FormData
): Promise<PlaygroundActionState> {
  return { status: "error", code: "SERVER_ERROR", message: "not implemented" };
}

export async function deleteMessage(_id: string): Promise<DeleteResult> {
  return { ok: false, code: "SERVER_ERROR", message: "not implemented" };
}
EOF

# ---------- components/auth/* ----------
stub_auth () { [ -f "components/auth/$1" ] || printf '%s\n' "$2" > "components/auth/$1"; }

stub_auth sign-in-button.tsx '"use client";
// STUB — Session A owns this file.
export interface SignInButtonProps { callbackUrl?: string; size?: "sm" | "default" | "lg"; className?: string; }
export function SignInButton({ className }: SignInButtonProps) { return <button className={className}>Sign in with GitHub</button>; }'

stub_auth user-menu.tsx '"use client";
// STUB — Session A owns this file.
import type { PlaygroundViewer } from "@/types/playground";
export interface UserMenuProps { user: PlaygroundViewer; className?: string; }
export function UserMenu({ user, className }: UserMenuProps) { return <div className={className}>{user.username}</div>; }'

stub_auth auth-status.tsx '// STUB — Session A owns this file. Server component.
export interface AuthStatusProps { className?: string; }
export async function AuthStatus({ className }: AuthStatusProps) { return <div className={className} />; }'

# ---------- components/playground/* ----------
stub_pg () { [ -f "components/playground/$1" ] || printf '%s\n' "$2" > "components/playground/$1"; }

stub_pg playground-feed.tsx '"use client";
// STUB — Session C owns this file.
import type { PlaygroundFeedItem, PlaygroundViewer } from "@/types/playground";
export interface PlaygroundFeedProps { initialMessages: PlaygroundFeedItem[]; viewer: PlaygroundViewer | null; pollIntervalMs?: number; className?: string; }
export function PlaygroundFeed({ className }: PlaygroundFeedProps) { return <div className={className} />; }'

stub_pg composer.tsx '"use client";
// STUB — Session C owns this file.
import type { PlaygroundFeedItem, PlaygroundViewer } from "@/types/playground";
export interface ComposerProps { viewer: PlaygroundViewer | null; onOptimistic?: (m: PlaygroundFeedItem) => void; onSettled?: (m: PlaygroundFeedItem | null) => void; className?: string; }
export function Composer({ className }: ComposerProps) { return <div className={className} />; }'

stub_pg message-card.tsx '"use client";
// STUB — Session C owns this file.
import type { PlaygroundFeedItem, PlaygroundViewer } from "@/types/playground";
export interface MessageCardProps { message: PlaygroundFeedItem; viewer: PlaygroundViewer | null; pending?: boolean; failed?: boolean; onDelete?: (id: string) => void; index?: number; className?: string; }
export function MessageCard({ message, className }: MessageCardProps) { return <div className={className}>{message.content}</div>; }'

stub_pg members-strip.tsx '// STUB — Session C owns this file. Server component.
import type { PlaygroundMember } from "@/types/playground";
export interface MembersStripProps { members: PlaygroundMember[]; totalMessages?: number; className?: string; }
export function MembersStrip({ className }: MembersStripProps) { return <div className={className} />; }'

stub_pg new-messages-pill.tsx '"use client";
// STUB — Session C owns this file.
export interface NewMessagesPillProps { count: number; onClick: () => void; className?: string; }
export function NewMessagesPill({ count, onClick, className }: NewMessagesPillProps) { return count > 0 ? <button onClick={onClick} className={className}>{count} new</button> : null; }'

cat > components/playground/index.ts <<'EOF'
export * from "./playground-feed";
export * from "./composer";
export * from "./message-card";
export * from "./members-strip";
export * from "./new-messages-pill";
EOF

echo "==> 5/6  Extending .env.example"
grep -q AUTH_SECRET .env.example 2>/dev/null || cat >> .env.example <<'EOF'

# --- Phase 3: auth ---
# openssl rand -base64 32
AUTH_SECRET=""
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""
# Numeric GitHub user id (NOT the username):
#   curl -s https://api.github.com/users/lalit999999 | grep '"id"'
ADMIN_GITHUB_ID=""
AUTH_TRUST_HOST="true"
EOF

echo "==> 6/6  Regenerating Next 16 route types"
npx next typegen || echo "    typegen needs a dev/build run first — fine, sessions will trigger it"

echo
echo "Phase 3 Step 0 complete."
echo
echo "MANUAL STEPS REMAINING — do these before opening sessions:"
echo "  1. Create the GitHub OAuth app:"
echo "       https://github.com/settings/developers -> New OAuth App"
echo "       Homepage:     http://localhost:3000"
echo "       Callback URL: http://localhost:3000/api/auth/callback/github"
echo "     Fill AUTH_GITHUB_ID / AUTH_GITHUB_SECRET / AUTH_SECRET / ADMIN_GITHUB_ID in .env.local"
echo "  2. Migrate existing cert colours in Atlas (enum renamed purple -> orange):"
echo "       db.certifications.updateMany({ color: 'purple' }, { \$set: { color: 'orange' } })"
echo "     Or just re-run: npx tsx scripts/seed.ts"
echo "  3. Commit Step 0 on its own before branching:"
echo "       git add -A && git commit -m \"chore(phase3): warm-orange theme, purple purge, shared stubs\""