// Public API
export { auditSkill, createEngine } from "./engine.js";
export type { EngineConfig, Engine } from "./engine.js";

// Types
export {
  AuditError,
  type AuditResult,
  type AuditErrorCode,
  type Score,
  type Verdict,
  type CategoryResult,
  type Categories,
  type UtilityAnalysis,
  type Recommendation,
} from "./types.js";

// Parsing utilities
export { ensureDeepParsed } from "./parse.js";

// Schema (useful for consumers to validate)
export { auditResultSchema } from "./schema.js";

// Hashing (needed by API routes for content dedup)
export { buildCacheKey } from "./hash.js";
