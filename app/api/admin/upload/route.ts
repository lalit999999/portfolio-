import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin/guard";
import type { UploadSignature } from "@/types/admin";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const bodySchema = z.object({
  folder: z.string().min(1),
  resourceType: z.enum(["image", "raw"]),
});

export async function POST(request: Request) {
  await requireAdmin();

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid upload request" },
      { status: 400 }
    );
  }
  const { folder, resourceType } = parsed.data;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Cloudinary is not configured" },
      { status: 500 }
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    apiSecret
  );

  const payload: UploadSignature = {
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder,
    resourceType,
  };

  return NextResponse.json(payload);
}
