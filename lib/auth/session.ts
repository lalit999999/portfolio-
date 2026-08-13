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
