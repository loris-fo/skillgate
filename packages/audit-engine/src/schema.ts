import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";

const scoreEnum = z.enum(["safe", "low", "moderate", "high", "critical"]);
const verdictEnum = z.enum(["install", "install_with_caution", "review_first", "avoid"]);

const categorySchema = z.object({
  score: scoreEnum,
  finding: z.string(),
  detail: z.string(),
  by_design: z.boolean(),
});

export const auditResultSchema = z.object({
  overall_score: scoreEnum,
  verdict: z.string(),
  summary: z.string(),
  intent: z.string(),
  categories: z.object({
    hidden_logic: categorySchema,
    data_access: categorySchema,
    action_risk: categorySchema,
    permission_scope: categorySchema,
    override_attempts: categorySchema,
  }),
  utility_analysis: z.object({
    what_it_does: z.string(),
    use_cases: z.array(z.string()),
    not_for: z.array(z.string()),
    trigger_behavior: z.string(),
    dependencies: z.array(z.string()),
  }),
  recommendation: z.object({
    verdict: verdictEnum,
    for_who: z.string(),
    caveats: z.array(z.string()),
    alternatives: z.array(z.string()),
  }),
});

// Verify type alignment with z.infer
export type ZodAuditResult = z.infer<typeof auditResultSchema>;

// Inlined category schema for Anthropic tool definition (no $ref -- see Pitfall 1 in RESEARCH.md)
const categoryInputSchema = {
  type: "object" as const,
  properties: {
    score: { type: "string" as const, enum: ["safe", "low", "moderate", "high", "critical"] },
    finding: { type: "string" as const },
    detail: { type: "string" as const },
    by_design: { type: "boolean" as const },
  },
  required: ["score", "finding", "detail", "by_design"],
};

export const AUDIT_TOOL: Anthropic.Tool = {
  name: "record_audit",
  description: "Record the security audit result for the analyzed SKILL.md",
  input_schema: {
    type: "object" as const,
    properties: {
      overall_score: {
        type: "string" as const,
        enum: ["safe", "low", "moderate", "high", "critical"],
      },
      verdict: { type: "string" as const },
      summary: { type: "string" as const },
      intent: { type: "string" as const },
      categories: {
        type: "object" as const,
        properties: {
          hidden_logic: categoryInputSchema,
          data_access: categoryInputSchema,
          action_risk: categoryInputSchema,
          permission_scope: categoryInputSchema,
          override_attempts: categoryInputSchema,
        },
        required: [
          "hidden_logic",
          "data_access",
          "action_risk",
          "permission_scope",
          "override_attempts",
        ],
      },
      utility_analysis: {
        type: "object" as const,
        properties: {
          what_it_does: { type: "string" as const },
          use_cases: { type: "array" as const, items: { type: "string" as const } },
          not_for: { type: "array" as const, items: { type: "string" as const } },
          trigger_behavior: { type: "string" as const },
          dependencies: { type: "array" as const, items: { type: "string" as const } },
        },
        required: ["what_it_does", "use_cases", "not_for", "trigger_behavior", "dependencies"],
      },
      recommendation: {
        type: "object" as const,
        properties: {
          verdict: {
            type: "string" as const,
            enum: ["install", "install_with_caution", "review_first", "avoid"],
          },
          for_who: { type: "string" as const },
          caveats: { type: "array" as const, items: { type: "string" as const } },
          alternatives: { type: "array" as const, items: { type: "string" as const } },
        },
        required: ["verdict", "for_who", "caveats", "alternatives"],
      },
    },
    required: [
      "overall_score",
      "verdict",
      "summary",
      "intent",
      "categories",
      "utility_analysis",
      "recommendation",
    ],
  },
};
