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
