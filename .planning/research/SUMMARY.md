# Project Research Summary

**Project:** Skillgate
**Domain:** AI skill security auditor — CLI + Web SaaS with shared audit engine
**Researched:** 2026-03-05
**Confidence:** MEDIUM-HIGH

## Executive Summary

Skillgate is a security auditing tool for Claude AI SKILL.md files — a domain with no direct competitors. The closest conceptual peer is Socket.dev (behavioral, semantic analysis of third-party artifacts), but Skillgate occupies an uncontested niche: AI-native threat modeling with plain-English explanations. The product is built as a pnpm monorepo with three packages: a shared audit engine, a Next.js web app deployed on Vercel, and a published npm CLI. The architecture is constrained and well-defined: the CLI always calls the web API over HTTP, never imports the audit engine directly, ensuring all results are cached in a single Upstash Redis store and that no Anthropic API key ever ships in the npm package.

The recommended approach is to build in dependency order — audit engine first, then API routes, then web UI, then CLI — with security hardening baked into each layer from day one. The audit engine must implement prompt injection defenses and content-hash dedup with prompt versioning before any public traffic hits it. Rate limiting and streaming responses must be in place before launch to prevent both cost explosions and Vercel timeout failures. Badge cache headers must be set correctly on first implementation since CDN TTL mistakes affect all README users worldwide.

The primary risks are credibility risks, not technical ones. If a malicious skill bypasses the audit (via prompt injection) and receives a cached SAFE badge, the entire trust layer is compromised. If legitimate skills are over-flagged (false positive rate too high), developers will publicly reject the tool. Both risks must be addressed with calibration corpus testing and structural XML delimiters in the audit prompt before any public launch. Everything else — slug collisions, npm publish footguns, cold start timeouts — is manageable with standard mitigations.

---

## Key Findings

### Recommended Stack

The stack is constrained by PROJECT.md in several key areas (Next.js 14 App Router, Tailwind CSS 4, pnpm workspaces, no Turborepo) and the research confirms these choices are sound. Upstash Redis is the correct KV solution — Vercel KV (`@vercel/kv`) was sunset in 2025. The CLI should be bundled with tsup and use Commander.js for argument parsing. Badge generation should use `badge-maker` (the library that powers shields.io) rather than calling the shields.io API. The `@anthropic-ai/sdk` is used only in the audit engine package — never in the CLI.

**Core technologies:**
- **Next.js 14 (App Router):** Web app + API routes — Vercel-native, collocates UI and API, constrained by PROJECT.md
- **pnpm 9 workspaces:** Monorepo orchestration — faster than npm/yarn, native workspace support, no Turborepo needed for 3 packages
- **@upstash/redis:** KV persistence for audit results + dedup — direct replacement for deprecated @vercel/kv
- **@anthropic-ai/sdk:** Claude API client for audit engine — official SDK, TypeScript-first, keep server-side only
- **Commander.js v12:** CLI argument parsing — industry standard (60M+/wk downloads), best TypeScript ergonomics
- **tsup v8:** CLI TypeScript bundler — esbuild-based, zero-config, handles shebang injection, CJS output
- **badge-maker v3.3+:** SVG badge generation — the library powering shields.io, no external API dependency
- **Tailwind CSS 4:** Utility-first styling — constrained by PROJECT.md, CSS-native config in v4
- **Vitest v2:** Testing — workspace-aware, TypeScript-native, for audit engine unit tests

### Expected Features

Research comparing Snyk, Socket.dev, npm audit, VirusTotal, Semgrep, and Dependabot surfaces clear market expectations and differentiation opportunities.

**Must have (table stakes):**
- Severity scoring (Safe/Caution/High/Critical) — every security tool uses this language; missing it makes the product feel unprofessional
- Per-category breakdown with reasoning — users expect to understand what failed and why, not just a total score
- Non-zero exit code on failure — CI/CD pipelines depend on this; `--force` override is the standard pattern
- Machine-readable JSON output (`--json` flag) — required for scripting, IDE integrations, automated workflows
- Shareable permanent result URL — VirusTotal/Socket both produce permanent report URLs; expected for sharing in issues/PRs
- README badge — shields.io/Snyk/Socket badges are de facto trust signals in OSS; absence is conspicuous
- Scan from URL (not just paste) — friction reducer; all competitors support direct URL input
- Content-hash dedup — VirusTotal's hash-based dedup is a universal expectation; same content = same result
- Clear install/don't-install recommendation — users need an actionable verdict, not just a risk list

