# Requirements: Skillgate

**Defined:** 2026-03-10
**Core Value:** Developers can trust-verify any Claude skill before installing it — with plain-English reasoning, not just a score.

## v1.2 Requirements

Requirements for v1.2 Landing Page Redesign. Each maps to roadmap phases.

### Design System

- [x] **DS-01**: Landing page uses dark purple/violet color palette (#1a1625 background, #2d2640 surfaces, #9d7aff accent)
- [x] **DS-02**: Dark theme tokens are scoped to landing page only — /audit and report pages retain light sky-blue theme
- [x] **DS-03**: Severity color tokens (safe/low/moderate/high/critical) remain consistent across both themes

### Header

- [x] **HDR-01**: Landing page header is a floating pill shape (rounded-full) with transparent backdrop blur
- [x] **HDR-02**: Header shows shield icon + "skillgate" wordmark, nav links (Docs, GitHub), CLI pill (`npx skillgate`), and "Try it" CTA button
- [x] **HDR-03**: Non-landing pages retain existing sticky header behavior unchanged

### Hero

- [ ] **HERO-01**: Hero heading "Don't install blind." displays at 120px on desktop, scaling down on mobile
- [ ] **HERO-02**: Subtle gradient orb (violet radial gradient) appears behind hero text
- [ ] **HERO-03**: Two CTAs: primary "Audit a skill" → /audit, secondary "View example report" → /report/cursor-rules-architect

### Features + Demo

- [ ] **FEAT-01**: Two-column layout: left column has 3 stacked feature cards (AI Security Analysis, CLI Gate, Trust Badges), right column has mock report demo
- [ ] **FEAT-02**: Mock report demo shows hardcoded mixed verdicts: cursor-rules-architect skill, "Use with Caution" verdict, 6.2/10 score, 5 category rows with Safe/Low/Moderate severities
- [ ] **FEAT-03**: Layout stacks to single column on tablet (≤1024px)

### Trust Badges

- [ ] **BADGE-01**: Three badge examples displayed (Safe to Install, Use with Caution, Avoid) with ShieldBadge SVGs
- [ ] **BADGE-02**: Each badge has its own markdown snippet with individual copy-to-clipboard button

### Footer

- [x] **FTR-01**: Footer renders dark variant on landing page (dark text, purple border)
- [x] **FTR-02**: Non-landing pages retain existing footer styling unchanged

### Responsive

- [ ] **RESP-01**: Tablet (≤1024px): features+demo stacks vertically, header adapts
- [ ] **RESP-02**: Mobile (≤768px): hero heading scales to smaller size, all sections single column

## Future Requirements

### Landing Enhancements

- **LAND-01**: Scroll-triggered entrance animations on feature cards and mock report
- **LAND-02**: Animated typing effect in hero subtitle
- **LAND-03**: Interactive mock report (expand categories on click)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Dark mode toggle | Landing page is always dark, product pages always light — no user toggle |
| /audit page redesign | v1.2 scope is landing page only |
| Report page redesign | v1.2 scope is landing page only |
| API/CLI changes | v1.2 is visual-only, no backend changes |
| New fonts | Keep Plus Jakarta Sans from v1.1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DS-01 | Phase 10 | Complete |
| DS-02 | Phase 10 | Complete |
| DS-03 | Phase 10 | Complete |
| HDR-01 | Phase 10 | Complete |
| HDR-02 | Phase 10 | Complete |
| HDR-03 | Phase 10 | Complete |
| HERO-01 | Phase 11 | Pending |
| HERO-02 | Phase 11 | Pending |
| HERO-03 | Phase 11 | Pending |
| FEAT-01 | Phase 11 | Pending |
| FEAT-02 | Phase 11 | Pending |
| FEAT-03 | Phase 11 | Pending |
| BADGE-01 | Phase 11 | Pending |
| BADGE-02 | Phase 11 | Pending |
| FTR-01 | Phase 10 | Complete |
| FTR-02 | Phase 10 | Complete |
| RESP-01 | Phase 11 | Pending |
| RESP-02 | Phase 11 | Pending |

**Coverage:**
- v1.2 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-10*
*Last updated: 2026-03-10 after initial definition*
