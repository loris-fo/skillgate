import type { Score } from "../types.js";

const BLOCKED_SCORES: Score[] = ["high", "critical"];

export function isBlocked(score: Score): boolean {
  return BLOCKED_SCORES.includes(score);
}
