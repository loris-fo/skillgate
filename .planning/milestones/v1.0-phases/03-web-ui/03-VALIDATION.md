---
phase: 3
slug: web-ui
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-03-05
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.2 |
| **Config file** | apps/web/vitest.config.ts |
| **Quick run command** | `pnpm --filter @skillgate/web test` |
| **Full suite command** | `pnpm --filter @skillgate/web test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @skillgate/web test`
- **After every plan wave:** Run `pnpm --filter @skillgate/web test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 1 | WEB-01 | unit (component) | `pnpm --filter @skillgate/web test -- src/components/__tests__/audit-form.test.tsx` | ❌ W0 | ⬜ pending |
| 3-01-02 | 01 | 1 | WEB-02 | unit (component) | `pnpm --filter @skillgate/web test -- src/components/__tests__/audit-form.test.tsx` | ❌ W0 | ⬜ pending |
| 3-02-01 | 02 | 1 | WEB-03 | unit (component) | `pnpm --filter @skillgate/web test -- src/components/__tests__/category-card.test.tsx` | ❌ W0 | ⬜ pending |
| 3-02-02 | 02 | 1 | WEB-04 | unit (component) | `pnpm --filter @skillgate/web test -- src/components/__tests__/utility-section.test.tsx` | ❌ W0 | ⬜ pending |
| 3-02-03 | 02 | 1 | WEB-05 | unit (component) | `pnpm --filter @skillgate/web test -- src/components/__tests__/report-hero.test.tsx` | ❌ W0 | ⬜ pending |
| 3-03-01 | 03 | 1 | WEB-07 | unit (component) | `pnpm --filter @skillgate/web test -- src/components/__tests__/badge-section.test.tsx` | ❌ W0 | ⬜ pending |
| 3-04-01 | 04 | 1 | WEB-08 | unit (page) | `pnpm --filter @skillgate/web test -- src/app/__tests__/page.test.tsx` | ❌ W0 | ⬜ pending |
| 3-04-02 | 04 | 1 | WEB-09 | unit (smoke) | `pnpm --filter @skillgate/web test -- src/app/__tests__/layout.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `@testing-library/react` + `@testing-library/jest-dom` — add as devDependencies for component testing
- [ ] `jsdom` environment — add `vitest` environment config for DOM testing
- [ ] `src/components/__tests__/` directory — all component tests are new
- [ ] `src/app/__tests__/` directory — page-level smoke tests are new
- [ ] Severity mapping unit tests: `src/lib/__tests__/severity.test.ts`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Full-page loading takeover visual | WEB-01 | Visual transition quality | Submit form, verify loading state covers page smoothly |
| Dark theme aesthetic | WEB-09 | Visual quality check | Load homepage, verify dark bg, purple accents, correct fonts |
| OG image rendering | WEB-05 | Social media preview | Share report URL, check OG image renders in preview |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
