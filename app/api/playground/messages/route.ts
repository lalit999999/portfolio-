import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getMessagesSince } from "@/lib/data/playground";
import { getSessionUser } from "@/lib/auth/session";
import type { ApiErr, ApiOk } from "@/types/models";
import type { PlaygroundFeedItem } from "@/types/playground";

// Route handlers can be cached under some configurations; force dynamic so a
// poll never gets served a stale response.
export const dynamic = "force-dynamic";

const querySchema = z.object({ since: z.string().datetime() });

export async function GET(request: NextRequest) {
  const since = request.nextUrl.searchParams.get("since");

  // Missing `since` is required, not treated as "give me everything" — a
  // client that's been backgrounded for hours must not be able to ask for
  // the entire collection through this param.
  const parsed = querySchema.safeParse({ since });
  if (!parsed.success) {
    const body: ApiErr = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "`since` is required and must be an ISO 8601 datetime.",
        fields: parsed.error.flatten().fieldErrors,
      },
    };
    return NextResponse.json(body, {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const viewer = await getSessionUser();
  const messages = await getMessagesSince(parsed.data.since, {
    viewerId: viewer?.id,
  });

  const body: ApiOk<PlaygroundFeedItem[]> = { success: true, data: messages };
  return NextResponse.json(body, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}