**Should have (competitive differentiators):**
- "Risky by design" vs "maliciously risky" distinction — no existing tool makes this distinction; eliminates false positives for legitimate high-privilege skills
- AI-threat category taxonomy (Hidden Logic, Data Access, Action Risk, Permission Scope, Override Attempts) — AI-native threat vectors not covered by any existing scanner
- Prompt injection / override detection — novel attack surface unique to SKILL.md; no competitor addresses it
- Natural language audit reasoning — Claude explains what the skill does in plain English; far richer than CVE IDs or category labels
- CLI `install` command (audit + install in one step) — no current tool combines the gate and the action; reduces developer friction
- Homepage IS the audit interface — zero-friction public scanning without account creation is rare and a meaningful UX differentiator

**Defer (v2+):**
- User accounts / team dashboards — auth friction kills adoption; wait for team feature demand signal
- IDE plugins — wait for CLI traction before expanding surface area
- Continuous monitoring / alerts — requires auth, webhooks, email infrastructure; premature at launch
- GitHub App integration — wait for API stabilization
- Automated fix suggestions — SKILL.md fixes are semantic, not syntactic; no equivalent to `npm audit fix`

### Architecture Approach

The monorepo is organized into three packages with strict boundary enforcement: `@skillgate/audit-engine` (core logic, Claude orchestration, Zod schemas, SHA-256 hashing), `@skillgate/web` (Next.js app with thin API route handlers + UI), and `skillgate` (npm CLI that calls the web API over HTTP). The critical boundary is that the CLI never imports the audit engine directly — it is always a thin HTTP client to `/api/audit`. This keeps the CLI lightweight, ensures all audits are cached centrally, and keeps the Anthropic API key server-side only.

**Major components:**
1. **`@skillgate/audit-engine`** — Core audit logic: content hashing, Claude prompt orchestration, Zod validation, slug generation. Foundation that everything else depends on.
2. **`@skillgate/web` API routes** — Thin orchestrators: parse input, check KV cache, call audit engine, persist results. Three routes: `POST /api/audit`, `GET /api/report/[id]`, `GET /api/badge/[id]`
3. **`@skillgate/web` UI** — Homepage audit interface + `/report/[slug]` permalink page. Calls own API routes.
4. **`skillgate` CLI** — Fetcher (normalizes GitHub/HTTP/local sources) + API client + `scan`/`install` commands + terminal formatter.
5. **Upstash Redis (KV)** — Permanent audit result store, content-hash dedup index, slug-to-hash lookup, rate limit counters.

### Critical Pitfalls

1. **Prompt injection via analyzed skill content** — A SKILL.md can embed instructions targeting the audit model, producing a falsely cached SAFE rating. Prevention: wrap skill content in `<skill_content>` XML tags with explicit untrusted-content instructions in the system prompt; never interpolate raw content into the instruction portion. Must be solved in Phase 1 before any public access — a cached false positive is permanent.

2. **LLM non-determinism breaks cache coherence** — The assumption "same content = same audit" only holds if the model and prompt are pinned. Prevention: set `temperature: 0` for all audit calls; include a `prompt_version` field in every KV record; make cache key `sha256(content) + ":" + prompt_version`. Must be in Phase 1 — retrofitting the KV key structure requires full migration.

3. **Content-hash computed on un-normalized bytes** — Different line endings or whitespace produce different hashes for identical logical content, breaking dedup and doubling AI costs. Prevention: normalize (trim whitespace, LF line endings, strip BOM) before hashing; store normalized form. Phase 1 design decision — changing later requires migrating all KV entries.

4. **Vercel cold start timeouts on audit calls** — Claude calls take 5-15 seconds; Vercel Hobby default timeout is 10 seconds. Prevention: use streaming responses to keep the HTTP connection alive; set `maxDuration = 60` (requires Vercel Pro); keep audit route on Node.js runtime (not Edge). Must be tested in real Vercel deployment before launch — local development hides this entirely.

5. **False positive rate destroys developer trust** — Over-flagging legitimate skills causes public credibility damage before launch. Prevention: build a calibration corpus (20-30 known-safe, 10-15 known-risky skills); tune thresholds to <10% false positive rate before public access; prominently surface the "risky by design" distinction.

---

## Implications for Roadmap

The package dependency graph dictates phase order. The audit engine must exist before API routes can be written; API routes must exist before the web UI is meaningful; the CLI requires a deployed API to call. Security hardening (prompt injection defense, rate limiting) must be baked into each layer as it is built — not retrofitted.

### Phase 1: Audit Engine Foundation

