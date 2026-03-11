# Skillgate

## What This Is

Skillgate is a security and utility auditor for AI agent skill files. It analyzes skills from Claude, Cursor, Windsurf, Cline, Aider, GitHub Copilot, and more across five security categories, producing explainable audit reports that distinguish "risky by design" from "maliciously risky." Available as a web app (skillgate.sh) with a polished marketing landing page, an npm CLI (`skillgate`), and an API that registries and IDEs can integrate with.

## Core Value

Developers can trust-verify any AI agent skill before installing it — with plain-English reasoning, not just a score.

## Requirements

### Validated

- ✓ Web audit interface (paste SKILL.md or URL, get full report) — v1.0
- ✓ CLI with `install` and `scan` commands — v1.0
- ✓ Audit engine powered by Claude (5 security categories + utility analysis) — v1.0
- ✓ Permanent shareable audit URLs (content-hash dedup + human-readable slugs) — v1.0
- ✓ Embeddable SVG badge generation for READMEs — v1.0
- ✓ CLI blocks on High/Critical by default (non-zero exit, --force override) — v1.0
- ✓ CLI fetches from GitHub URLs, skills.sh registry, any HTTP URL, or local files — v1.0
- ✓ CLI downloads and places SKILL.md into project on successful audit — v1.0
- ✓ Audit result caching by content hash (same content = same audit, no re-analysis) — v1.0
- ✓ Shared layout with header (wordmark + npm snippet + GitHub icon) and footer — v1.1
- ✓ Landing page with hero, feature sections, animated report mockup, badge snippet with copy button — v1.1
- ✓ Dedicated audit page with redesigned form UI, loading overlay, redirect to report — v1.1
- ✓ Report page with verdict pills, numeric X/10 score, collapsible category cards, badge, copy link — v1.1
- ✓ Light design system: #F0F9FF background, white cards with #BAE6FD borders, #06B6D4 accent — v1.1

- ✓ Dark purple/violet landing page with floating pill header, 120px hero, gradient orb — v1.2
- ✓ Two-column features + mock report demo, trust badges row — v1.2
- ✓ Dark UI reskin for audit and report pages — v1.2
- ✓ Unified severity color palette (#4ADE80/#E8A04C/#A855F7/#EF4444) — v1.2
- ✓ Mobile responsive layout across all landing sections — v1.2
- ✓ Mock reports with random CTA selection — v1.2

### Active

See REQUIREMENTS.md for v1.3 requirements.

## Current Milestone: v1.3 Multi-Agent Support

**Goal:** Expand SkillGate from Claude-only to a universal security gate for AI agent skills — supporting Claude, Cursor, Windsurf, Cline, Aider, GitHub Copilot, and generic markdown files.

**Target features:**
- Agent-agnostic messaging across all web pages, CLI, and README
- Audit engine prompt updated to analyze any agent's skill/rule files
- CLI `scan` auto-detects all known agent skill directories
- CLI `install` supports `--agent` flag for target agent selection
- File type detection from URL/content patterns

### Out of Scope

- User accounts / authentication — no auth friction, audits are public
- Team dashboards — v2 feature behind paid tier
- Paid tiers ($15-30/mo pro) — defer until traction
- IDE plugins — after CLI proves adoption
- Registry partnerships — after API stabilizes
- GitHub App — future integration
- Database — KV/file-based only for MVP
- Dark mode toggle — single light theme for now
- Mobile app — web-first approach

## Context

Shipped v1.0 (2026-03-06), v1.1 (2026-03-09), v1.2 (2026-03-11). Starting v1.3 (2026-03-11).
Web app: ~2,500 LOC TypeScript across 3 pages (landing, audit, report) + dark UI.
Tech stack: Next.js 15 (App Router), pnpm monorepo, Upstash Redis, Anthropic SDK, Tailwind v4.
118 tests across 20 test files, all passing.
AI coding agents are proliferating (Claude, Cursor, Windsurf, Cline, Copilot, Aider) — each with their own skill/rule file formats but no universal trust layer.
The badge system is the primary growth mechanic — skill authors add badges to READMEs.
Target metric: Position SkillGate as THE universal agent skill auditor.

## Constraints

- **Tech stack**: TypeScript throughout — Next.js 15 (App Router), Node.js CLI, Anthropic SDK
- **Monorepo**: pnpm workspaces (no build orchestrator)
- **AI model**: claude-sonnet-4-20250514 for audit analysis
- **Storage**: Upstash Redis for audit persistence — no database
- **Hosting**: Vercel for web/API
- **Packages**: npm as `skillgate`, domain skillgate.sh, GitHub loris-fo/skillgate
- **Styling**: Tailwind CSS v4, dark purple/violet landing + light sky-blue product pages
- **Quality**: Clean open-source code, contributor-friendly DX

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Audits always public, no auth | Zero friction = maximum adoption | ✓ Good — core UX strength |
| Content-hash dedup for audits | Same SKILL.md = same result, saves API costs | ✓ Good — works reliably |
| Dual URL scheme (hash + slug) | Hash for integrity, slug for human-readable sharing | ✓ Good — both formats work |
| CLI downloads + places SKILL.md on pass | Full install flow, not just audit-only gate | ✓ Good — complete workflow |
| pnpm workspaces (no Turborepo) | Lightweight, minimal tooling overhead | ✓ Good — fast builds, no issues |
| Badge system as growth engine | Skill authors self-distribute trust signal in READMEs | — Pending (needs launch data) |
| Server-side URL fetch for CORS bypass | Browser can't fetch cross-origin SKILL.md files | ✓ Good — transparent to user |
| DI factories for testability | createEngine/createCache enable full unit testing without live APIs | ✓ Good — 118 tests pass |
| CLI ESM-only with tsup bundling | Modern Node.js, tree-shakeable, clean bin entry | ✓ Good — npm-publishable |
| ora spinner via stderr | Keeps stdout clean for JSON piping in CI/CD | ✓ Good — composable CLI |
| Visual-only redesign (v1.1) | Keep API/data untouched, only change presentation layer | ✓ Good — zero regressions |
| Light sky-blue aesthetic replacing dark | Professional feel, differentiates from terminal-heavy dev tools | ✓ Good — clean aesthetic |
| Dedicated /audit route (v1.1) | Landing page is marketing, /audit is the tool | ✓ Good — better conversion funnel |
| Backward-compat CSS aliases | Existing components render without changes during migration | ✓ Good — smooth incremental migration |
| IntersectionObserver for scroll animations | No animation library dependency, lightweight | ✓ Good — performant |
| Inline SVG badges (shields.io style) | No external image dependencies on landing page | ✓ Good — fast loading |
| Numeric X/10 risk scores | safe=2, low=4, moderate=6, high=8, critical=10 | ✓ Good — clear severity mapping |

---
| Universal agent support (v1.3) | All agents use markdown/text instruction files with same risk categories | — Pending |

---
*Last updated: 2026-03-11 after v1.3 milestone start*
