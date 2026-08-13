import "server-only";
import { updateTag } from "next/cache";

// Next 16 removed the single-argument revalidateTag(tag) this used to call —
// it now requires a second `profile` argument (e.g. "max" for
// stale-while-revalidate), which doesn't match this function's original
// immediate-expiration behavior. updateTag(tag) is the documented migration
// for that exact case, with the caveat that (like the old call) it only
// works from Server Actions, not Route Handlers.
export function revalidateCollection(...tags: string[]): void {
  for (const tag of tags) {
    updateTag(tag);
  }
}
