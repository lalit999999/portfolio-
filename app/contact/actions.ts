"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import dbConnect from "@/lib/db";
import { Message } from "@/models";
import { contactSchema } from "@/lib/validators/message";
import type { ApiErr } from "@/types/models";

export interface ContactActionState {
  success: boolean;
  error?: ApiErr["error"];
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_SUBMISSIONS = 3;
const RATE_LIMIT_MAP_CAP = 500;

/**
 * Minimum-viable in-memory throttle: per-instance, resets on redeploy, and
 * doesn't coordinate across serverless instances. Good enough to blunt naive
 * spam for Phase 2 — Upstash (Phase 5) replaces this with a real distributed
 * rate limiter.
 */
const submissionLog = new Map<string, number[]>();

function isRateLimited(ipHash: string): boolean {
  const now = Date.now();
  const recent = (submissionLog.get(ipHash) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );
  recent.push(now);
  submissionLog.set(ipHash, recent);

  if (submissionLog.size > RATE_LIMIT_MAP_CAP) {
    const oldestKey = submissionLog.keys().next().value;
    if (oldestKey !== undefined) submissionLog.delete(oldestKey);
  }

  return recent.length > RATE_LIMIT_MAX_SUBMISSIONS;
}

export async function submitContactForm(
  _prevState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject") || undefined,
    message: formData.get("message"),
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    const fields: Record<string, string[]> = {};
    for (const [key, messages] of Object.entries(
      parsed.error.flatten().fieldErrors
    )) {
      if (messages?.length) fields[key] = messages;
    }
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Please fix the errors below and try again.",
        fields,
      },
    };
  }

  const { website, subject, ...data } = parsed.data;

  // Honeypot: real users never fill a hidden field. Pretend success and
  // write nothing so bots get no signal their submission was rejected.
  if (website) {
    return { success: true };
  }

  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const ip =
    forwardedFor?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex");

  if (isRateLimited(ipHash)) {
    return {
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: "Too many messages sent recently — please try again later.",
      },
    };
  }

  await dbConnect();
  await Message.create({
    name: data.name,
    email: data.email,
    subject: subject || undefined,
    message: data.message,
    ipHash,
    userAgent: headerList.get("user-agent") ?? undefined,
  });

  return { success: true };
}
