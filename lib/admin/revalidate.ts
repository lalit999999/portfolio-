import "server-only";
import { revalidateTag } from "next/cache";

export function revalidateCollection(...tags: string[]): void {
  for (const tag of tags) {
    revalidateTag(tag);
  }
}
