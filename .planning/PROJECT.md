# Skillgate

## What This Is

Skillgate is a security and utility auditor for Claude AI skill files (SKILL.md). It analyzes skills across five security categories and produces explainable audit reports that distinguish "risky by design" from "maliciously risky." Available as a web app (skillgate.dev), an npm CLI (`skillgate`), and an API that registries and IDEs can integrate with.

## Core Value

Developers can trust-verify any Claude skill before installing it — with plain-English reasoning, not just a score.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Web audit interface (paste SKILL.md, get full report)
- [ ] CLI with `install` and `scan` commands
- [ ] Audit engine powered by Claude (5 security categories + utility analysis)
- [ ] Permanent shareable audit URLs (content-hash dedup + human-readable slugs)
- [ ] Embeddable SVG badge generation for READMEs
- [ ] CLI blocks on High/Critical by default (non-zero exit, --force override)
- [ ] CLI fetches from GitHub URLs, skills.sh registry, any HTTP URL, or local files
- [ ] CLI downloads and places SKILL.md into project on successful audit
- [ ] Audit result caching by content hash (same content = same audit, no re-analysis)
- [ ] Dark terminal aesthetic UI
- [ ] Landing page IS the audit interface (no separate marketing page)

### Out of Scope

- User accounts / authentication — no auth friction, audits are public
- Team dashboards — v2 feature behind paid tier
- Paid tiers ($15-30/mo pro) — defer until traction
- IDE plugins — after CLI proves adoption
- Registry partnerships — after API stabilizes
- GitHub App — future integration
- Database — KV/file-based only for MVP

## Context

- Claude Code's skill ecosystem (skills.sh, skill-forge) is growing fast with no trust layer
- ~15% of public AI skills contain malicious instructions per Gen Threat Labs research
- The badge system is the primary growth mechanic — skill authors add badges to READMEs
- Target metric: 10 skill authors add a Skillgate badge within 2 weeks of launch
- The audit prompt is already written and ready to wire in
- Web app and CLI share the same audit engine (API call to /api/audit)

## Constraints

- **Tech stack**: TypeScript throughout — Next.js 14 (App Router), Node.js CLI, Anthropic SDK
- **Monorepo**: pnpm workspaces (no build orchestrator)
- **AI model**: claude-sonnet-4-20250514 for audit analysis
- **Storage**: Vercel KV or Upstash Redis for audit persistence — no database
- **Hosting**: Vercel for web/API
- **Packages**: npm as `skillgate`, domain skillgate.dev, GitHub loris-fo/skillgate
- **Styling**: Tailwind CSS, dark terminal aesthetic
- **Quality**: Clean open-source code, contributor-friendly DX

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Audits always public, no auth | Zero friction = maximum adoption | — Pending |
| Content-hash dedup for audits | Same SKILL.md = same result, saves API costs | — Pending |
| Dual URL scheme (hash + slug) | Hash for integrity, slug for human-readable sharing | — Pending |
| CLI downloads + places SKILL.md on pass | Full install flow, not just audit-only gate | — Pending |
| Audit interface IS the homepage | Strongest conversion — no friction between landing and using | — Pending |
| pnpm workspaces (no Turborepo) | Lightweight, minimal tooling overhead | — Pending |
| Badge system as growth engine | Skill authors self-distribute trust signal in READMEs | — Pending |

---
*Last updated: 2026-03-05 after initialization*
