# Phase 5: Publish - Context

**Gathered:** 2026-03-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Correctly package and publish the `skillgate` CLI to npm as a production package. Users can `npm install -g skillgate` or `npx skillgate` to run it. The published tarball contains no sensitive files and no unresolvable workspace references. No new CLI features — this is packaging and publishing only.

</domain>

<decisions>
## Implementation Decisions

### Package Metadata
- License: MIT
- Package name: `skillgate` (unscoped)
- Author: `loris-fo`
- Keywords: claude, skill, security, audit, mcp, cli (for npm search discoverability)
- Repository, homepage, and bugs URLs pointing to GitHub repo
- engines: `{ "node": ">= 18" }` matching tsup build target

### workspace:* Dependency Fix
- Move `@skillgate/audit-engine` from dependencies to devDependencies
- CLI only uses audit-engine for type re-exports — tsup inlines types at build time, no runtime dependency needed
- Ensure `workspace:*` reference doesn't leak into published package

### Version Strategy
- First publish at version 0.1.0 (pre-stable signal, honest about maturity)
- Publish to `latest` dist-tag (no beta tag — 0.1.0 already signals early stage)
- `npx skillgate install <url>` works immediately without version qualifier

### Pre-publish Checklist
- Add `prepublishOnly` script to package.json: runs build + tests automatically before every publish
- Verify tarball with `npm pack --dry-run` before first publish: check no .env, source maps, or workspace:* refs leak
- Dedicated CLI README.md in packages/cli/ for the npm listing page (install instructions, usage examples, link to skillgate.sh)
- Manual first publish via `npm publish` — automate via GitHub Actions later once flow is validated

### Claude's Discretion
- Exact prepublishOnly script composition (which checks to chain)
- How to handle workspace:* in devDependencies during publish (publishConfig, pnpm pack behavior, or .npmignore)
- README.md content and structure for npm listing
- Any additional files field adjustments beyond existing `["dist"]`
- Whether to include CHANGELOG or keep minimal for first publish

</decisions>

<specifics>
## Specific Ideas

- A bad first publish is permanent — verify everything with dry-run before real publish
- The npm listing page is a first impression for developers discovering skillgate — the CLI README should be clear and concise with quick-start examples
- `npx skillgate install <url>` as a one-shot runner is a key adoption path — must work without global install

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/cli/package.json`: Already has `bin`, `files: ["dist"]`, `type: "module"`, `exports` fields configured
- `packages/cli/tsup.config.ts`: ESM-only build with node18 target, shebang banner, dts generation
- `packages/cli/src/index.ts`: Commander entry point with `--version` already wired to 0.1.0

### Established Patterns
- pnpm workspaces monorepo: root package.json has `pnpm -r build` and `pnpm -r test` scripts
- tsup builds to `dist/` with clean output and TypeScript declarations
- ESM-only: `"type": "module"` with `.js` extensions in imports

### Integration Points
- `@skillgate/audit-engine: workspace:*` in dependencies must be moved to devDependencies
- Root `package.json` has `"private": true` — only packages/cli gets published
- GitHub repo: `loris-fo/skillgate` — used for repository/homepage/bugs fields

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-publish*
*Context gathered: 2026-03-06*
