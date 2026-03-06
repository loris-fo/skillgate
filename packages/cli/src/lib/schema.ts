import { z } from "zod";

const scoreEnum = z.enum(["safe", "low", "moderate", "high", "critical"]);
const verdictEnum = z.enum([
  "install",
  "install_with_caution",
  "review_first",
  "avoid",
]);

const categoryResultSchema = z.object({
  score: scoreEnum,
  finding: z.string(),
  detail: z.string(),
  by_design: z.boolean(),
});

const categoriesSchema = z.object({
  hidden_logic: categoryResultSchema,
  data_access: categoryResultSchema,
  action_risk: categoryResultSchema,
  permission_scope: categoryResultSchema,
  override_attempts: categoryResultSchema,
});

const utilityAnalysisSchema = z.object({
  what_it_does: z.string(),
  use_cases: z.array(z.string()),
  not_for: z.array(z.string()),
  trigger_behavior: z.string(),
  dependencies: z.array(z.string()),
});

const recommendationSchema = z.object({
  verdict: verdictEnum,
  for_who: z.string(),
  caveats: z.array(z.string()),
  alternatives: z.array(z.string()),
});

const auditResultSchema = z.object({
  overall_score: scoreEnum,
  verdict: z.string(),
  summary: z.string(),
  intent: z.string(),
  categories: categoriesSchema,
  utility_analysis: utilityAnalysisSchema,
  recommendation: recommendationSchema,
});

const auditMetaSchema = z.object({
  slug: z.string(),
  url: z.string(),
  badge_url: z.string(),
  created_at: z.string(),
  cached: z.boolean(),
});

export const auditResponseSchema = z.object({
  result: auditResultSchema,
  meta: auditMetaSchema,
});
