import { describe, it, expect } from "vitest";
import { normalizeContent, buildCacheKey, PROMPT_VERSION } from "../src/hash.js";

describe("normalizeContent", () => {
  it("produces same output for same input", () => {
    const content = "Hello world\nThis is a test";
    expect(normalizeContent(content)).toBe(normalizeContent(content));
  });

  it("produces different output for different content", () => {
    expect(normalizeContent("Hello")).not.toBe(normalizeContent("World"));
  });

  it("normalizes whitespace differences to same output", () => {
    const withSpaces = "Hello   world\n\nTest";
    const withSingleSpace = "Hello world\n\nTest";
    expect(normalizeContent(withSpaces)).toBe(normalizeContent(withSingleSpace));
  });

  it("normalizes line ending differences", () => {
    const unix = "Hello\nworld";
    const windows = "Hello\r\nworld";
    const oldMac = "Hello\rworld";
    const normalized = normalizeContent(unix);
    expect(normalizeContent(windows)).toBe(normalized);
    expect(normalizeContent(oldMac)).toBe(normalized);
  });

  it("strips BOM character", () => {
    const withBom = "\uFEFFHello world";
    const withoutBom = "Hello world";
    expect(normalizeContent(withBom)).toBe(normalizeContent(withoutBom));
  });

  it("collapses tab characters to single space", () => {
    const withTabs = "Hello\t\tworld";
    const withSpace = "Hello world";
    expect(normalizeContent(withTabs)).toBe(normalizeContent(withSpace));
  });
});

describe("buildCacheKey", () => {
  it("produces same key for same content", () => {
    const content = "Hello world";
    expect(buildCacheKey(content)).toBe(buildCacheKey(content));
  });

  it("produces different keys for different content", () => {
    expect(buildCacheKey("Hello")).not.toBe(buildCacheKey("World"));
  });

  it("includes prompt version in format {hash}:{version}", () => {
    const key = buildCacheKey("test content");
    const parts = key.split(":");
    expect(parts).toHaveLength(2);
    expect(parts[1]).toBe(PROMPT_VERSION);
    // SHA-256 hex is 64 characters
    expect(parts[0]).toHaveLength(64);
  });

  it("produces same key for whitespace-variant content", () => {
    const a = "Hello   world\r\nTest";
    const b = "Hello world\nTest";
    expect(buildCacheKey(a)).toBe(buildCacheKey(b));
  });
});
