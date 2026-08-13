"use server";

import { Types } from "mongoose";
import dbConnect from "@/lib/db";
import { getSessionUser } from "@/lib/auth/session";
import { PlaygroundMessage } from "@/models";
import { playgroundMessageCreateSchema } from "@/lib/validators/playgroundMessage";
import { checkAndConsume, refund } from "@/lib/playground/rate-limit";
import {
  toFeedItem,
  type LeanMessageWithAuthor,
} from "@/lib/playground/serialize";
import type {
  DeleteResult,
  PlaygroundActionState,
} from "@/types/playground";

const AUTHOR_PROJECTION = "username name avatarUrl profileUrl role";
const contentSchema = playgroundMessageCreateSchema.pick({ content: true });

export async function postMessage(
  _prev: PlaygroundActionState,
  formData: FormData
): Promise<PlaygroundActionState> {
  const viewer = await getSessionUser();
  if (!viewer) {
    return {
      status: "error",
      code: "UNAUTHENTICATED",
      message: "Sign in to post a message.",
    };
  }

  const parsed = contentSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) {
    const message =
      parsed.error.flatten().fieldErrors.content?.[0] ??
      "Please enter a valid message.";
    return { status: "error", code: "VALIDATION_ERROR", message };
  }

  const { content } = parsed.data;
  if (content.replace(/[\s\u200b]/gu, "").length === 0) {
    return {
      status: "error",
      code: "VALIDATION_ERROR",
      message: "Message can't be empty.",
    };
  }

  const limitResult = await checkAndConsume(viewer.id);
  if (!limitResult.ok) {
    return {
      status: "error",
      code: limitResult.code,
      message:
        limitResult.code === "BANNED"
          ? "You've been banned from posting."
          : limitResult.code === "NOT_FOUND"
            ? "Your account could not be found."
            : "You're posting too fast — slow down.",
      retryAfterMs: "retryAfterMs" in limitResult ? limitResult.retryAfterMs : undefined,
    };
  }

  await dbConnect();

  let created;
  try {
    created = await PlaygroundMessage.create({
      author: viewer.id,
      content,
    });
  } catch {
    await refund(viewer.id);
    return {
      status: "error",
      code: "SERVER_ERROR",
      message: "Couldn't post your message. Try again.",
    };
  }

  const doc = (await PlaygroundMessage.findById(created._id)
    .populate("author", AUTHOR_PROJECTION)
    .lean()) as unknown as LeanMessageWithAuthor;

  return { status: "success", message: toFeedItem(doc, viewer.id) };
}

export async function deleteMessage(id: string): Promise<DeleteResult> {
  const viewer = await getSessionUser();
  if (!viewer) {
    return {
      ok: false,
      code: "UNAUTHENTICATED",
      message: "Sign in to delete a message.",
    };
  }

  if (!Types.ObjectId.isValid(id)) {
    return { ok: false, code: "NOT_FOUND", message: "Message not found." };
  }

  await dbConnect();

  const filter =
    viewer.role === "admin" ? { _id: id } : { _id: id, author: viewer.id };

  const deleted = await PlaygroundMessage.findOneAndDelete(filter);
  if (deleted) {
    return { ok: true, id };
  }

  const exists = await PlaygroundMessage.findById(id).select("_id").lean();
  if (!exists) {
    return { ok: false, code: "NOT_FOUND", message: "Message not found." };
  }

  return {
    ok: false,
    code: "FORBIDDEN",
    message: "You can only delete your own messages.",
  };
}
