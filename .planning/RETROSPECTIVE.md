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

## Milestone: v1.1 — Web Redesign

**Shipped:** 2026-03-09
**Phases:** 3 | **Plans:** 6 | **Files modified:** 39

### What Was Built
- Light sky-blue design system tokens replacing dark terminal theme, with backward-compat aliases
- Shared Header (sticky, frosted-glass blur, wordmark, npm copy pill, GitHub icon) and Footer across all pages
- Marketing landing page with hero CTA, 3-column feature cards, scroll-animated report mockup, badge snippet
- Dedicated /audit route with card-based form UI and full-page overlay loading state
- Redesigned report page with verdict pills, numeric X/10 score, collapsible 2-col category grid

### What Worked
- Visual-only scope constraint (no API/data changes) eliminated risk of regressions
- Backward-compat CSS aliases enabled incremental migration — existing pages rendered correctly throughout
- Phase ordering (tokens → layout → pages) meant each phase built cleanly on the previous
- Server component defaults for landing page (zero client JS for hero/features) — only AnimatedMockup and BadgeSnippet needed client
- All 3 phase verifications passed on first attempt — clean execution throughout

### What Was Inefficient
- ROADMAP.md progress table still got out of sync (Phase 7 showed "Not started" and "0/2 plans" when actually complete)
- REQUIREMENTS.md AUDIT-01/AUDIT-02 checkboxes not updated during execution — caught only in audit
- `gsd-tools summary-extract` couldn't find files despite them existing on disk — had to grep manually

### Patterns Established
- `@theme inline` block in globals.css for Tailwind v4 CSS variable-based design tokens
- Clipboard copy with useState/setTimeout pattern for "Copied!" feedback
- IntersectionObserver + CSS transitionDelay for scroll-triggered stagger animations
- Full-page overlay loading pattern (fixed inset-0, backdrop-blur-sm) over interactive forms
- Numeric severity scoring (safe=2, low=4, moderate=6, high=8, critical=10) for X/10 display

### Key Lessons
1. Keep REQUIREMENTS.md checkboxes updated during plan execution, not just in SUMMARY frontmatter — stale docs cause audit noise
2. Pure visual redesigns are low-risk when scoped correctly — all 15 requirements satisfied, zero regressions
3. Integration checker caught real cross-phase issues (wrong severity token, duplicate heading) that per-phase verification didn't

### Cost Observations
- Model mix: quality profile (opus for orchestration, sonnet for sub-agents)
- Sessions: ~4 sessions over 3 days
- Notable: 6 plans across 3 phases in 3 days — clean velocity from tight scope and clear dependency chain

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Commits | Phases | Key Change |
|-----------|---------|--------|------------|
| v1.0 | 100 | 6 | Initial milestone — established audit-before-complete pattern |
| v1.1 | ~25 | 3 | Visual-only scope — all phases passed verification on first attempt |

### Cumulative Quality

| Milestone | Tests | Test Files | Web LOC |
|-----------|-------|------------|---------|
| v1.0 | 118 | 20 | 4,797 |
| v1.1 | 118 | 20 | 2,509 (web app) |

### Top Lessons (Verified Across Milestones)

1. Milestone audit before completion catches real integration gaps that per-phase verification misses (v1.0: 6 gaps, v1.1: 2 defects)
2. Dependency-ordered phasing prevents blocked work and enables clean integration (confirmed both milestones)
3. Keep ROADMAP.md and REQUIREMENTS.md in sync during execution — stale docs create unnecessary audit noise (recurring v1.0 + v1.1)
