# Phase 16: File Type Detection - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

SkillGate automatically identifies which agent a skill file belongs to from its URL or content patterns, surfacing the result in audit report metadata and UI. Requirements: DETECT-01, DETECT-02.

</domain>

<decisions>
## Implementation Decisions

### URL-Based Detection
- Detection runs in the API route (web) and CLI before calling the audit engine — not inside the engine itself
- Reuse existing `getAgentForPath()` from `@skillgate/shared` — extract URL pathname and pass it through
- CLI applies the same logic when auditing via `skillgate audit <url>` — consistent behavior across web and CLI
- URL-based detection takes highest precedence over LLM inference

### Content-Based Detection
- Rely entirely on Claude's existing `detected_agent` field from the audit prompt (Phase 13) — no regex pre-detection
- No early/quick pre-scan before audit completes — user waits for full audit result which includes detection
- No `detection_source` metadata field — just `detected_agent` is sufficient

### Detection Precedence
- Three-tier fallback: (1) URL pattern match via `getAgentForPath()`, (2) LLM `detected_agent` from audit, (3) "unknown"
- URL always wins over LLM, even if LLM disagrees
- For cached audits (content-hash hit), URL-based detection overrides the cached `detected_agent` — same content may be used by different agents
- No explicit `agent` parameter accepted by the API — detection is always automatic
- When `detected_agent` is "unknown": omit agent label entirely in UI and CLI output (data field still present for API consumers)

### Detection Surfacing
- **Report page**: Subtle pill/tag near the report title showing agent name (e.g., "Cursor" or "Claude") — static label, no link, only shown when agent is known
- **CLI audit output**: Agent name in the summary line, e.g., "Verdict: safe (Cursor rules file)" — consistent with scan output
- **SVG badge**: No change — badge stays generic ("SkillGate | safe"), agent info doesn't belong on the badge

### Claude's Discretion
- Exact pill/tag styling and placement on report page
- CLI summary line formatting for agent display
- How to merge URL-detected agent with cached audit result in the API response flow

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `getAgentForPath()` (packages/shared/src/agent-map.ts): Already resolves agent from file path — directly reusable for URL pathname extraction
- `AGENT_SCAN_MAP` (packages/shared/src/agent-map.ts): Agent → paths mapping, source of truth for pattern matching
- `getAgentDisplayName()` (packages/shared/src/agent-map.ts): Display name lookup for UI labels
- `detected_agent` field (packages/audit-engine/src/types.ts): Already in AuditResult type as optional DetectedAgent enum
- Audit prompt (packages/audit-engine/src/prompt.ts): Already instructs Claude to detect agent from content and set detected_agent

### Established Patterns
- API route processes URL before calling auditSkill() — detection fits in this pre-processing step
- CLI input-resolver.ts distinguishes URL vs local file vs registry shorthand
- CLI scan already groups results by agent with section headers
- Content-hash caching via SHA-256 — cached results may need detected_agent override from URL

### Integration Points
- `apps/web/src/app/api/audit/route.ts`: Add URL-based detection before/after audit, override detected_agent in response
- `packages/cli/src/commands/audit.ts` (or install.ts flow): Apply getAgentForPath() to URL input
- `apps/web/src/app/report/[slug]/page.tsx`: Add agent pill/tag to report display
- `packages/cli/src/lib/output.ts`: Add agent display to CLI audit result formatting

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 16-file-type-detection*
*Context gathered: 2026-03-12*
