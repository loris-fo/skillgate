# Roadmap: Skillgate

## Milestones

- **v1.0 MVP** - Phases 1-6 (shipped 2026-03-06)
- **v1.1 Web Redesign** - Phases 7-9 (shipped 2026-03-09)
- **v1.2 Landing Page Redesign** - Phases 10-11 (shipped 2026-03-11)
- **v1.3 Multi-Agent Support** - Phases 12-16 (in progress)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-6) - SHIPPED 2026-03-06</summary>

- [x] Phase 1: Audit Engine (2/2 plans) - completed 2026-03-05
- [x] Phase 2: API Surface (2/2 plans) - completed 2026-03-05
- [x] Phase 3: Web UI (5/5 plans) - completed 2026-03-05
- [x] Phase 4: CLI (3/3 plans) - completed 2026-03-05
- [x] Phase 5: Publish (1/1 plan) - completed 2026-03-05
- [x] Phase 6: Tech Debt Cleanup (2/2 plans) - completed 2026-03-06

</details>

<details>
<summary>v1.1 Web Redesign (Phases 7-9) - SHIPPED 2026-03-09</summary>

- [x] Phase 7: Design System & Layout (2/2 plans) - completed 2026-03-07
- [x] Phase 8: Landing Page (2/2 plans) - completed 2026-03-08
- [x] Phase 9: Audit & Report Pages (2/2 plans) - completed 2026-03-09

</details>

<details>
<summary>v1.2 Landing Page Redesign (Phases 10-11) - SHIPPED 2026-03-11</summary>

- [x] Phase 10: Dark Design Tokens + Layout Foundation (2/2 plans) - completed 2026-03-10
- [x] Phase 11: Landing Page Sections (3/3 plans) - completed 2026-03-10

</details>

### v1.3 Multi-Agent Support

- [x] **Phase 12: Agent-Agnostic Messaging** - Update all user-facing copy from Claude-specific to universal agent language (completed 2026-03-11)
- [x] **Phase 13: Universal Audit Engine** - Update audit prompt to analyze any agent's skill/rule files with agent-specific risk patterns (completed 2026-03-12)
- [x] **Phase 14: CLI Scan Multi-Directory** - Auto-detect and audit all known agent skill directories in a project (completed 2026-03-12)
- [ ] **Phase 15: CLI Install Agent Flag** - Support --agent flag to install skills into target agent's directory
- [ ] **Phase 16: File Type Detection** - Identify agent type from URL patterns and content analysis

## Phase Details

### Phase 12: Agent-Agnostic Messaging
**Goal**: Every user-facing surface reads as a universal agent skill auditor, not a Claude-specific tool
**Depends on**: Phase 11
**Requirements**: COPY-01, COPY-02, COPY-03, COPY-04
**Success Criteria** (what must be TRUE):
  1. Landing page hero/subtitle mentions "AI agent skills" with no Claude-specific language anywhere on the page
  2. Audit page form label reads "Skill file content" (not "SKILL.md Content") and placeholder text references multiple agents
  3. Running `skillgate --help` shows "AI agent skills" language throughout, with no Claude-specific references
  4. The npm package description (package.json) reads as a universal security auditor for AI agent skills
**Plans:** 2/2 plans complete
Plans:
- [x] 12-01-PLAN.md — Update web app and CLI copy to agent-agnostic language
- [ ] 12-02-PLAN.md — Gap closure: add multi-agent reference to audit form placeholder

### Phase 13: Universal Audit Engine
**Goal**: The audit engine produces accurate, agent-aware security analysis for any agent's skill/rule file
**Depends on**: Phase 12
**Requirements**: AUDIT-01, AUDIT-02
**Success Criteria** (what must be TRUE):
  1. Submitting a Cursor rules file (.cursorrules) produces a valid audit report with relevant findings -- not Claude-specific assumptions
  2. The audit identifies agent-specific risk patterns: Cursor editor modifications, Windsurf shell execution directives, Copilot safety override instructions
  3. Submitting a generic markdown instruction file (no agent indicators) produces a valid audit without defaulting to Claude-specific analysis
