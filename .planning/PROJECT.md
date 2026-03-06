# Skillgate

## What This Is

Skillgate is a security and utility auditor for Claude AI skill files (SKILL.md). It analyzes skills across five security categories and produces explainable audit reports that distinguish "risky by design" from "maliciously risky." Available as a web app (skillgate.sh), an npm CLI (`skillgate`), and an API that registries and IDEs can integrate with.

## Core Value

Developers can trust-verify any Claude skill before installing it — with plain-English reasoning, not just a score.

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
- ✓ Dark terminal aesthetic UI — v1.0
- ✓ Landing page IS the audit interface (no separate marketing page) — v1.0

### Active

- [ ] Shared layout with header (wordmark + npm snippet + GitHub icon) and footer (GitHub · npm · skillgate.sh · MIT License)
- [ ] Landing page with hero, feature sections, animated report mockup, badge snippet with copy button
- [ ] Audit page with redesigned form UI, loading state, redirect to report on completion
- [ ] Report page with redesigned verdict, categories, utility analysis, badge, copy link, "Audit another" link
- [ ] Light design system: #F0F9FF background, white cards with #BAE6FD borders, #06B6D4 accent

### Out of Scope

- User accounts / authentication — no auth friction, audits are public
- Team dashboards — v2 feature behind paid tier
- Paid tiers ($15-30/mo pro) — defer until traction
- IDE plugins — after CLI proves adoption
- Registry partnerships — after API stabilizes
- GitHub App — future integration
- Database — KV/file-based only for MVP

## Context

Shipped v1.0 with 4,797 LOC TypeScript across 146 files.
Tech stack: Next.js 15 (App Router), pnpm monorepo, Upstash Redis, Anthropic SDK, Tailwind v4.
118 tests across 20 test files, all passing.
Claude Code's skill ecosystem (skills.sh, skill-forge) is growing fast with no trust layer.
The badge system is the primary growth mechanic — skill authors add badges to READMEs.
Target metric: 10 skill authors add a Skillgate badge within 2 weeks of launch.

## Constraints

- **Tech stack**: TypeScript throughout — Next.js 15 (App Router), Node.js CLI, Anthropic SDK
- **Monorepo**: pnpm workspaces (no build orchestrator)
- **AI model**: claude-sonnet-4-20250514 for audit analysis
- **Storage**: Upstash Redis for audit persistence — no database
- **Hosting**: Vercel for web/API
- **Packages**: npm as `skillgate`, domain skillgate.sh, GitHub loris-fo/skillgate
- **Styling**: Tailwind CSS v4, light sky-blue aesthetic (v1.1 redesign)
- **Quality**: Clean open-source code, contributor-friendly DX

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Audits always public, no auth | Zero friction = maximum adoption | ✓ Good — core UX strength |
| Content-hash dedup for audits | Same SKILL.md = same result, saves API costs | ✓ Good — works reliably |
| Dual URL scheme (hash + slug) | Hash for integrity, slug for human-readable sharing | ✓ Good — both formats work |
| CLI downloads + places SKILL.md on pass | Full install flow, not just audit-only gate | ✓ Good — complete workflow |
| Audit interface IS the homepage | Strongest conversion — no friction between landing and using | ✓ Good — zero-click barrier |
| pnpm workspaces (no Turborepo) | Lightweight, minimal tooling overhead | ✓ Good — fast builds, no issues |
| Badge system as growth engine | Skill authors self-distribute trust signal in READMEs | — Pending (needs launch data) |
| Server-side URL fetch for CORS bypass | Browser can't fetch cross-origin SKILL.md files | ✓ Good — transparent to user |
| DI factories for testability | createEngine/createCache enable full unit testing without live APIs | ✓ Good — 118 tests pass |
| CLI ESM-only with tsup bundling | Modern Node.js, tree-shakeable, clean bin entry | ✓ Good — npm-publishable |
| ora spinner via stderr | Keeps stdout clean for JSON piping in CI/CD | ✓ Good — composable CLI |

---
## Current Milestone: v1.1 Web Redesign

**Goal:** Redesign the web app with a light, professional aesthetic — new shared layout, landing page, audit page, and report page — while keeping all API routes, data logic, and audit engine untouched.

**Target features:**
- Shared layout component (header + footer) used across all pages
- Landing page (/) with hero, features, animated report mockup, badge copy
- Audit page (/audit) with redesigned form wired to existing logic
- Report page (/report/[slug]) with redesigned verdict/category display

*Last updated: 2026-03-06 after v1.1 milestone start*
