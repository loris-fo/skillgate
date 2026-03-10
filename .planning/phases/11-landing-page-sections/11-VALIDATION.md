---
phase: 11
slug: landing-page-sections
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + React Testing Library |
| **Config file** | `apps/web/vitest.config.ts` |
| **Quick run command** | `cd apps/web && npx vitest run src/components/landing/__tests__/ -x` |
| **Full suite command** | `cd apps/web && npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd apps/web && npx vitest run src/components/landing/__tests__/ -x`
- **After every plan wave:** Run `cd apps/web && npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 0 | HERO-01, HERO-02, HERO-03, RESP-02 | unit | `cd apps/web && npx vitest run src/components/landing/__tests__/hero-section.test.tsx -x` | ❌ W0 | ⬜ pending |
| 11-01-02 | 01 | 0 | FEAT-01, FEAT-02, FEAT-03, RESP-01 | unit | `cd apps/web && npx vitest run src/components/landing/__tests__/features-demo-section.test.tsx -x` | ❌ W0 | ⬜ pending |
| 11-01-03 | 01 | 0 | BADGE-01, BADGE-02 | unit | `cd apps/web && npx vitest run src/components/landing/__tests__/badge-snippet.test.tsx -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/web/src/components/landing/__tests__/hero-section.test.tsx` — stubs for HERO-01, HERO-02, HERO-03, RESP-02
- [ ] `apps/web/src/components/landing/__tests__/features-demo-section.test.tsx` — stubs for FEAT-01, FEAT-02, FEAT-03, RESP-01
- [ ] `apps/web/src/components/landing/__tests__/badge-snippet.test.tsx` — stubs for BADGE-01, BADGE-02

*Existing Vitest infrastructure covers framework needs — no new installs required.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Gradient orb visual appearance (opacity, blur, centering) | HERO-02 | Visual rendering quality not testable via unit tests | Open landing page, verify soft violet glow behind heading |
| Responsive layout at breakpoints | RESP-01, RESP-02 | Layout reflow best verified visually | Resize browser to 1024px and 768px, confirm stacking and heading size |
| Scroll-triggered entrance animations | FEAT-02 | IntersectionObserver timing is visual | Scroll to features+demo section, verify staggered fade-in |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