**Plans:** 1/1 plans complete
Plans:
- [ ] 13-01-PLAN.md — Universal prompt rewrite with agent-specific risk patterns and detected_agent schema field

### Phase 14: CLI Scan Multi-Directory
**Goal**: Developers can scan an entire project and get audits for every agent's skill files automatically
**Depends on**: Phase 13
**Requirements**: SCAN-01, SCAN-02
**Success Criteria** (what must be TRUE):
  1. Running `skillgate scan` in a project with multiple agent configs (e.g., .claude/skills/, .cursorrules, .github/copilot-instructions.md) discovers and audits all of them
  2. Scan output labels each file with its detected agent (e.g., "Claude: .claude/skills/deploy.md", "Cursor: .cursorrules")
  3. Running `skillgate scan` in a project with no agent files reports "no agent skill files found" with the list of directories checked
**Plans:** 1/1 plans complete
Plans:
- [ ] 14-01-PLAN.md — Create shared agent scan map and rewrite scan command with multi-agent discovery

### Phase 15: CLI Install Agent Flag
**Goal**: Developers can install skills into any supported agent's directory with a single command
**Depends on**: Phase 14
**Requirements**: INST-01, INST-02
**Success Criteria** (what must be TRUE):
  1. Running `skillgate install <url> --agent cursor` downloads and places the file into the Cursor rules directory
  2. Running `skillgate install <url>` without --agent flag places the file into .claude/skills/ (backward compatible default)
  3. Running `skillgate install <url> --agent <invalid>` shows an error listing supported agent values
**Plans:** 1 plan
Plans:
- [ ] 15-01-PLAN.md — Add --agent flag with install path resolution and validation

### Phase 16: File Type Detection
**Goal**: SkillGate automatically identifies which agent a skill file belongs to from its URL or content
**Depends on**: Phase 13
**Requirements**: DETECT-01, DETECT-02
**Success Criteria** (what must be TRUE):
  1. Submitting a GitHub URL containing ".cursorrules" in the path results in the report identifying it as a Cursor rules file
  2. Pasting content with Windsurf-specific directives (e.g., "windsurf:" prefixed instructions) results in agent detection without requiring a URL
  3. Detection results surface in the audit report metadata (agent field populated)
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 12 > 13 > 14 > 15 > 16

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Audit Engine | v1.0 | 2/2 | Complete | 2026-03-05 |
| 2. API Surface | v1.0 | 2/2 | Complete | 2026-03-05 |
| 3. Web UI | v1.0 | 5/5 | Complete | 2026-03-05 |
| 4. CLI | v1.0 | 3/3 | Complete | 2026-03-05 |
| 5. Publish | v1.0 | 1/1 | Complete | 2026-03-05 |
| 6. Tech Debt Cleanup | v1.0 | 2/2 | Complete | 2026-03-06 |
| 7. Design System & Layout | v1.1 | 2/2 | Complete | 2026-03-07 |
| 8. Landing Page | v1.1 | 2/2 | Complete | 2026-03-08 |
| 9. Audit & Report Pages | v1.1 | 2/2 | Complete | 2026-03-09 |
| 10. Dark Design Tokens + Layout Foundation | v1.2 | 2/2 | Complete | 2026-03-10 |
| 11. Landing Page Sections | v1.2 | 3/3 | Complete | 2026-03-10 |
| 12. Agent-Agnostic Messaging | 2/2 | Complete    | 2026-03-11 | 2026-03-11 |
| 13. Universal Audit Engine | 1/1 | Complete    | 2026-03-12 | - |
| 14. CLI Scan Multi-Directory | 1/1 | Complete    | 2026-03-12 | - |
| 15. CLI Install Agent Flag | v1.3 | 0/1 | Not started | - |
| 16. File Type Detection | v1.3 | 0/? | Not started | - |
