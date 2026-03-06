---
phase: 2
slug: api-surface
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.2+ (workspace dependency) |
| **Config file** | `apps/web/vitest.config.ts` — needs creation (Wave 0) |
| **Quick run command** | `pnpm --filter @skillgate/web test` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @skillgate/web test`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 0 | WEB-06 | setup | `pnpm --filter @skillgate/web test` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | WEB-06 | integration | `pnpm --filter @skillgate/web exec vitest run src/app/api/audit/route.test.ts -x` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | DIST-01 | unit + integration | `pnpm --filter @skillgate/web exec vitest run src/lib/badge.test.ts -x` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | DIST-02 | integration | `pnpm --filter @skillgate/web exec vitest run src/app/api/report/route.test.ts -x` | ❌ W0 | ⬜ pending |
| 02-01-05 | 01 | 1 | DIST-03 | integration | `pnpm --filter @skillgate/web exec vitest run src/app/api/audit/route.test.ts -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/web/vitest.config.ts` — test config for web app
- [ ] `apps/web/src/lib/badge.test.ts` — stubs for DIST-01 badge generation
- [ ] `apps/web/src/lib/slug.test.ts` — stubs for slug generation
- [ ] `apps/web/src/app/api/audit/route.test.ts` — stubs for WEB-06, DIST-03
- [ ] `apps/web/src/app/api/report/__tests__/route.test.ts` — stubs for DIST-02
- [ ] `apps/web/src/app/api/badge/__tests__/route.test.ts` — stubs for DIST-01
- [ ] Mock infrastructure: Redis mock / in-memory store for testing KV without Upstash

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Badge renders correctly on GitHub dark/light | DIST-01 | Visual rendering | Open badge SVG in browser with both themes |
| Vercel timeout behavior under load | WEB-06 | Requires deployed environment | Deploy to preview, submit long SKILL.md |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
