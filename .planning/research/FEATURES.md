# Feature Landscape

**Domain:** Security audit / code scanning / AI trust verification
**Project:** Skillgate — SKILL.md auditor for Claude AI skills
**Researched:** 2026-03-05
**Confidence note:** Web search tools unavailable. Analysis draws from training-data knowledge of Snyk, Socket.dev, npm audit, VirusTotal, Dependabot, Semgrep, and OSV Scanner (HIGH confidence for established product patterns; MEDIUM confidence for AI-specific trust tooling which is newer territory).

---

## Comparators Analyzed

| Product | What it audits | Key mechanic |
|---------|---------------|--------------|
| **Snyk** | npm/PyPI/Go packages, container images, IaC | CVE database + fix PRs |
| **Socket.dev** | npm/PyPI packages | Behavioral supply-chain analysis (not just CVEs) |
| **npm audit** | package.json dependency tree | CVE lookup, JSON output |
| **GitHub Dependabot** | Dependency manifests | Automated PR-based fix workflow |
| **VirusTotal** | Files, URLs, hashes | Multi-engine consensus scoring |
| **Semgrep** | Source code static analysis | Pattern-matching rules |
| **OSV Scanner** | Open-source dependencies | Google's OSV database |

Skillgate's closest conceptual peer is **Socket.dev** (behavioral analysis of untrusted third-party artifacts) rather than Snyk (CVE matching). The differentiator space is about *explainability* and *AI-specific threat modeling*.

---

## Table Stakes

