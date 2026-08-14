import "server-only";

/**
 * Admin-side mirror of lib/data/serialize.ts (that helper is internal to
 * lib/data/). Converts a lean() Mongoose doc (or array of them) into a
 * plain, JSON-serialisable object: ObjectId -> string, Date -> ISO string.
 */
export function serialize<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}
