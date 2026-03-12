export type Score = "safe" | "low" | "moderate" | "high" | "critical";

export type Verdict = "install" | "install_with_caution" | "review_first" | "avoid";

export type CategoryResult = {
  score: Score;
  finding: string;
  detail: string;
  by_design: boolean;
};

export type Categories = {
  hidden_logic: CategoryResult;
  data_access: CategoryResult;
  action_risk: CategoryResult;
  permission_scope: CategoryResult;
  override_attempts: CategoryResult;
};

export type UtilityAnalysis = {
  what_it_does: string;
  use_cases: string[];
  not_for: string[];
  trigger_behavior: string;
  dependencies: string[];
};

export type Recommendation = {
  verdict: Verdict;
  for_who: string;
  caveats: string[];
  alternatives: string[];
};

export type DetectedAgent = "claude" | "cursor" | "windsurf" | "copilot" | "cline" | "aider" | "unknown";

export type AuditResult = {
  overall_score: Score;
  verdict: string;
  summary: string;
  intent: string;
  categories: Categories;
  utility_analysis: UtilityAnalysis;
  recommendation: Recommendation;
  detected_agent?: DetectedAgent;
};

export type AuditErrorCode = "INPUT_TOO_LARGE" | "API_ERROR" | "VALIDATION_ERROR";

export class AuditError extends Error {
  readonly code: AuditErrorCode;

  constructor(message: string, code: AuditErrorCode) {
    super(message);
    this.name = "AuditError";
    this.code = code;
  }
}
