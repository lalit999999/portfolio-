// EDGE-SAFE ONLY. Never import mongoose, @/lib/db, or @/models from here —
// this file is bundled into middleware, which runs on the edge runtime.
import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";

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
      const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
      if (!isAdminRoute) return true;
      return auth?.user?.role === "admin";
    },
  },
} satisfies NextAuthConfig;
