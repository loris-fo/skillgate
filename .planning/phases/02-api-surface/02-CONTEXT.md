# Phase 2: API Surface - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Next.js API routes that expose the audit engine over HTTP, persist results to Upstash Redis, serve audit reports via permanent slug-based URLs, and generate SVG badges. Rate limiting protects the audit endpoint from abuse. This phase does NOT include the web UI — only the API layer.

</domain>

<decisions>
## Implementation Decisions

### Slug Generation
- Extract skill name from SKILL.md content (parse first H1 heading or metadata)
- Slugify the extracted name, truncated to ~30 characters
- Append short hash suffix for collision handling (e.g., `commit-abc123`)
- Slug is the canonical public URL — content hash is internal/API-only
- Store slug→audit mapping in KV

### Badge Design
- Shields.io flat style (two-tone: [Skillgate | Verdict])
- Text: left side = "Skillgate", right side = recommendation verdict (Install, Review First, etc.)
- Traffic-light color scheme: install=green, install_with_caution=yellow, review_first=orange, avoid=red
- Badge links to full audit report when clicked
- Copyable markdown snippet includes both image URL and report link

### API Response Shape
- POST /api/audit accepts JSON body: `{ "content": "...skill.md..." }`
- Returns full AuditResult + metadata (slug URL, badge URL, created_at, cached flag) — one request gets everything
- GET /api/report/{slug} returns the same shape as POST response — consumers don't need two formats
- Structured JSON errors: `{ "error": { "code": "INPUT_TOO_LARGE", "message": "..." } }` — maps to existing AuditErrorCode

### Rate Limiting
- Per-IP rate limiting on POST /api/audit only (30 audits/hour)
- GET endpoints (report, badge) are NOT rate-limited — they're cheap KV reads, and badges need to load fast in READMEs
- 429 response includes Retry-After header with seconds until reset
- Rate limit state stored in KV with TTL

### Claude's Discretion
- Rate limit implementation approach (sliding window vs fixed window)
- How to extract skill name from SKILL.md content (regex, heading parse, etc.)
- KV key structure for slugs and rate limits
- SVG badge generation library choice
- Streaming response for long-running audits (mentioned in STATE.md as needed)
- Next.js route handler patterns and middleware structure

</decisions>

<specifics>
## Specific Ideas

- Badge must work on both light and dark GitHub README backgrounds
- Slug should be recognizable in a URL — "commit-abc123" not "abc123"
- Cache hit from engine should still be reflected in response (cached: true flag)
- Error codes should reuse existing AuditErrorCode enum from the engine, extended with API-specific codes (RATE_LIMITED, NOT_FOUND)

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/audit-engine`: Full engine with `auditSkill(content)` → `AuditResult`, `createEngine()` for DI
- `AuditError` class with typed error codes: INPUT_TOO_LARGE, API_ERROR, VALIDATION_ERROR
- `buildCacheKey()` in hash.ts: SHA-256 content hashing already implemented
- `auditResultSchema` (Zod): can validate API responses on the server side
- `Cache` interface with `getCached`/`setCached` — KV abstraction ready

### Established Patterns
- DI via factory functions (`createEngine`, `createCache`) — API routes should follow same pattern
- Fire-and-forget cache writes (cache failure doesn't fail the operation)
- Zod schema validation for structured data
- Upstash Redis as KV store

### Integration Points
- `apps/web` package exists with `@skillgate/audit-engine` dependency — ready for API routes
- Engine's `auditSkill()` is the main integration point for POST /api/audit
- `AuditResult` type is the shared contract between engine and API response
- KV (Upstash Redis) already configured in engine — API routes will use same instance for slug storage and rate limiting

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-api-surface*
*Context gathered: 2026-03-05*
