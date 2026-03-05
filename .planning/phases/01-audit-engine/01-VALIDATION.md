---
phase: 1
slug: audit-engine
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | packages/audit-engine/vitest.config.ts (Wave 0 creates) |
| **Quick run command** | `pnpm --filter @skillgate/audit-engine test` |
| **Full suite command** | `pnpm --filter @skillgate/audit-engine test --run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @skillgate/audit-engine test`
- **After every plan wave:** Run `pnpm --filter @skillgate/audit-engine test --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | INFRA-01 | integration | `pnpm --filter @skillgate/audit-engine test` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | INFRA-02 | unit | `pnpm --filter @skillgate/audit-engine test` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | AUDIT-01 | unit | `pnpm --filter @skillgate/audit-engine test` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | AUDIT-02 | unit | `pnpm --filter @skillgate/audit-engine test` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 1 | AUDIT-03 | unit | `pnpm --filter @skillgate/audit-engine test` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 2 | AUDIT-04 | unit | `pnpm --filter @skillgate/audit-engine test` | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 2 | AUDIT-05 | unit | `pnpm --filter @skillgate/audit-engine test` | ❌ W0 | ⬜ pending |
| 01-03-03 | 03 | 2 | AUDIT-06 | unit | `pnpm --filter @skillgate/audit-engine test` | ❌ W0 | ⬜ pending |
| 01-04-01 | 04 | 2 | INFRA-03 | unit | `pnpm --filter @skillgate/audit-engine test` | ❌ W0 | ⬜ pending |
| 01-04-02 | 04 | 2 | INFRA-04 | integration | `pnpm --filter @skillgate/audit-engine test` | ❌ W0 | ⬜ pending |
| 01-04-03 | 04 | 2 | INFRA-05 | unit | `pnpm --filter @skillgate/audit-engine test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `packages/audit-engine/vitest.config.ts` — vitest configuration
- [ ] `packages/audit-engine/src/__tests__/` — test directory structure
- [ ] `vitest` — dev dependency in audit-engine package

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Prompt injection resilience | AUDIT-03 | Adversarial edge cases need human review | Test with crafted SKILL.md containing XML escape attempts |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