**Rationale:** Everything else depends on this package. It can be built and unit tested in isolation before any web surface exists. Security decisions made here (prompt structure, KV key schema, content normalization, prompt versioning) are extremely expensive to change later.
**Delivers:** `@skillgate/audit-engine` — SHA-256 content hasher with normalization, Zod schema definitions, Claude audit prompt with XML delimiters for injection defense, `runAudit()` function, slug generator, `prompt_version` tracking.
**Addresses:** Core audit features (5-category analysis, plain-English reasoning, "risky by design" distinction, final recommendation)
**Avoids:** Prompt injection (Pitfall 1), non-determinism cache incoherence (Pitfall 3), normalization gaps (Pitfall 2), schema drift (Pitfall 14)
**Research flag:** This phase involves the most novel domain logic (AI threat taxonomy, prompt engineering for security). Consider using `/gsd:research-phase` for the audit prompt design specifically.

### Phase 2: API Surface + KV Infrastructure

**Rationale:** API routes are the integration layer between the engine and all consumers (web UI, CLI, badge embeds). KV integration, rate limiting, and streaming must be implemented before any public traffic. Badge cache headers must be correct from day one.
**Delivers:** Three Next.js API routes (`POST /api/audit`, `GET /api/report/[id]`, `GET /api/badge/[id]`), Upstash Redis integration with dedup + slug index, per-IP sliding window rate limiting, `maxDuration` streaming configuration, correct badge cache headers.
**Uses:** `@upstash/redis`, `@upstash/ratelimit`, `badge-maker`, Next.js App Router Route Handlers
**Implements:** Thin orchestrator pattern (no business logic in routes), KV key schema (`audit:{hash}`, `slug:{slug}`)
**Avoids:** Cost explosion from missing rate limiting (Pitfall 4), Vercel cold start failures (Pitfall 8), stale badge cache (Pitfall 5), hotlink bandwidth costs (Pitfall 11), slug collisions (Pitfall 13)
**Research flag:** Upstash Redis API patterns are well-documented; standard implementation, skip research phase.

### Phase 3: Web UI

**Rationale:** With working API routes, the UI is a presentation layer over proven endpoints. Homepage = audit interface is a product/UX decision already made.
**Delivers:** Homepage with SKILL.md paste + URL input form, `/report/[slug]` permalink page with full category breakdown, dark terminal aesthetic, badge embed snippet display.
**Uses:** Tailwind CSS 4, shadcn/ui (Textarea, Button, Badge, Collapsible), Next.js App Router pages
**Implements:** Zero-friction public audit interface (no auth), shareable report permalinks
**Avoids:** Auth friction (anti-feature), bulk/batch complexity (anti-feature)
**Research flag:** Standard Next.js App Router patterns; well-documented, skip research phase.

### Phase 4: CLI Package

**Rationale:** CLI requires a deployed API to call; it is the last package to build. The key architectural constraint (CLI calls API, never imports audit engine) simplifies this phase significantly.
**Delivers:** `skillgate` npm package with `scan` and `install` commands, GitHub/HTTP/local file fetcher, terminal formatter with dark aesthetic, exit code gating (0 = safe/caution, 1 = high/critical), `--force` override, `--json` flag, `SKILLGATE_API_URL` override for local dev.
**Uses:** Commander.js v12, tsup v8 (CJS build with shebang injection), Node.js native `fetch`
**Implements:** Thin CLI-as-HTTP-client pattern; CLI never bundles audit engine
**Avoids:** Version drift between CLI and web (Pitfall 7), API key in npm package (architecture boundary)
**Research flag:** Commander.js and tsup are extremely well-documented standard tools; skip research phase.

### Phase 5: CLI Packaging + Publishing

**Rationale:** Publishing is a one-shot operation with permanent consequences. A bad first publish cannot be deleted from npm. This phase is about correctness, not feature completeness.
**Delivers:** Correct `package.json` with explicit `files` allowlist, `engines` field enforcing Node >= 18, Node version runtime check, `prepublishOnly` build script, `npm pack --dry-run` CI validation, first `pnpm publish` to npm registry.
**Avoids:** Sensitive files in npm package (Pitfall 6), `workspace:*` leaking into tarball (Pitfall 15), Node version incompatibility errors (Pitfall 12)
**Research flag:** Well-documented pnpm publish patterns; skip research phase.

### Phase Ordering Rationale

