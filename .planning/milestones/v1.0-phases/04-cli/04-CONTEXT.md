# Phase 4: CLI - Context

**Gathered:** 2026-03-05
**Status:** Ready for planning

<domain>
## Phase Boundary

`skillgate` CLI with two commands: `install` (audit + download a skill) and `scan` (audit all skills in a project). Calls the web API over HTTP — never imports audit-engine directly. Includes gating (exit 1 on High/Critical), force override, JSON output, and colored terminal output. npm publishing is a separate phase.

</domain>

<decisions>
## Implementation Decisions

### Terminal Output Design
- Compact summary by default: verdict + overall score + one-line per category (5 lines)
- Emoji + color for verdict display: ✅ Install / ⚠️ Review First / ❌ Avoid
- Animated spinner (ora-style) with "Auditing skill..." while API call is in progress
- Always append full web report link: "Full report: https://skillgate.dev/report/{slug}"
- --json flag outputs machine-readable JSON to stdout (no color, no spinner, no emoji)
- --verbose flag for expanded output with category findings (future consideration)

### Install Flow
- Default placement: .claude/ directory in project root
- Configurable via --output/-o flag to override target directory
- File naming: skill name based (e.g., commit.md, review-pr.md) — extracted from SKILL.md content, avoids collisions with multiple skills
- Gating: on High/Critical, show verdict + hint message ("❌ Blocked: High/Critical risk detected. Use --force to override."), exit 1
- --force flag overrides gating — places the file regardless of severity, exit 0
- skills.sh registry slug resolution: if input isn't a URL or local path, try https://skills.sh/registry/{slug}/SKILL.md (or similar). Fail gracefully if not found
- Input types: GitHub raw URLs, skills.sh slugs, any HTTP URL, local file paths

### Scan Command
- Default discovery: .claude/ and .claude/skills/ in project root
- Configurable via --path flag for alternative directories or files
- Output: table format with columns: File | Verdict | Score. Final line shows pass/fail count
- Parallel execution: audit all discovered files concurrently (with reasonable concurrency limit given 30/hr API rate limit)
- Exit code: exit 1 if ANY skill scores High/Critical (CI-friendly default)
- --no-fail flag makes it always exit 0 (reporting only, no gating)

### API Configuration
- Default API base URL: https://skillgate.dev/api
- Override via SKILLGATE_API_URL environment variable
- Request timeout: 60 seconds (covers Vercel cold start + long Claude analysis)
- Retry on network failure: 2-3 retries with backoff, then fail with clear message ("Could not reach Skillgate API. Check your network connection.")

### Standard CLI Conventions
- --version and --help commands (Commander.js handles this)
- Standard exit codes: 0 = success, 1 = failure/blocked

### Claude's Discretion
- Commander.js command structure and subcommand pattern
- Spinner library choice (ora or alternative)
- Exact color palette for terminal output (chalk or similar)
- Concurrency limit for parallel scan
- Retry backoff strategy
- How to detect if input is URL vs local path vs registry slug
- Table rendering library for scan output
- How to extract skill name for file naming

</decisions>

<specifics>
## Specific Ideas

- Skills.sh registry slug support makes the install command feel native to the Claude ecosystem: `skillgate install commit` instead of long URLs
- Table format for scan gives a clean "CI dashboard" feel in terminal
- Spinner disappears cleanly when result arrives — no leftover artifacts in CI logs
- The CLI should work well in both interactive terminals and CI pipelines (--json for CI, colored output for humans)

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AuditResult`, `AuditResponse` types from @skillgate/audit-engine — shared contract for parsing API responses
- `AuditError` class with typed error codes — can inform CLI error messages
- `auditResultSchema` (Zod) — can validate API responses client-side
- Slug extraction logic in apps/web/src/lib/slug.ts — extractSkillName() for file naming

### Established Patterns
- pnpm workspaces monorepo — CLI package goes in packages/cli/
- TypeScript strict mode with tsup for building
- Zod for runtime validation
- DI via factory functions

### Integration Points
- POST /api/audit accepts { content } or { url }, returns AuditResponse with result + meta (slug, URLs, cached flag)
- API returns structured JSON errors: { error: { code, message } }
- Rate limiting: 30 audits/hour per IP on POST /api/audit
- GET endpoints (report, badge) are not rate-limited

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-cli*
*Context gathered: 2026-03-05*
