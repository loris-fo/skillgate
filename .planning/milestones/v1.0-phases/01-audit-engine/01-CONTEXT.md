# Phase 1: Audit Engine - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Core audit logic, monorepo scaffolding, and shared infrastructure. The audit engine package analyzes a SKILL.md file and returns a structured result with 5 security categories, utility analysis, and a final recommendation. Also includes pnpm workspace setup, TypeScript config, Upstash Redis integration for content-hash caching, and all security foundations.

</domain>

<decisions>
## Implementation Decisions

### Prompt Integration
- Single system prompt architecture — system prompt defines the auditor, SKILL.md goes in user message
- Structured output via Anthropic tool use (function calling) — no JSON parsing from text, typed schema
- Prompt versioning: Claude's discretion on approach (semantic version vs prompt-content hash)
- Prompt file location: Claude's discretion (inline vs separate file)

### Security Hardening
- Prompt injection defense: XML fence around SKILL.md content in user message + explicit system prompt warning about injection attempts
- Content normalization before hashing: trim whitespace, collapse multiple spaces/newlines, normalize line endings — cosmetic edits don't trigger re-audit
- Max SKILL.md size: 100KB hard limit — reject larger files before processing
- Failure mode: return error on malformed Claude response or API failure — never cache failures, user retries

### Claude's Discretion
- Audit output shape: already fully defined. Tool use schema must implement
  exactly: overall score, verdict, summary, intent, 5 security categories
  (each with score/finding/detail/by_design), utility analysis
  (what_it_does/use_cases/not_for/trigger_behavior/dependencies),
  recommendation (verdict/for_who/caveats/alternatives).
  Scores: "safe"|"low"|"moderate"|"high"|"critical".
  Recommendation verdicts: "install"|"install_with_caution"|"review_first"|"avoid".
- Monorepo: pnpm workspaces. packages/audit-engine (the core, independently
  testable), apps/web (Next.js). Shared TypeScript config at root.
- Prompt versioning: semantic version string (e.g. "1.0") stored as constant
  alongside the prompt. Cache key format: {contentHash}:{promptVersion}.
  Bump manually only when audit logic meaningfully changes.
- Prompt file location (inline in engine code vs separate file)

</decisions>

<specifics>
## Specific Ideas

- The audit prompt is already written — wire it in, don't redesign it
- Cache key must include prompt version alongside content hash (from STATE.md decisions)
- Tool use schema should map directly to the 5 security categories + utility analysis + recommendation
- The engine must be independently testable without Next.js or API routes

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- None yet — this phase establishes the patterns for the rest of the project

### Integration Points
- packages/audit-engine will be imported by web API routes (Phase 2)
- CLI will call the API over HTTP, never importing audit-engine directly

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-audit-engine*
*Context gathered: 2026-03-05*
