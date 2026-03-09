import type { Score } from "@skillgate/audit-engine";

export const SEVERITY_CONFIG: Record<Score, {
  color: string;
  bg: string;
  percent: number;
  numeric: number;
  label: string;
}> = {
  safe:     { color: "text-severity-safe",     bg: "bg-severity-safe",     percent: 10,  numeric: 2,  label: "Safe" },
  low:      { color: "text-severity-low",      bg: "bg-severity-low",      percent: 30,  numeric: 4,  label: "Low" },
  moderate: { color: "text-severity-moderate",  bg: "bg-severity-moderate", percent: 55,  numeric: 6,  label: "Moderate" },
  high:     { color: "text-severity-high",      bg: "bg-severity-high",     percent: 80,  numeric: 8,  label: "High" },
  critical: { color: "text-severity-critical",  bg: "bg-severity-critical", percent: 100, numeric: 10, label: "Critical" },
};

export const VERDICT_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  install:              { color: "text-severity-safe",     bg: "bg-severity-safe",     label: "Install" },
  install_with_caution: { color: "text-severity-low",      bg: "bg-severity-low",      label: "Install with Caution" },
  review_first:         { color: "text-severity-moderate",  bg: "bg-severity-moderate", label: "Review First" },
  avoid:                { color: "text-severity-high",      bg: "bg-severity-high",     label: "Avoid" },
};
