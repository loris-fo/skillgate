import Anthropic from "@anthropic-ai/sdk";
import { createCache, type Cache } from "./cache.js";
import { buildCacheKey } from "./hash.js";
import { SYSTEM_PROMPT, buildUserMessage } from "./prompt.js";
import { AUDIT_TOOL, auditResultSchema } from "./schema.js";
import { ensureDeepParsed } from "./parse.js";
import { AuditError, type AuditResult } from "./types.js";

const MAX_CONTENT_BYTES = 100_000; // 100KB

export interface EngineConfig {
  anthropicClient?: Anthropic;
  cache?: Cache;
}

export interface Engine {
  auditSkill(content: string): Promise<AuditResult>;
}

/**
 * Create an audit engine instance with optional dependency injection.
 * Accepts custom Anthropic client and cache for testing.
 */
export function createEngine(config: EngineConfig = {}): Engine {
  const client = config.anthropicClient ?? new Anthropic();
  const cache = config.cache ?? createCache();

  async function auditSkill(content: string): Promise<AuditResult> {
    // 1. Validate input: non-empty after trimming
    if (!content || !content.trim()) {
      throw new AuditError(
        "Content is empty or contains only whitespace",
        "VALIDATION_ERROR"
      );
    }

    // 2. Validate input: size limit (100KB)
    if (Buffer.byteLength(content, "utf8") > MAX_CONTENT_BYTES) {
      throw new AuditError(
        `Content exceeds ${MAX_CONTENT_BYTES} byte limit`,
        "INPUT_TOO_LARGE"
      );
    }

    // 3. Build cache key
    const cacheKey = buildCacheKey(content);

    // 4. Check cache
    const cached = await cache.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    // 5. Call Claude API
    let response: Anthropic.Message;
    try {
      response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        tools: [AUDIT_TOOL],
        tool_choice: { type: "tool", name: "record_audit" },
        messages: [{ role: "user", content: buildUserMessage(content) }],
      });
    } catch (error) {
      throw new AuditError(
        `Claude API error: ${error instanceof Error ? error.message : String(error)}`,
        "API_ERROR"
      );
    }

    // 6. Extract tool_use block
    const toolBlock = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );
    if (!toolBlock) {
      throw new AuditError(
        "Claude response did not contain a tool_use block",
        "VALIDATION_ERROR"
      );
    }

    // 7. Validate with Zod
    let result: AuditResult;
    try {
      const parsed = ensureDeepParsed(toolBlock.input as Record<string, unknown>);
      result = auditResultSchema.parse(parsed);
    } catch (error) {
      throw new AuditError(
        `Invalid audit result structure: ${error instanceof Error ? error.message : String(error)}`,
        "VALIDATION_ERROR"
      );
    }

    // 8. Cache result (fire-and-forget: cache failure should not fail the audit)
    cache.setCached(cacheKey, result).catch((err) => {
      console.warn(`Failed to cache audit result: ${err}`);
    });

    return result;
  }

  return { auditSkill };
}

// Default engine instance using environment variables
const defaultEngine = createEngine();

export const auditSkill = defaultEngine.auditSkill;
