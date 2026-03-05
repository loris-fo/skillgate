import slugify from "slugify";

/**
 * Extract skill name from SKILL.md content by parsing the first H1 heading.
 * Returns "unnamed-skill" if no H1 heading is found.
 */
export function extractSkillName(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() || "unnamed-skill";
}

/**
 * Build a URL-friendly slug from SKILL.md content and its content hash.
 * Format: {slugified-name}-{6-char-hash-prefix}
 * Name portion is truncated to 30 characters before appending the hash suffix.
 */
export function buildSlug(content: string, contentHash: string): string {
  const name = extractSkillName(content);
  const slug = slugify(name, { lower: true, strict: true }).slice(0, 30);
  const suffix = contentHash.slice(0, 6);
  return `${slug}-${suffix}`;
}