Features users expect. Missing = product feels incomplete or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Severity scoring (Critical/High/Medium/Low/Pass) | Every security tool uses this language; developers scan for red/yellow/green | Low | 5-level scale; maps to audit engine's risk output |
| Per-category breakdown | Snyk/Socket both surface "what failed and why" — not just a total score | Medium | Skillgate has 5 categories already; need individual scores |
| Plain-English explanations for each finding | Socket's "this package installs a postinstall script" model; users need to understand *why* something is risky | Medium | Core differentiator too, but now expected in AI-era tooling |
| CLI with non-zero exit on failure | `npm audit --audit-level=high` pattern — scripts and CI pipelines rely on exit codes | Low | Already in requirements; --force override is standard |
| Machine-readable output (JSON) | CI pipelines, IDE integrations, and automated workflows require structured output | Low | `skillgate scan --json` flag; trivial to add |
| Shareable result URL | VirusTotal and Socket both produce permanent report URLs for sharing in issues/PRs | Low | Already in requirements; content-hash dedup is the right model |
| Badge for READMEs | Shield.io, Snyk badge, Socket badge — README badges are de facto trust signals in OSS | Low | Already in requirements; SVG generation |
| Scan from URL (not just paste) | npm audit, Snyk, Socket all support direct URL/registry input; friction reducer | Low | Already in requirements; GitHub URL + HTTP URL |
| Result caching / dedup | VirusTotal's hash-based dedup is universal expectation; same file = same result | Low | Already in requirements; content-hash key in KV |
| Clear recommendation (install / don't install) | VirusTotal's "X of 72 engines flagged this" final verdict; users need an actionable answer | Low | Final recommendation is core to the audit engine |
| Audit history / permalink stability | Users link to reports in issues, PRs, commits; links must not rot | Low | Permanent URLs via content-hash |

---

## Differentiators

Features that set Skillgate apart. Not universally expected, but create competitive advantage.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| "Risky by design" vs "maliciously risky" distinction | No existing tool distinguishes *intentional high-privilege tools* from *malicious tools*; a `file-editor` skill legitimately needs file write access | High | This is the core AI-specific insight; hard to copy without domain expertise |
| Utility analysis alongside security | Security-only tools produce false positives; a skill that does nothing useful but requests no access is suspicious in a different way | Medium | Utility scoring = "is this skill even worth installing?" |
| AI-threat category taxonomy (5 categories) | Hidden Logic, Data Access, Action Risk, Permission Scope, Override Attempts are AI-native threat vectors; not covered by any existing scanner | High | The audit engine's differentiated IP |
| Prompt injection / override detection | SKILL.md files can contain hidden instructions to manipulate the AI; this attack surface doesn't exist in npm packages | High | Novel attack surface; no competing tool addresses this |
| Homepage IS the audit interface | Most security tools (Snyk, Socket) require account creation before scanning; zero-friction public scanning is rare | Low | Product/UX decision already made; execution matters |
| Natural language audit reasoning (not just pass/fail) | Snyk gives you a CVE ID. Socket gives you a category. Skillgate explains what the skill *does* in plain English | Medium | Powered by Claude; the LLM-as-auditor model is the differentiator |
| Badge as growth / viral distribution mechanic | Socket has badges, but skill authors adding Skillgate badges creates a network effect in the Claude ecosystem specifically | Low | The go-to-market flywheel; unique to this niche |
| CLI that installs on pass (not just gates) | `npm install` has no security gate; Snyk is a separate step. Skillgate CLI is `skillgate install <url>` = audit + install in one command | Medium | Full install flow, not audit-only. Reduces developer friction. |
| AI skill ecosystem specificity | General tools can't audit SKILL.md — they don't understand the semantic threat model of AI instructions | High | Moat: requires domain knowledge of how Claude skills work |

---

## Anti-Features

Features to explicitly NOT build in MVP.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| User authentication / accounts | Auth friction kills adoption for a tool whose primary value is zero-friction public auditing; Snyk requires signup and it's the #1 complaint | Keep all audits public; add accounts in v2 only if team features demand it |
| Team dashboards / org views | Premature complexity before finding individual user traction; requires auth, database, permission model | Defer to v2 paid tier |
| Automated fix suggestions | SKILL.md fixes are semantic, not syntactic — there's no `npm audit fix` equivalent; suggesting "remove line 12" is meaningless without understanding intent | Explain the risk, let the author decide; fixes require human judgment |
| CVE / vulnerability database integration | SKILL.md doesn't import packages; CVE matching is irrelevant to this threat model | Stay focused on behavioral/semantic analysis |
| Continuous monitoring / alerts | Requires auth, webhooks, email infrastructure; high complexity for zero-day-one value | Defer; if a skill changes its content-hash, a new audit is auto-triggered on next scan |
| Rate limiting UI / quota warnings in web app | Creates anxiety and friction for explorers; at MVP scale, not needed | Add backend rate limiting silently; surface only if abuse becomes real |
| IDE plugins | High surface area, platform-specific, slow to build; CLI covers the workflow | Post-CLI, after adoption is proven |
| Registry webhooks / integrations | Requires API key management, registry partnerships; premature | After API stabilizes |
| Bulk / batch scanning UI | Adds complexity; power users get this via CLI scripting | CLI handles bulk; web stays single-scan |
| Comparison between two skills | Interesting but niche; doubles UI complexity | Not needed for trust decisions |
| "Audit this for me" request queue | Async model adds latency UX complexity; Claude API is fast enough for sync | Keep synchronous |

---

## Feature Dependencies

```
Content-hash computation
  → Audit result caching (requires hash as cache key)
  → Permanent shareable URLs (hash IS the URL key)
  → Badge generation (badge links to audit URL)

Audit engine (5 categories + utility)
  → Per-category scores (engine output)
  → Plain-English explanation (engine output)
  → Final recommendation (engine output)
  → Severity score (derived from category scores)

Shareable URL
  → Badge (badge links to the shareable URL)
  → CLI share output (CLI prints the URL after scan)

CLI audit command
  → CLI install command (install = audit + conditional download)
  → CI/CD integration (depends on non-zero exit code)
  → JSON output (same audit result, different formatter)

Web interface
  → URL/GitHub input (requires fetch-from-URL logic shared with CLI)
  → Paste input (simplest path; no network dependency)
```

---

## MVP Recommendation

Prioritize these for v1 launch:

1. **Audit engine** — the 5-category analysis with plain-English output and final recommendation. Everything else is presentation layer.
2. **Web interface (paste + URL input)** — zero-friction entry point; homepage = audit interface.
3. **Permanent shareable URLs** — content-hash dedup; without this, the badge mechanic doesn't work.
4. **Badge generation** — the primary growth mechanic; needed at launch.
5. **CLI `scan` command with exit codes + JSON** — CI/CD integration for developer adoption.
6. **CLI `install` command** — full workflow; audit + download on pass.
7. **Per-category breakdown with explanations** — the key differentiator from competitors; must ship with MVP.

Defer for v2:

- **Team dashboards / org views** — wait for auth demand signal.
- **IDE plugins** — wait for CLI traction.
- **Continuous monitoring** — wait for users who have installed many skills.
- **GitHub App** — wait for API stabilization.

---

## Competitive Positioning Map

```
                        Behavioral Analysis
                               |
                          Socket.dev
                               |
CVE-only --------------------[X]-------------------- Semantic/AI-native
(Snyk, npm audit,              |                      (Skillgate)
 Dependabot)                   |
                       VirusTotal (multi-engine)
                               |
                        Score-only (no explanation)
```

Skillgate occupies an uncontested position: semantic/AI-native + behavioral analysis + plain-English explanation. No existing tool competes directly in this space (MEDIUM confidence — AI-native audit tools are emerging rapidly; this could change).

---

## Sources

- Snyk feature set: training data (HIGH confidence for established features as of Aug 2025)
- Socket.dev behavioral analysis model: training data (HIGH confidence)
- npm audit CLI patterns: training data (HIGH confidence)
- VirusTotal UX patterns: training data (HIGH confidence)
- AI skill / SKILL.md threat taxonomy: PROJECT.md (project-specific, not publicly documented elsewhere)
- AI-specific attack surfaces (prompt injection, override attempts): training data on AI security research (MEDIUM confidence — rapidly evolving space)
- Competitive landscape for AI-native skill auditors: training data (LOW confidence — this is a new niche, competitors may have emerged after Aug 2025)
