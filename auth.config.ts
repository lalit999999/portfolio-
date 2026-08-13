// STUB — Session A owns this file. Replace it.
// EDGE-SAFE ONLY. Never import mongoose, @/lib/db, or @/models from here.
import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";

export default {
  providers: [GitHub],
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;
