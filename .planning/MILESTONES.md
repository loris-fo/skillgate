# Milestones

## v1.1 Web Redesign (Shipped: 2026-03-09)

**Phases:** 3 | **Plans:** 6 | **Files modified:** 39 | **LOC:** +2,922 / -215
**Timeline:** 3 days (2026-03-07 → 2026-03-09)
**Git range:** `feat(07-01)` → `feat(09-02)`

**Delivered:** Complete web redesign with light sky-blue aesthetic, marketing landing page, and redesigned audit/report pages -- all API routes, data logic, and audit engine untouched.

**Key accomplishments:**
1. Light sky-blue design system tokens (colors, typography, shadows) replacing dark terminal theme
2. Shared Header (sticky, frosted-glass, wordmark, npm pill, GitHub icon) and Footer across all pages
3. Marketing landing page with hero, feature cards, scroll-animated report mockup, and badge snippet
4. Dedicated /audit route with redesigned form and full-page overlay loading state
5. Report page with verdict pill badges, numeric X/10 score, collapsible category cards in 2-col grid
6. All existing functionality preserved: form submission, redirect, badges, shareable URLs, copy buttons

**Requirements:** 15/15 v1.1 requirements satisfied
**Known tech debt:** Avoid verdict uses orange instead of red (wrong severity token), duplicate utility heading

---

## v1.0 MVP (Shipped: 2026-03-06)

**Phases:** 6 | **Plans:** 15 | **Commits:** 100 | **LOC:** 4,797 TypeScript
**Timeline:** 2 days (2026-03-05 → 2026-03-06)
**Git range:** `feat(01-01)` → `feat(06-02)`

**Delivered:** A full-stack security auditor for Claude AI skills — web app, CLI, and API — that analyzes SKILL.md files across 5 security categories with plain-English reasoning.

**Key accomplishments:**
1. Audit engine analyzing SKILL.md across 5 security categories with content-hash caching and prompt injection defense
2. Next.js 15 API routes (audit, report, badge) with Upstash Redis persistence and rate limiting
3. Dark terminal aesthetic web UI with expandable category cards, shareable report URLs, and OG image generation
4. `skillgate` CLI with install/scan commands, colored output, JSON mode, and High/Critical gating
5. npm-publishable CLI package with clean tarball and lifecycle hooks
6. Tech debt cleanup: ora spinners, recommendation sub-fields, badge URL fix, test fixes

**Requirements:** 31/31 v1 requirements satisfied
**Tests:** 118 tests across 20 test files, all passing

---

