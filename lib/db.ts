import mongoose from "mongoose";

declare global {
  var _mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const cached = (global._mongoose ??= { conn: null, promise: null });

function isPlaceholderMongoUri(uri: string): boolean {
  return uri.includes("mongodb+srv://...") || uri.includes("...");
}

export default async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  const MONGODB_URI = process.env.MONGODB_URI?.trim();
  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (isPlaceholderMongoUri(MONGODB_URI)) {
    throw new Error(
      "MONGODB_URI is still the placeholder mongodb+srv://... value. Replace it with a real MongoDB URI or use mongodb://127.0.0.1:27017/portfolio for local development.",
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
