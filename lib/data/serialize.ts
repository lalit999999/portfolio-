/**
 * Converts a lean() Mongoose doc (or array of them) into a plain,
 * JSON-serialisable object: ObjectId -> string, Date -> ISO string.
 * Not part of the public lib/data API — internal to this directory only.
 * T is asserted by the caller (e.g. serialize<SerializedProject>(doc)) since
 * the lean-doc input type and its serialized output type never structurally
 * overlap enough for a plain `as` cast.
 */
export function serialize<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}
