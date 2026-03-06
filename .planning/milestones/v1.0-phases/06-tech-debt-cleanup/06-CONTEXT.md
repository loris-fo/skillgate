# Phase 6: Tech Debt Cleanup - Context

**Gathered:** 2026-03-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Close all non-blocking integration gaps and tech debt items identified by the v1.0 milestone audit. Five specific items: CLI spinner, recommendation sub-fields UI, badge URL consistency, API route test fixes, and severity.test.ts real assertions. No new features — purely closing gaps in existing work.

</domain>

<decisions>
## Implementation Decisions

### CLI Spinner (ora)
- Wire ora for real animated spinners — do NOT remove the dependency
- Spinner appears in both `install` and `scan` commands during API calls
- Suppressed entirely in JSON mode (--json) — stdout stays pure JSON, no spinner to stderr
- Contextual spinner messages that change during the operation: "Auditing skill..." → "Analyzing security..." → "Generating report..."
- Spinner stops with success/fail indicator on completion (ora's `.succeed()` / `.fail()`)

### Recommendation Sub-fields UI
- Render `for_who`, `caveats`, and `alternatives` inside the existing hero banner on the report page
- `for_who` displayed with a label: "Best for: [text]"
- `caveats` rendered as a warning-styled bulleted list
- `alternatives` rendered as a separate bulleted list
- Hide each sub-field when empty/missing — no "N/A" or "None" placeholders, graceful degradation
- Styling consistent with existing hero banner dark theme and purple accent

### Claude's Discretion
- Badge URL format fix approach (normalize in AuditMeta or in BadgeSection — whichever is cleaner)
- API route test fix strategy (mock Anthropic SDK or adjust test environment)
- severity.test.ts real test content (test actual severity utility functions or remove if no severity.ts exists)
- Exact spinner text progression and timing
- Sub-field typography and spacing within the hero banner

</decisions>

<specifics>
## Specific Ideas

- Spinner should "disappear cleanly" in CI logs — no leftover artifacts (from Phase 4 discussion)
- Hero banner was designed to be "immediately scannable" — sub-fields should not overwhelm the verdict prominence
- The contextual spinner messages should feel responsive, not fake — tie to actual operation stages if possible

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/cli/src/lib/output.ts`: Has `startSpinner()` stub that returns no-op object — replace internals with real ora calls
- `apps/web/src/components/report-hero.tsx`: Existing hero banner component — add sub-field rendering here
- `apps/web/src/components/badge-section.tsx`: Has badge URL construction — fix `.svg` suffix inconsistency
- `Recommendation` type in `packages/audit-engine/src/types.ts`: Already defines `for_who`, `caveats`, `alternatives`

### Established Patterns
- CLI uses dynamic imports for ESM-only dependencies (ora is ESM-only)
- Web UI uses Tailwind CSS with dark theme, purple accent
- Tests use vitest with vi.mock() for dependency isolation
- JSON mode flag check via `jsonMode` boolean in output.ts

### Integration Points
- `startSpinner()` is called from `scan.ts` already — just needs real implementation
- `install` command needs spinner added around the API call
- `ReportHero` component receives full `AuditResult` — sub-fields already available in props
- Badge route at `/api/badge/[id]/route.ts` strips `.svg` defensively — fix should be in the URL generation

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-tech-debt-cleanup*
*Context gathered: 2026-03-06*
