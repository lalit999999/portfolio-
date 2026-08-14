import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminApi } from "@/lib/admin/guard";
import { COLLECTION_REGISTRY } from "@/lib/admin/collections";
import { revalidateCollection } from "@/lib/admin/revalidate";
import { ADMIN_COLLECTIONS } from "@/types/admin";
import type { ReorderResponse } from "@/types/admin";

const bodySchema = z.object({
  collection: z.enum(ADMIN_COLLECTIONS),
  ids: z.array(z.string().min(1)).min(1),
});

export async function POST(request: Request) {
  const admin = await requireAdminApi();
  if (admin instanceof NextResponse) return admin;

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    const response: ReorderResponse = {
      ok: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid reorder request" },
    };
    return NextResponse.json(response, { status: 400 });
  }

  const { collection, ids } = parsed.data;
  // COLLECTION_REGISTRY is keyed by the frozen AdminCollection union, so this
  // is a lookup against a fixed set, never an interpolated client value.
  const entry = COLLECTION_REGISTRY[collection];

  const result = await entry.model.bulkWrite(
    ids.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: index } },
      },
    }))
  );

  revalidateCollection(...entry.tags);

  const response: ReorderResponse = {
    ok: true,
    updated: result.modifiedCount,
  };
  return NextResponse.json(response);
}
