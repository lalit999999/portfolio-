"use server";
// STUB — Session B owns this file. Replace it.
import type {
  DeleteResult,
  PlaygroundActionState,
} from "@/types/playground";

export async function postMessage(
  _prev: PlaygroundActionState,
  _formData: FormData
): Promise<PlaygroundActionState> {
  return { status: "error", code: "SERVER_ERROR", message: "not implemented" };
}

export async function deleteMessage(_id: string): Promise<DeleteResult> {
  return { ok: false, code: "SERVER_ERROR", message: "not implemented" };
}
