import { Redis } from "@upstash/redis";
import { auditResultSchema } from "./schema.js";
import type { AuditResult } from "./types.js";

export interface Cache {
  getCached(key: string): Promise<AuditResult | null>;
  setCached(key: string, value: AuditResult): Promise<void>;
}

/**
 * Create a cache instance backed by Upstash Redis.
 * Accepts an optional Redis instance for testing/DI; defaults to Redis.fromEnv().
 */
export function createCache(redis?: Redis): Cache {
  const client = redis ?? Redis.fromEnv();

  return {
    async getCached(key: string): Promise<AuditResult | null> {
      const raw = await client.get(key);
      if (raw === null || raw === undefined) {
        return null;
      }

      // Validate cached data against current schema (Pitfall 3: schema may have changed since caching)
      const parsed = auditResultSchema.safeParse(raw);
      if (!parsed.success) {
        console.warn(
          `Cache validation failed for key "${key}": ${parsed.error.message}. Treating as cache miss.`
        );
        return null;
      }

      return parsed.data;
    },

    async setCached(key: string, value: AuditResult): Promise<void> {
      await client.set(key, value);
    },
  };
}

// Default cache instance using environment variables
const defaultCache = createCache();

export const getCached = defaultCache.getCached;
export const setCached = defaultCache.setCached;
