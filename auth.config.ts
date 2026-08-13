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
      const { pathname } = request.nextUrl;
      const isAdminRoute =
        pathname.startsWith("/lalit") &&
        pathname !== "/lalit/signin" &&
        pathname !== "/lalit/403";
      if (!isAdminRoute) return true;
      return auth?.user?.role === "admin";
    },
  },
} satisfies NextAuthConfig;
