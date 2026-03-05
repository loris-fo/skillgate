# Requirements: Skillgate

**Defined:** 2026-03-05
**Core Value:** Developers can trust-verify any Claude skill before installing it — with plain-English reasoning, not just a score.

## v1 Requirements

### Audit Engine

- [x] **AUDIT-01**: Audit engine analyzes SKILL.md across 5 security categories (Hidden Logic, Data Access, Action Risk, Permission Scope, Override Attempts)
- [x] **AUDIT-02**: Each category produces a severity score (safe/low/moderate/high/critical) with plain-English explanation
- [x] **AUDIT-03**: Each category includes a by_design flag distinguishing intentional risk from malicious risk
- [x] **AUDIT-04**: Audit engine produces utility analysis (what it does, use cases, who it's NOT for, trigger behavior, dependencies)
- [x] **AUDIT-05**: Audit engine produces a final recommendation (install / install_with_caution / review_first / avoid)
- [x] **AUDIT-06**: Audit results are cached by content hash (SHA-256 of SKILL.md content) — same content returns cached result without re-analysis

### Web App

- [x] **WEB-01**: User can paste raw SKILL.md content into a textarea and trigger an audit
- [x] **WEB-02**: User can enter a URL (GitHub, HTTP) to fetch and audit a remote SKILL.md
- [ ] **WEB-03**: Audit report displays per-category severity with expandable rows showing detailed reasoning
- [ ] **WEB-04**: Audit report displays utility analysis section
- [ ] **WEB-05**: Audit report displays final recommendation prominently
- [x] **WEB-06**: Each audit has a permanent shareable URL (content-hash based)
- [ ] **WEB-07**: Audit page shows copyable markdown badge snippet for READMEs
- [x] **WEB-08**: Homepage IS the audit interface — no separate landing page
- [x] **WEB-09**: Dark terminal aesthetic UI with Tailwind CSS

### CLI

- [ ] **CLI-01**: `skillgate install <url>` audits a SKILL.md from URL and downloads it to the project on pass
- [ ] **CLI-02**: `skillgate scan` audits all SKILL.md files in the current project
- [ ] **CLI-03**: CLI exits with non-zero code when any skill scores High or Critical
- [ ] **CLI-04**: `--force` flag overrides High/Critical block
- [ ] **CLI-05**: `--json` flag outputs machine-readable JSON for CI/CD integration
- [ ] **CLI-06**: CLI accepts GitHub raw URLs, skills.sh registry slugs, any HTTP URL, and local file paths
- [ ] **CLI-07**: CLI displays colored terminal output with per-category breakdown

### Distribution

- [x] **DIST-01**: SVG badge generated at `/api/badge/[slug].svg` reflecting audit result
- [x] **DIST-02**: Dual URL scheme — content hash for integrity, human-readable slug for display
- [x] **DIST-03**: Badge and audit URLs are permanent and publicly accessible (no auth)

### Infrastructure

- [x] **INFRA-01**: pnpm workspace monorepo with packages: audit-engine, web, cli
- [x] **INFRA-02**: Audit engine is a shared package imported by web API routes
- [x] **INFRA-03**: CLI calls web API over HTTP (never imports audit engine directly)
- [x] **INFRA-04**: Upstash Redis for audit result persistence and caching
- [x] **INFRA-05**: TypeScript throughout with strict mode
- [ ] **INFRA-06**: npm-publishable CLI package as `skillgate`

## v2 Requirements

### Accounts & Teams

- **TEAM-01**: User can create account and log in
- **TEAM-02**: Team dashboard showing all audited skills
- **TEAM-03**: Private audit results (not publicly accessible)

### Integrations

- **INTG-01**: GitHub App for PR-based audit comments
- **INTG-02**: GitHub Action for CI/CD pipeline integration
- **INTG-03**: IDE plugin (VS Code extension)

### Monetization

- **PAID-01**: Pro tier ($15-30/mo) for private audits + team features
- **PAID-02**: API rate limit tiers (free vs. pro)

## Out of Scope

| Feature | Reason |
|---------|--------|
| User authentication / accounts | Zero-friction public auditing is the core value prop; auth adds friction |
| Automated fix suggestions | SKILL.md fixes are semantic, not syntactic — requires human judgment |
| CVE / vulnerability database | SKILL.md doesn't import packages; CVE matching is irrelevant |
| Continuous monitoring / alerts | Requires auth, webhooks, email infra; premature complexity |
| IDE plugins | High surface area; CLI covers the workflow for now |
| Bulk scanning web UI | Power users get bulk via CLI scripting |
| Comparison between two skills | Niche; doubles UI complexity |
| Database (Postgres, etc.) | KV/file-based only for MVP |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUDIT-01 | Phase 1 | Complete |
| AUDIT-02 | Phase 1 | Complete |
| AUDIT-03 | Phase 1 | Complete |
| AUDIT-04 | Phase 1 | Complete |
| AUDIT-05 | Phase 1 | Complete |
| AUDIT-06 | Phase 1 | Complete |
| WEB-01 | Phase 3 | Complete |
| WEB-02 | Phase 3 | Complete |
| WEB-03 | Phase 3 | Pending |
| WEB-04 | Phase 3 | Pending |
| WEB-05 | Phase 3 | Pending |
| WEB-06 | Phase 2 | Complete |
| WEB-07 | Phase 3 | Pending |
| WEB-08 | Phase 3 | Complete |
| WEB-09 | Phase 3 | Complete |
| CLI-01 | Phase 4 | Pending |
| CLI-02 | Phase 4 | Pending |
| CLI-03 | Phase 4 | Pending |
| CLI-04 | Phase 4 | Pending |
| CLI-05 | Phase 4 | Pending |
| CLI-06 | Phase 4 | Pending |
| CLI-07 | Phase 4 | Pending |
| DIST-01 | Phase 2 | Complete |
| DIST-02 | Phase 2 | Complete |
| DIST-03 | Phase 2 | Complete |
| INFRA-01 | Phase 1 | Complete |
| INFRA-02 | Phase 1 | Complete |
| INFRA-03 | Phase 1 | Complete |
| INFRA-04 | Phase 1 | Complete |
| INFRA-05 | Phase 1 | Complete |
| INFRA-06 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 31 total
- Mapped to phases: 31
- Unmapped: 0

---
*Requirements defined: 2026-03-05*
*Last updated: 2026-03-05 after roadmap creation*
