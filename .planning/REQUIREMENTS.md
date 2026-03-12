# Requirements: Skillgate

**Defined:** 2026-03-11
**Core Value:** Developers can trust-verify any AI agent skill before installing it — with plain-English reasoning, not just a score.

## v1.3 Requirements

Requirements for v1.3 Multi-Agent Support. Each maps to roadmap phases.

### Messaging & Copy

- [x] **COPY-01**: Landing page subtitle uses agent-agnostic language (no "Claude" references)
- [x] **COPY-02**: Audit page labels use "Skill file content" instead of "SKILL.md Content"
- [x] **COPY-03**: CLI help text uses "AI agent skills" instead of "Claude skills"
- [x] **COPY-04**: npm package description updated to "security auditor for AI agent skills"

### Audit Engine

- [x] **AUDIT-01**: Audit prompt analyzes any markdown/text instruction file without assuming Claude
- [x] **AUDIT-02**: Audit prompt includes agent-specific risk patterns (Cursor editor mods, Windsurf shell exec, Copilot safety overrides)

### CLI Scan

- [x] **SCAN-01**: `skillgate scan` auto-detects all known agent skill directories (.claude/skills/, .cursor/rules/, .cursorrules, .windsurfrules, .clinerules, .github/copilot-instructions.md)
- [x] **SCAN-02**: Scan output identifies which agent each file belongs to

### CLI Install

- [ ] **INST-01**: `skillgate install` accepts `--agent` flag to target specific agent directory
- [ ] **INST-02**: Default install behavior remains `.claude/skills/` when no flag provided

### Detection

- [ ] **DETECT-01**: File type/agent detection from URL patterns (e.g., `.cursorrules` in GitHub URL)
- [ ] **DETECT-02**: File type/agent detection from content patterns when pasted

## Previous Requirements

### v1.2 Landing Page Redesign (Complete)

18/18 requirements satisfied. See MILESTONES.md for details.

### v1.1 Web Redesign (Complete)

15/15 requirements satisfied.

### v1.0 MVP (Complete)

31/31 requirements satisfied.

## Future Requirements

### Landing Enhancements

- **LAND-01**: Scroll-triggered entrance animations on feature cards and mock report
- **LAND-02**: Animated typing effect in hero subtitle
- **LAND-03**: Interactive mock report (expand categories on click)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Agent selector dropdown in web form | Keep it simple — SkillGate auto-detects from content/URL |
| Agent-specific report pages | Same 5 security categories apply universally |
| YAML parsing for Aider config | Treat as text content, same risk analysis applies |
| New agent file formats beyond listed | Support the 6 major agents, generic markdown covers the rest |
| Badge changes | Badge system is agent-agnostic already |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| COPY-01 | Phase 12 | Complete |
| COPY-02 | Phase 12 | Complete |
| COPY-03 | Phase 12 | Complete |
| COPY-04 | Phase 12 | Complete |
| AUDIT-01 | Phase 13 | Complete |
| AUDIT-02 | Phase 13 | Complete |
| SCAN-01 | Phase 14 | Complete |
| SCAN-02 | Phase 14 | Complete |
| INST-01 | Phase 15 | Pending |
| INST-02 | Phase 15 | Pending |
| DETECT-01 | Phase 16 | Pending |
| DETECT-02 | Phase 16 | Pending |

**Coverage:**
- v1.3 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0

---
*Requirements defined: 2026-03-11*
*Last updated: 2026-03-11 after roadmap creation*
