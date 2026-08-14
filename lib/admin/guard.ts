import "server-only";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

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

/**
 * Route-handler counterpart to requireAdmin(). redirect() is wrong for API
 * routes — it sends a 307 to an HTML sign-in page instead of a JSON error,
 * which breaks XMLHttpRequest/fetch callers expecting JSON.
 */
export async function requireAdminApi(): Promise<PlaygroundViewer | NextResponse> {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdmin(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return user;
}
