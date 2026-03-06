---
phase: 6
slug: tech-debt-cleanup
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-06
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.2.0 |
| **Config file** | `apps/web/vitest.config.ts` (jsdom) and `packages/cli/vitest.config.ts` |
| **Quick run command** | `cd apps/web && npx vitest run` |
| **Full suite command** | `pnpm -r run test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick command for affected package
- **After every plan wave:** Run `pnpm -r run test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | CLI-07 | unit | `cd packages/cli && npx vitest run` | Needs new test | ⬜ pending |
| 06-02-01 | 02 | 1 | WEB-05 | unit | `cd apps/web && npx vitest run src/components/__tests__/report-hero.test.tsx` | Wave 0 | ⬜ pending |
| 06-02-02 | 02 | 1 | WEB-07 | unit | `cd apps/web && npx vitest run src/components/__tests__/badge-section.test.tsx` | Wave 0 | ⬜ pending |
| 06-02-03 | 02 | 1 | DIST-01 | unit | `cd apps/web && npx vitest run src/app/api/badge/__tests__/route.test.ts` | ✅ exists | ⬜ pending |
| 06-03-01 | 03 | 1 | N/A | unit | `cd apps/web && npx vitest run src/app/api/audit/__tests__/route.test.ts` | ✅ exists (failing) | ⬜ pending |
| 06-03-02 | 03 | 1 | N/A | unit | `cd apps/web && npx vitest run src/lib/__tests__/severity.test.ts` | ✅ exists (stub) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/web/src/components/__tests__/report-hero.test.tsx` — stubs for WEB-05 (sub-field rendering)
- [ ] `apps/web/src/components/__tests__/badge-section.test.tsx` — stubs for WEB-07 (badge URL format)
- [ ] CLI spinner test file — mock ora, verify `.start()` called in non-JSON mode, verify no-op in JSON mode

*Existing infrastructure covers framework installation.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Spinner animation visually smooth | CLI-07 | Visual/terminal rendering | Run `skillgate scan <url>` and observe spinner animation in terminal |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
