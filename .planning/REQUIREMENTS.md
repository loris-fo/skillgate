# Requirements: Skillgate

**Defined:** 2026-03-06
**Core Value:** Developers can trust-verify any Claude skill before installing it — with plain-English reasoning, not just a score.

## v1.1 Requirements

Requirements for web redesign. Each maps to roadmap phases.

### Layout

- [ ] **LAYOUT-01**: All pages wrapped in shared layout component with header and footer
- [ ] **LAYOUT-02**: Header shows "skillgate" wordmark linking to /, copyable `npm i -g skillgate` pill, and GitHub icon linking to repo
- [ ] **LAYOUT-03**: Footer shows single row: GitHub · npm · skillgate.sh · MIT License links in #94A3B8

### Design System

- [ ] **DS-01**: Background #F0F9FF, cards #FFFFFF with #BAE6FD border and subtle box shadow
- [ ] **DS-02**: Accent #06B6D4, headings #0C1A1A, body text #475569
- [ ] **DS-03**: Verdict colors: Safe/Install #22C55E, Critical/Avoid #EF4444, High #F97316

### Landing

- [ ] **LAND-01**: Hero section with headline, subtext, and "Audit a skill →" CTA linking to /audit
- [ ] **LAND-02**: Feature sections explaining what Skillgate audits
- [ ] **LAND-03**: Animated report mockup rows fade+slide in sequentially on scroll
- [ ] **LAND-04**: Badge markdown snippet with working copy button

### Audit

- [ ] **AUDIT-01**: Redesigned audit form UI matching new design system
- [ ] **AUDIT-02**: Existing form submission, loading state, and redirect to /report/[slug] remain functional

### Report

- [ ] **REPORT-01**: Redesigned verdict, category cards, and utility analysis display
- [ ] **REPORT-02**: All existing data (badge, copy link, shareable URL) remains functional
- [ ] **REPORT-03**: "← Audit another skill" link to /audit below report content

## Future Requirements

None — redesign is self-contained.

## Out of Scope

| Feature | Reason |
|---------|--------|
| API route changes | Redesign is visual only — all routes stay as-is |
| Audit engine changes | No logic changes, only presentation |
| CLI changes | CLI is unaffected by web redesign |
| Dark mode toggle | Single light theme for v1.1 |
| Authentication/accounts | Deferred to v2 |
| New page types | Only redesigning existing 3 pages |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| LAYOUT-01 | — | Pending |
| LAYOUT-02 | — | Pending |
| LAYOUT-03 | — | Pending |
| DS-01 | — | Pending |
| DS-02 | — | Pending |
| DS-03 | — | Pending |
| LAND-01 | — | Pending |
| LAND-02 | — | Pending |
| LAND-03 | — | Pending |
| LAND-04 | — | Pending |
| AUDIT-01 | — | Pending |
| AUDIT-02 | — | Pending |
| REPORT-01 | — | Pending |
| REPORT-02 | — | Pending |
| REPORT-03 | — | Pending |

**Coverage:**
- v1.1 requirements: 15 total
- Mapped to phases: 0
- Unmapped: 15

---
*Requirements defined: 2026-03-06*
*Last updated: 2026-03-06 after initial definition*
