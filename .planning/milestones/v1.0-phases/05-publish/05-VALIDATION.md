---
phase: 5
slug: publish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-06
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest ^3.2.0 |
| **Config file** | `packages/cli/vitest.config.ts` |
| **Quick run command** | `cd packages/cli && pnpm test` |
| **Full suite command** | `pnpm -r test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd packages/cli && pnpm test`
- **After every plan wave:** Run `pnpm -r test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 5-01-01 | 01 | 1 | INFRA-06 | smoke | `cd packages/cli && pnpm pack --dry-run` | N/A | ⬜ pending |
| 5-01-02 | 01 | 1 | INFRA-06 | smoke | `node packages/cli/dist/index.js --version` | N/A | ⬜ pending |
| 5-01-03 | 01 | 1 | INFRA-06 | smoke | `cd packages/cli && pnpm pack --dry-run` | N/A | ⬜ pending |
| 5-01-04 | 01 | 1 | INFRA-06 | smoke | `cd packages/cli && pnpm run prepublishOnly` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements. This phase is primarily configuration changes, not code. Validation is done through `pnpm pack --dry-run` inspection rather than automated tests.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `npx skillgate install <url>` works | INFRA-06 | Requires package to be published to npm first | Publish to npm, then run `npx skillgate install <url>` from a clean environment |
| `npm install -g skillgate` works | INFRA-06 | Requires package to be published to npm first | Publish to npm, then run `npm install -g skillgate && skillgate --version` |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
