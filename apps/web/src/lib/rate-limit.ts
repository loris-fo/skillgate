import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./kv";

export const auditRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 h"),
  prefix: "ratelimit:audit",
  ephemeralCache: new Map(),
});
