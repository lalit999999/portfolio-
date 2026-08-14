import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

// Matches the previous in-memory limiter's numbers (3 submissions / 60s) —
// this is a swap of storage backend, not a policy change.
export const contactRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "60 s"),
  prefix: "ratelimit:contact",
});
