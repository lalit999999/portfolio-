"use server";

import { Types } from "mongoose";

import { requireAdmin } from "@/lib/admin/guard";
import { ok, fail } from "@/lib/admin/action";
import dbConnect from "@/lib/db";
import { Message } from "@/models";
import type { AdminActionState } from "@/types/admin";

function validIds(ids: string[]): boolean {
  return ids.length > 0 && ids.every((id) => Types.ObjectId.isValid(id));
}

export async function markMessageRead(
  id: string,
  isRead: boolean
): Promise<AdminActionState> {
  await requireAdmin();
  if (!Types.ObjectId.isValid(id)) return fail("VALIDATION_ERROR", "Invalid message id.");

  await dbConnect();
  const doc = await Message.findByIdAndUpdate(id, { isRead });
  if (!doc) return fail("NOT_FOUND", "Message not found.");

  return ok(undefined, isRead ? "Marked as read." : "Marked as unread.");
}

export async function archiveMessage(
  id: string,
  isArchived: boolean
): Promise<AdminActionState> {
  await requireAdmin();
  if (!Types.ObjectId.isValid(id)) return fail("VALIDATION_ERROR", "Invalid message id.");

  await dbConnect();
  const doc = await Message.findByIdAndUpdate(id, { isArchived });
  if (!doc) return fail("NOT_FOUND", "Message not found.");

  return ok(undefined, isArchived ? "Archived." : "Unarchived.");
}

export async function deleteMessage(id: string): Promise<AdminActionState> {
  await requireAdmin();
  if (!Types.ObjectId.isValid(id)) return fail("VALIDATION_ERROR", "Invalid message id.");

  await dbConnect();
  const doc = await Message.findByIdAndDelete(id);
  if (!doc) return fail("NOT_FOUND", "Message not found.");

  return ok(undefined, "Message deleted.");
}

export async function bulkMarkRead(
  ids: string[],
  isRead: boolean
): Promise<AdminActionState> {
  await requireAdmin();
  if (!validIds(ids)) return fail("VALIDATION_ERROR", "No valid messages selected.");

  await dbConnect();
  await Message.updateMany({ _id: { $in: ids } }, { isRead });

  return ok(undefined, `${ids.length} message(s) marked as ${isRead ? "read" : "unread"}.`);
}

export async function bulkArchive(
  ids: string[],
  isArchived: boolean
): Promise<AdminActionState> {
  await requireAdmin();
  if (!validIds(ids)) return fail("VALIDATION_ERROR", "No valid messages selected.");

  await dbConnect();
  await Message.updateMany({ _id: { $in: ids } }, { isArchived });

  return ok(
    undefined,
    `${ids.length} message(s) ${isArchived ? "archived" : "unarchived"}.`
  );
}

export async function bulkDelete(ids: string[]): Promise<AdminActionState> {
  await requireAdmin();
  if (!validIds(ids)) return fail("VALIDATION_ERROR", "No valid messages selected.");

  await dbConnect();
  await Message.deleteMany({ _id: { $in: ids } });

  return ok(undefined, `${ids.length} message(s) deleted.`);
}