- The audit engine (Phase 1) is a hard prerequisite for every other phase — API routes import it, and the CLI's correctness depends on the API being live.
- Security hardening is not a separate phase — it is embedded in Phase 1 (prompt injection defense, prompt versioning) and Phase 2 (rate limiting, streaming). Treating it as polish leads to retrofitting a polluted KV store.
- The CLI (Phase 4) is deliberately last because it calls the deployed API, not local code. Development against `SKILLGATE_API_URL=http://localhost:3000` allows parallel development once Phase 2 is complete.
- Phase 5 (publishing) is separated from Phase 4 (building) because the first npm publish is irreversible and deserves its own checklist-driven execution.

### Research Flags

Phases likely needing `/gsd:research-phase` during planning:
- **Phase 1 (Audit Engine):** The Claude prompt engineering for security analysis is novel domain work. The 5-category taxonomy, "risky by design" detection, and prompt injection defense patterns are not well-documented anywhere — they require iterative prompt design and calibration corpus testing.

Phases with standard patterns (skip research phase):
- **Phase 2 (API Surface):** Upstash Redis + Next.js Route Handlers patterns are extensively documented.
- **Phase 3 (Web UI):** Next.js App Router + Tailwind + shadcn/ui are mature, well-documented stacks.
- **Phase 4 (CLI):** Commander.js + tsup CLI patterns are among the most documented Node.js workflows.
- **Phase 5 (Publishing):** pnpm publish workflow is straightforward and well-documented.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Core choices (Next.js 14, Commander.js, tsup, pnpm) are HIGH confidence. Package versions need verification against npm registry before pinning. Upstash Redis as @vercel/kv replacement is MEDIUM — deprecation timeline should be confirmed. |
| Features | MEDIUM-HIGH | Table stakes derived from well-established tools (Snyk, Socket, npm audit) are HIGH confidence. AI-specific threat taxonomy is project-specific and novel — no external validation available. Competitive landscape for AI-native auditors may have shifted after August 2025. |
| Architecture | HIGH | Monorepo structure, CLI-calls-API boundary, content-hash dedup, and Next.js Route Handler patterns are extremely well-documented. The architecture is conservative and proven. |
| Pitfalls | MEDIUM-HIGH | Prompt injection, rate limiting, cold starts, npm publish footguns, and cache invalidation patterns are well-established. LLM-specific pitfalls (non-determinism, cache coherence) are newer territory but logically sound. GitHub Camo CDN TTL should be verified. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Vercel KV deprecation timing:** Confirm exact sunset date of `@vercel/kv` and Upstash Redis migration path before starting Phase 2. Reference: https://upstash.com/docs/redis/quickstarts/vercel
- **Package versions:** All package versions (pnpm 9, Commander 12, tsup 8, badge-maker 3.3, @anthropic-ai/sdk, @upstash/redis 1.31, Vitest 2) need verification against npm registry before pinning in package.json files.
- **Audit prompt calibration:** The 5-category AI threat taxonomy has no external validation source — it is internally defined in PROJECT.md. A calibration corpus of known-safe and known-malicious SKILL.md files must be assembled during Phase 1 to validate the prompt before public launch.
- **Vercel Pro requirement:** The `maxDuration = 60` setting for long audit calls requires Vercel Pro tier. Confirm this is acceptable before architecture is locked.
- **Claude model pinning:** `claude-sonnet-4-20250514` is specified in PROJECT.md. Verify this model ID is current and available at the Anthropic API before Phase 1.

---

## Sources

### Primary (HIGH confidence)
- Training data: pnpm workspaces documentation — monorepo structure, workspace protocol, publish behavior
- Training data: Next.js 14 App Router Route Handlers — API route patterns, `maxDuration`, streaming
- Training data: Commander.js v12 documentation — CLI argument parsing patterns
- Training data: tsup documentation — CLI bundling, shebang injection, CJS output
- Training data: LLM prompt injection attack patterns — indirect injection via processed content
- Training data: Anthropic API rate limiting and timeout behavior
- Training data: SVG badge cache invalidation (standard HTTP caching)
- PROJECT.md — project constraints, technology choices, model specification

### Secondary (MEDIUM confidence)
- Training data: Snyk, Socket.dev, npm audit, VirusTotal, Dependabot, Semgrep feature sets — feature comparison
- Training data: Upstash Redis as Vercel KV successor — ecosystem reports
- Training data: badge-maker library (shields.io underlying) — version and API
- Training data: GitHub Camo CDN caching behavior — approximately 5-minute TTL

### Tertiary (LOW confidence — verify before implementation)
- Specific package versions across all dependencies — all need npm registry verification
- Competitive landscape for AI-native skill auditors — new niche, may have changed after August 2025 cutoff
- Vercel KV exact deprecation/sunset timeline

---
*Research completed: 2026-03-05*
*Ready for roadmap: yes*
