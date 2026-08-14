"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import dbConnect from "@/lib/db";
import { Message } from "@/models";
import { contactSchema } from "@/lib/validators/message";
import { contactRateLimit } from "@/lib/upstash";
import type { ApiErr } from "@/types/models";

export interface ContactActionState {
  success: boolean;
  error?: ApiErr["error"];
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

  const { success: withinLimit } = await contactRateLimit.limit(ipHash);
  if (!withinLimit) {
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
