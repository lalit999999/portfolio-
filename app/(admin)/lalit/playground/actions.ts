"use server";

import { Types } from "mongoose";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin/guard";
import { ok, fail } from "@/lib/admin/action";
import dbConnect from "@/lib/db";
import { PlaygroundMessage, User } from "@/models";
import type { AdminActionState } from "@/types/admin";

export async function togglePinMessage(
  id: string,
  isPinned: boolean
): Promise<AdminActionState> {
  await requireAdmin();
  if (!Types.ObjectId.isValid(id)) return fail("VALIDATION_ERROR", "Invalid message id.");

  await dbConnect();
  const doc = await PlaygroundMessage.findByIdAndUpdate(id, { isPinned });
  if (!doc) return fail("NOT_FOUND", "Message not found.");

  revalidatePath("/playground");
  return ok(undefined, isPinned ? "Pinned." : "Unpinned.");
}

export async function toggleHideMessage(
  id: string,
  isHidden: boolean
): Promise<AdminActionState> {
  await requireAdmin();
  if (!Types.ObjectId.isValid(id)) return fail("VALIDATION_ERROR", "Invalid message id.");

  await dbConnect();
  const doc = await PlaygroundMessage.findByIdAndUpdate(id, { isHidden });
  if (!doc) return fail("NOT_FOUND", "Message not found.");

  revalidatePath("/playground");
  return ok(undefined, isHidden ? "Hidden." : "Unhidden.");
}

export async function deletePlaygroundMessage(id: string): Promise<AdminActionState> {
  await requireAdmin();
  if (!Types.ObjectId.isValid(id)) return fail("VALIDATION_ERROR", "Invalid message id.");

  await dbConnect();
  const doc = await PlaygroundMessage.findByIdAndDelete(id);
  if (!doc) return fail("NOT_FOUND", "Message not found.");

  await User.findByIdAndUpdate(doc.author, { $inc: { messageCount: -1 } });

  revalidatePath("/playground");
  return ok(undefined, "Message deleted.");
}

export async function toggleBanMember(
  id: string,
  isBanned: boolean
): Promise<AdminActionState> {
  const viewer = await requireAdmin();
  if (!Types.ObjectId.isValid(id)) return fail("VALIDATION_ERROR", "Invalid member id.");

  if (viewer.id === id) {
    return fail("FORBIDDEN", "You can't ban yourself.");
  }

  await dbConnect();
  const doc = await User.findByIdAndUpdate(id, { isBanned });
  if (!doc) return fail("NOT_FOUND", "Member not found.");

  revalidatePath("/playground");
  return ok(undefined, isBanned ? "Member banned." : "Member unbanned.");
}
