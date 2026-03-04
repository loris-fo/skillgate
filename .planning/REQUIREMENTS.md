# Requirements: Skillgate

**Defined:** 2026-03-05
**Core Value:** Developers can trust-verify any Claude skill before installing it — with plain-English reasoning, not just a score.

## v1 Requirements

### Audit Engine

- [ ] **AUDIT-01**: Audit engine analyzes SKILL.md across 5 security categories (Hidden Logic, Data Access, Action Risk, Permission Scope, Override Attempts)
- [ ] **AUDIT-02**: Each category produces a severity score (safe/low/moderate/high/critical) with plain-English explanation
- [ ] **AUDIT-03**: Each category includes a by_design flag distinguishing intentional risk from malicious risk
- [ ] **AUDIT-04**: Audit engine produces utility analysis (what it does, use cases, who it's NOT for, trigger behavior, dependencies)
- [ ] **AUDIT-05**: Audit engine produces a final recommendation (install / install_with_caution / review_first / avoid)
- [ ] **AUDIT-06**: Audit results are cached by content hash (SHA-256 of SKILL.md content) — same content returns cached result without re-analysis

### Web App

- [ ] **WEB-01**: User can paste raw SKILL.md content into a textarea and trigger an audit
- [ ] **WEB-02**: User can enter a URL (GitHub, HTTP) to fetch and audit a remote SKILL.md
- [ ] **WEB-03**: Audit report displays per-category severity with expandable rows showing detailed reasoning
- [ ] **WEB-04**: Audit report displays utility analysis section
- [ ] **WEB-05**: Audit report displays final recommendation prominently
- [ ] **WEB-06**: Each audit has a permanent shareable URL (content-hash based)
- [ ] **WEB-07**: Audit page shows copyable markdown badge snippet for READMEs
- [ ] **WEB-08**: Homepage IS the audit interface — no separate landing page
- [ ] **WEB-09**: Dark terminal aesthetic UI with Tailwind CSS

### CLI

- [ ] **CLI-01**: `skillgate install <url>` audits a SKILL.md from URL and downloads it to the project on pass
- [ ] **CLI-02**: `skillgate scan` audits all SKILL.md files in the current project
- [ ] **CLI-03**: CLI exits with non-zero code when any skill scores High or Critical
- [ ] **CLI-04**: `--force` flag overrides High/Critical block
- [ ] **CLI-05**: `--json` flag outputs machine-readable JSON for CI/CD integration
- [ ] **CLI-06**: CLI accepts GitHub raw URLs, skills.sh registry slugs, any HTTP URL, and local file paths
- [ ] **CLI-07**: CLI displays colored terminal output with per-category breakdown

### Distribution

- [ ] **DIST-01**: SVG badge generated at `/api/badge/[slug].svg` reflecting audit result
- [ ] **DIST-02**: Dual URL scheme — content hash for integrity, human-readable slug for display
- [ ] **DIST-03**: Badge and audit URLs are permanent and publicly accessible (no auth)

### Infrastructure

- [ ] **INFRA-01**: pnpm workspace monorepo with packages: audit-engine, web, cli
- [ ] **INFRA-02**: Audit engine is a shared package imported by web API routes
- [ ] **INFRA-03**: CLI calls web API over HTTP (never imports audit engine directly)
- [ ] **INFRA-04**: Upstash Redis for audit result persistence and caching
- [ ] **INFRA-05**: TypeScript throughout with strict mode
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
| AUDIT-01 | — | Pending |
| AUDIT-02 | — | Pending |
| AUDIT-03 | — | Pending |
| AUDIT-04 | — | Pending |
| AUDIT-05 | — | Pending |
| AUDIT-06 | — | Pending |
| WEB-01 | — | Pending |
| WEB-02 | — | Pending |
| WEB-03 | — | Pending |
| WEB-04 | — | Pending |
| WEB-05 | — | Pending |
| WEB-06 | — | Pending |
| WEB-07 | — | Pending |
| WEB-08 | — | Pending |
| WEB-09 | — | Pending |
| CLI-01 | — | Pending |
| CLI-02 | — | Pending |
| CLI-03 | — | Pending |
| CLI-04 | — | Pending |
| CLI-05 | — | Pending |
| CLI-06 | — | Pending |
| CLI-07 | — | Pending |
| DIST-01 | — | Pending |
| DIST-02 | — | Pending |
| DIST-03 | — | Pending |
| INFRA-01 | — | Pending |
| INFRA-02 | — | Pending |
| INFRA-03 | — | Pending |
| INFRA-04 | — | Pending |
| INFRA-05 | — | Pending |
| INFRA-06 | — | Pending |

**Coverage:**
- v1 requirements: 31 total
- Mapped to phases: 0
- Unmapped: 31 ⚠️

---
*Requirements defined: 2026-03-05*
*Last updated: 2026-03-05 after initial definition*
