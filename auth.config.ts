// EDGE-SAFE ONLY. Never import mongoose, @/lib/db, or @/models from here —
// this file is bundled into proxy.ts (formerly middleware.ts). Keep it
// dependency-light regardless of which runtime proxy.ts ends up on.
import GitHub from "next-auth/providers/github";
import type { NextAuthConfig, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

/**
 * Projects already-decoded JWT claims onto `session.user`. Pure and DB-free
 * (the claims were stamped onto the token by auth.ts's real `jwt` callback
 * at sign-in time) so it's safe to run here in the edge-safe config too.
 * NextAuth's default session shape only carries name/email/image — without
 * this, `session.user.role` is undefined wherever NextAuth is instantiated
 * from authConfig alone (i.e. in proxy.ts), which silently breaks the
 * `authorized`/role checks that rely on it. auth.ts reuses this same
 * function so the two configs can't drift apart.
 */
export function projectTokenToSession(session: Session, token: JWT): Session {
  if (token.id) session.user.id = token.id;
  if (token.githubId) session.user.githubId = token.githubId;
  if (token.username) session.user.username = token.username;
  if (token.role) session.user.role = token.role;
  if (typeof token.isBanned === "boolean")
    session.user.isBanned = token.isBanned;
  return session;
}

export default {
  providers: [
    GitHub({
      authorization: { params: { scope: "read:user" } },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isAdminRoute =
        pathname.startsWith("/lalit") &&
        pathname !== "/lalit/signin" &&
        pathname !== "/lalit/403";
      if (!isAdminRoute) return true;
      return auth?.user?.role === "admin";
    },
    session({ session, token }) {
      return projectTokenToSession(session, token);
    },
  },
} satisfies NextAuthConfig;
