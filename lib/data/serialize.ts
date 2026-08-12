/**
 * Converts a lean() Mongoose doc (or array of them) into a plain,
 * JSON-serialisable object: ObjectId -> string, Date -> ISO string.
 * Not part of the public lib/data API — internal to this directory only.
 */
export function serialize<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}
