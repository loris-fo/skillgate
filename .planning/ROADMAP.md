# Roadmap: Skillgate

## Overview

Skillgate is built in dependency order: the audit engine is the foundation everything else imports or calls, so it ships first with security hardening baked in. API routes and KV infrastructure come second, enabling the web UI and CLI to be built against real endpoints. The web UI is a presentation layer over working API routes. The CLI is a thin HTTP client built last, when the API is deployed. npm publishing is separated from CLI development because a bad first publish is permanent — it deserves its own checklist.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Audit Engine** - Core audit logic, monorepo scaffolding, and shared infrastructure (completed 2026-03-05)
- [ ] **Phase 2: API Surface** - Next.js API routes, KV persistence, badge generation, and shareable URLs
- [ ] **Phase 3: Web UI** - Homepage audit interface and report permalink pages
- [ ] **Phase 4: CLI** - `skillgate` CLI with install, scan, and terminal output
- [ ] **Phase 5: Publish** - npm package configuration and first publish

## Phase Details

### Phase 1: Audit Engine
**Goal**: The audit engine package exists, runs correctly, and all security foundations are in place
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, AUDIT-01, AUDIT-02, AUDIT-03, AUDIT-04, AUDIT-05, AUDIT-06
**Success Criteria** (what must be TRUE):
  1. Running `pnpm audit-engine` against a SKILL.md file produces a structured result with all 5 security categories scored and explained in plain English
  2. Two calls with identical SKILL.md content return the cached result without making a second Claude API call (content-hash dedup works)
  3. A SKILL.md containing prompt injection attempts (instructions targeting the auditor) is handled without escaping the XML content delimiters
  4. Each category result includes a `by_design` flag correctly distinguishing intentional high-privilege behavior from malicious patterns
  5. The audit result includes a final recommendation of install / install_with_caution / review_first / avoid
**Plans:** 2/2 plans complete

Plans:
- [ ] 01-01-PLAN.md — Monorepo scaffold, types, schemas, and content hashing
- [ ] 01-02-PLAN.md — Cache, prompt, engine orchestration, and tests

### Phase 2: API Surface
**Goal**: The web API accepts audits, persists results to KV, and serves reports and badges via permanent URLs
**Depends on**: Phase 1
**Requirements**: WEB-06, DIST-01, DIST-02, DIST-03
**Success Criteria** (what must be TRUE):
  1. `POST /api/audit` accepts SKILL.md content, runs the audit (or returns cache hit), and returns the full structured result with a permanent URL
  2. `GET /api/report/[id]` returns audit data for both the content-hash and human-readable slug URL formats
  3. `GET /api/badge/[id].svg` returns a correctly colored SVG badge reflecting the audit recommendation
  4. Repeated identical requests within a session return the cached result without additional Claude API calls
**Plans:** 1/2 plans complete

Plans:
- [x] 02-01-PLAN.md — Bootstrap Next.js 15, shared lib modules (KV, slug, badge, rate-limit, types, errors)
- [ ] 02-02-PLAN.md — API route handlers (POST audit, GET report, GET badge) with integration tests

### Phase 3: Web UI
**Goal**: Developers can paste or link a SKILL.md on the homepage and get a full audit report with shareable URL and badge embed
**Depends on**: Phase 2
**Requirements**: WEB-01, WEB-02, WEB-03, WEB-04, WEB-05, WEB-07, WEB-08, WEB-09
**Success Criteria** (what must be TRUE):
  1. User can paste raw SKILL.md content into the homepage textarea, submit, and see the full audit report without navigating away from the homepage
  2. User can enter a GitHub URL or any HTTP URL into the homepage input and audit the remote skill without downloading it manually
  3. Audit report shows per-category severity with expandable rows — clicking a category reveals the plain-English reasoning
  4. Audit report page has a permanent URL the user can copy and share; loading that URL shows the same report
  5. Audit report page shows a copyable markdown snippet for adding the Skillgate badge to a README
**Plans:** 1/4 plans executed

Plans:
- [ ] 03-00-PLAN.md — Wave 0: test infrastructure (vitest jsdom, testing-library, test dirs)
- [ ] 03-01-PLAN.md — Tailwind v4 dark theme, fonts, severity helpers, shared report loader
- [ ] 03-02-PLAN.md — Homepage audit form with URL and content inputs
- [ ] 03-03-PLAN.md — Report page with hero, categories, utility, badge section, OG image

### Phase 4: CLI
**Goal**: Developers can run `skillgate install` and `skillgate scan` from the terminal with gating, force override, and JSON output
**Depends on**: Phase 2
**Requirements**: CLI-01, CLI-02, CLI-03, CLI-04, CLI-05, CLI-06, CLI-07
**Success Criteria** (what must be TRUE):
  1. `skillgate install <github-url>` audits the skill, downloads and places SKILL.md into the project on pass, and exits with code 0
  2. `skillgate install <url>` for a High or Critical skill exits with code 1 and does not place the file; running with `--force` places the file and exits 0
  3. `skillgate scan` audits all SKILL.md files in the current project and reports per-category results in colored terminal output
  4. `skillgate install --json <url>` outputs machine-readable JSON to stdout (for CI/CD use)
  5. CLI accepts GitHub raw URLs, skills.sh registry slugs, any HTTP URL, and local file paths as input
**Plans**: TBD

### Phase 5: Publish
**Goal**: The `skillgate` CLI is correctly packaged and published to npm as a production package
**Depends on**: Phase 4
**Requirements**: INFRA-06
**Success Criteria** (what must be TRUE):
  1. `npm install -g skillgate` installs the CLI and `skillgate --version` works on Node >= 18
  2. The published npm tarball contains no sensitive files (no .env, no workspace:* references, no source maps with credentials)
  3. `npx skillgate install <url>` works without global install — package is usable as a one-shot runner
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Audit Engine | 2/2 | Complete   | 2026-03-05 |
| 2. API Surface | 1/2 | In Progress | - |
| 3. Web UI | 1/4 | In Progress|  |
| 4. CLI | 0/? | Not started | - |
| 5. Publish | 0/? | Not started | - |
