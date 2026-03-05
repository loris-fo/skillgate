import { Redis } from "@upstash/redis";

// Singleton -- reused across hot invocations in serverless
export const redis = Redis.fromEnv();
