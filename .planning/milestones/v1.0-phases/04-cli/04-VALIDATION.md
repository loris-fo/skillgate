---
phase: 4
slug: cli
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.2+ |
| **Config file** | packages/cli/vitest.config.ts (Wave 0 installs) |
| **Quick run command** | `pnpm --filter skillgate test` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter skillgate test`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 0 | CLI-06 | unit | `pnpm --filter skillgate exec vitest run tests/input-resolver.test.ts` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 0 | CLI-03, CLI-04 | unit | `pnpm --filter skillgate exec vitest run tests/gating.test.ts` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 0 | CLI-05, CLI-07 | unit | `pnpm --filter skillgate exec vitest run tests/output.test.ts` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 1 | CLI-01 | integration | `pnpm --filter skillgate exec vitest run tests/commands/install.test.ts` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 1 | CLI-02 | integration | `pnpm --filter skillgate exec vitest run tests/commands/scan.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `packages/cli/vitest.config.ts` — vitest configuration for CLI package
- [ ] `packages/cli/tests/input-resolver.test.ts` — stubs for CLI-06
- [ ] `packages/cli/tests/gating.test.ts` — stubs for CLI-03, CLI-04
- [ ] `packages/cli/tests/output.test.ts` — stubs for CLI-05, CLI-07
- [ ] `packages/cli/tests/api-client.test.ts` — API client retry logic
- [ ] `packages/cli/tests/commands/install.test.ts` — stubs for CLI-01
- [ ] `packages/cli/tests/commands/scan.test.ts` — stubs for CLI-02

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Colored terminal output renders correctly | CLI-07 | Visual formatting depends on terminal capabilities | Run `skillgate scan` in a real terminal, verify ANSI colors display |
| Spinner animation during fetch | CLI-01 | Spinner requires TTY; CI suppresses | Run `skillgate install <url>` interactively, verify spinner appears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
