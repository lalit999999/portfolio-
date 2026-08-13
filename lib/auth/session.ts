import "server-only";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import type { PlaygroundViewer } from "@/types/playground";

export async function getSessionUser(): Promise<PlaygroundViewer | null> {
  const session = await auth();
  const user = session?.user;
  if (!user) return null;

  return {
    id: user.id,
    githubId: user.githubId,
    username: user.username,
    name: user.name ?? undefined,
    avatarUrl: user.image ?? undefined,
    role: user.role,
    isBanned: user.isBanned,
  };
}

export async function requireUser(): Promise<PlaygroundViewer> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export function isAdmin(user: PlaygroundViewer | null): boolean {
  return user?.role === "admin";
}
