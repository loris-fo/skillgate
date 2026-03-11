# Phase 13: Universal Audit Engine - Context

**Gathered:** 2026-03-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Update the audit engine prompt to analyze any AI agent's skill/rule/instruction file with agent-specific risk patterns — not just Claude SKILL.md files. The same 5 security categories apply universally. Requirements: AUDIT-01, AUDIT-02.

</domain>

<decisions>
## Implementation Decisions

### Agent-Specific Risk Patterns
- Fold agent-specific patterns into the existing 5 categories as enriched examples — no new categories or separate sections
- 2-3 key high-signal patterns per agent (all 6: Claude, Cursor, Windsurf, Copilot, Cline, Aider)
- Findings use generic descriptions, not agent-attributed labels (e.g., "editor settings manipulation" not "Cursor editor modification")

### Prompt Rewrite
- Universal auditor identity: "You are a security auditor for AI agent instruction files" — no agent named in the identity
- Replace "SKILL.md" references with generic "instruction file" terminology
- Override Attempts category: replace "Claude's safety guidelines" with "AI agent safety constraints"
- Keep `<skill_content>` XML fence tag name unchanged (internal detail, not user-facing)

### Agent Identification
- Prompt instructs Claude to detect the source agent from content patterns and mention it in the summary field naturally (e.g., "This Cursor rules file instructs the agent to...")
- If agent cannot be identified, skip the mention — just describe what the file does
- No explicit pattern hints list in the prompt — let Claude infer from content
- No agent detection in intent field — summary only

### Schema Changes
- Add optional `detected_agent` field to AuditResult with enum values: "claude" | "cursor" | "windsurf" | "copilot" | "cline" | "aider" | "unknown"
- Field is optional so existing cached audits remain valid — no cache invalidation needed
- Report page does not display detected_agent — field exists in data only for downstream consumers (CLI scan, install)

### Claude's Discretion
- Exact wording of agent-specific risk pattern examples in the prompt
- How to restructure the prompt for clarity while maintaining injection defense
- Zod schema updates for the new optional field

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `prompt.ts` (packages/audit-engine/src/prompt.ts): SYSTEM_PROMPT + buildUserMessage() — main file to modify
- `types.ts` (packages/audit-engine/src/types.ts): AuditResult type definition — add detected_agent
- `schema.ts` (packages/audit-engine/src/schema.ts): Zod schemas + AUDIT_TOOL definition — add detected_agent validation

### Established Patterns
- XML fence isolation (`<skill_content>`) for untrusted input — keep this pattern
- Zod schema validation on Claude responses — extend for new field
- DI factories (createEngine/createCache) for testability
- Content-hash caching via SHA-256 — optional field means old cache entries still valid

### Integration Points
- `engine.ts`: Core audit execution — may need to extract detected_agent from tool response
- `parse.ts`: Deep JSON parsing — ensure detected_agent flows through correctly
- CLI and web API routes consume AuditResult — optional field is backward compatible

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 13-universal-audit-engine*
*Context gathered: 2026-03-11*
