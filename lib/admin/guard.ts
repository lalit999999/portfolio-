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
    redirect("/lalit/signin");
  }
  if (!isAdmin(user)) {
    redirect("/lalit/403");
  }
  return user;
}
