import { createHash } from "crypto";

export const PROMPT_VERSION = "1.0";

/**
 * Normalize content for deterministic hashing.
 * Strips BOM, normalizes line endings, collapses whitespace, applies Unicode NFC.
 */
export function normalizeContent(content: string): string {
  return content
    .replace(/\uFEFF/g, "")          // Strip BOM
    .replace(/\r\n/g, "\n")          // Windows line endings to Unix
    .replace(/\r/g, "\n")            // Old Mac line endings to Unix
    .replace(/[^\S\n]+/g, " ")       // Collapse horizontal whitespace (spaces, tabs) to single space
    .replace(/\n{3,}/g, "\n\n")      // Collapse 3+ consecutive newlines to 2
    .trim()                           // Trim leading/trailing whitespace
    .normalize("NFC");                // Unicode NFC normalization
}

/**
 * Build a cache key from content: SHA-256 hash of normalized content + prompt version.
 * Format: {sha256hex}:{promptVersion}
 */
export function buildCacheKey(content: string): string {
  const normalized = normalizeContent(content);
  const hash = createHash("sha256").update(normalized).digest("hex");
  return `${hash}:${PROMPT_VERSION}`;
}
