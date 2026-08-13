import NextAuth, { type Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

import authConfig from "./auth.config";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,

    async signIn({ profile }) {
      if (!profile?.id) return false;

      const githubId = String(profile.id);
      const role =
        process.env.ADMIN_GITHUB_ID === githubId ? "admin" : "visitor";

      try {
        await dbConnect();

        const user = await User.findOneAndUpdate(
          { githubId },
          {
            $set: {
              username: profile.login,
              name: profile.name,
              avatarUrl: profile.avatar_url,
              profileUrl: profile.html_url,
              bio: profile.bio,
              lastLoginAt: new Date(),
            },
            $setOnInsert: { role, isBanned: false },
          },
          { upsert: true, new: true }
        );

        if (user.isBanned) return false;
      } catch {
        return false;
      }

      return true;
    },

    async jwt({ token, profile }) {
      if (!profile?.id) return token;

      try {
        await dbConnect();

        const user = await User.findOne({ githubId: String(profile.id) });
        if (!user) return token;

        token.id = user._id.toString();
        token.githubId = user.githubId;
        token.username = user.username;
        token.role = user.role;
        token.isBanned = user.isBanned;
      } catch {
        return token;
      }

      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (token.id) session.user.id = token.id;
      if (token.githubId) session.user.githubId = token.githubId;
      if (token.username) session.user.username = token.username;
      if (token.role) session.user.role = token.role;
      if (typeof token.isBanned === "boolean")
        session.user.isBanned = token.isBanned;
      return session;
    },
  },
});
