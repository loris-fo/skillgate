# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-06
**Phases:** 6 | **Plans:** 15 | **Commits:** 100

### What Was Built
- Claude-powered audit engine with 5 security categories, content-hash caching, and prompt injection defense
- Next.js 15 API surface with audit, report, and badge endpoints backed by Upstash Redis
- Dark terminal aesthetic web UI with homepage-as-audit-interface, expandable category cards, shareable report URLs
- `skillgate` CLI with install/scan commands, colored output, JSON mode, and High/Critical gating
- npm-publishable package with clean tarball and lifecycle hooks
- Tech debt cleanup closing all integration gaps from milestone audit

### What Worked
- Dependency-ordered phasing (engine → API → UI → CLI → publish) prevented blocked work
- Separating npm publish into its own phase caught packaging issues (workspace:* references, devDependencies)
- Milestone audit before completion caught real issues: ora not wired, badge URL inconsistency, test stubs, SDK browser errors
- Phase 6 tech debt cleanup pattern: auditing then fixing gaps keeps quality high without slowing earlier phases
- DI factories (createEngine, createCache) made unit testing fast and reliable without live API calls

### What Was Inefficient
- ROADMAP.md progress table got out of sync with disk state (Phase 2, 4 showed "In Progress" when complete on disk)
- Some plan checkboxes in ROADMAP.md never got checked (cosmetic but confusing for audit)
- Phase 3 had 5 plans (03-00 through 03-04) which could have been 3 with better grouping

### Patterns Established
- Server-side URL fetch pattern for CORS bypass in audit form
- Full `vi.mock` without `importOriginal` for modules with side-effectful imports (Anthropic SDK)
- ora spinner via stderr to preserve stdout for JSON piping
- Conditional sub-field rendering (graceful hiding, no "N/A" placeholders)
- XML fence isolation for untrusted content in LLM prompts

### Key Lessons
1. Always wire imported dependencies at integration time, not "later" — ora was installed in Phase 4 but not wired until Phase 6
2. Run tests in the target environment early (jsdom for web tests) — Anthropic SDK `dangerouslyAllowBrowser` only surfaces in browser-like environments
3. Milestone audit is high-value: 31/31 requirements checked, but still found 6 integration gaps worth fixing
4. Keep ROADMAP.md phase status consistent with disk state — automate or verify after each phase completion

### Cost Observations
- Model mix: quality profile throughout (opus for planning/execution)
- Sessions: ~10 sessions over 2 days
- Notable: 15 plans executed in ~2 days with 100 commits — high velocity from clear requirements and dependency ordering

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Commits | Phases | Key Change |
|-----------|---------|--------|------------|
| v1.0 | 100 | 6 | Initial milestone — established audit-before-complete pattern |

### Cumulative Quality

| Milestone | Tests | Test Files | LOC |
|-----------|-------|------------|-----|
| v1.0 | 118 | 20 | 4,797 |

### Top Lessons (Verified Across Milestones)

1. Milestone audit before completion catches real integration gaps that per-phase verification misses
2. Dependency-ordered phasing prevents blocked work and enables clean integration
