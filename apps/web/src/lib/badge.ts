import { makeBadge } from "badge-maker";
import type { Verdict } from "@skillgate/audit-engine";

const VERDICT_COLORS: Record<Verdict, string> = {
  install: "#4c1",
  install_with_caution: "#dfb317",
  review_first: "#fe7d37",
  avoid: "#e05d44",
};

const VERDICT_LABELS: Record<Verdict, string> = {
  install: "Install",
  install_with_caution: "Caution",
  review_first: "Review First",
  avoid: "Avoid",
};

export function generateBadge(verdict: Verdict): string {
  return makeBadge({
    label: "Skillgate",
    message: VERDICT_LABELS[verdict],
    color: VERDICT_COLORS[verdict],
    labelColor: "#555",
    style: "flat",
  });
}
