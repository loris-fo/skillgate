/**
 * Deep-parse any string-encoded JSON fields in an object.
 *
 * Upstash Redis (and sometimes Claude's tool_use blocks) can return nested
 * objects as JSON strings. This recursively parses string values that are
 * valid JSON objects/arrays back into their parsed form.
 *
 * Lenient: returns the input as-is if it's not an object (let Zod catch
 * structural problems downstream).
 */
export function ensureDeepParsed(input: unknown): Record<string, unknown> {
  if (typeof input !== "object" || input === null) {
    return input as Record<string, unknown>;
  }

  const obj = input as Record<string, unknown>;

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === "object" && parsed !== null) {
          obj[key] = parsed;
        }
      } catch {
        // Not valid JSON — leave as-is
      }
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      ensureDeepParsed(value);
    }
  }

  return obj;
}
