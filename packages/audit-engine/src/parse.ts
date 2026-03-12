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

  if (Array.isArray(input)) {
    for (let i = 0; i < input.length; i++) {
      input[i] = deepParseValue(input[i]);
    }
    return input as unknown as Record<string, unknown>;
  }

  const obj = input as Record<string, unknown>;

  for (const key of Object.keys(obj)) {
    obj[key] = deepParseValue(obj[key]);
  }

  return obj;
}

function deepParseValue(value: unknown): unknown {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === "object" && parsed !== null) {
        return ensureDeepParsed(parsed);
      }
    } catch {
      // Not valid JSON — leave as-is
    }
    return value;
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      value[i] = deepParseValue(value[i]);
    }
    return value;
  }
  if (typeof value === "object" && value !== null) {
    return ensureDeepParsed(value);
  }
  return value;
}
