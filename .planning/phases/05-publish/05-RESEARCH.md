# Phase 5: Publish - Research

**Researched:** 2026-03-06
**Domain:** npm package publishing from pnpm monorepo
**Confidence:** HIGH

## Summary

Phase 5 packages and publishes the `skillgate` CLI to npm. The CLI is already built and tested in `packages/cli/` with tsup producing a single ESM bundle at `dist/index.js`. The primary challenges are: (1) removing the `workspace:*` dependency on `@skillgate/audit-engine` from runtime dependencies since it is not published to npm, (2) adding proper package metadata for npm discoverability, (3) creating a CLI-specific README for the npm listing page, and (4) adding a `prepublishOnly` script to prevent accidental bad publishes.

The existing setup is already well-positioned: `files: ["dist"]` whitelists only the build output, tsup inlines all type imports so no runtime dependency on audit-engine exists, and the shebang banner is correctly configured. The `pnpm pack --dry-run` output confirms a clean tarball (only `dist/index.js`, `dist/index.d.ts`, `package.json`). The main work is metadata completion and dependency cleanup.

**Primary recommendation:** Move `@skillgate/audit-engine` to devDependencies, add npm metadata fields (description, license, repository, keywords, engines), create a CLI README.md, add `prepublishOnly` script, verify with `pnpm pack --dry-run`, then publish with `pnpm publish --no-git-checks`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- License: MIT
- Package name: `skillgate` (unscoped)
- Author: `loris-fo`
- Keywords: claude, skill, security, audit, mcp, cli
- Repository, homepage, and bugs URLs pointing to GitHub repo
- engines: `{ "node": ">= 18" }` matching tsup build target
- Move `@skillgate/audit-engine` from dependencies to devDependencies
- CLI only uses audit-engine for type re-exports -- tsup inlines types at build time, no runtime dependency needed
- First publish at version 0.1.0, `latest` dist-tag
- `npx skillgate install <url>` works immediately without version qualifier
- Add `prepublishOnly` script: runs build + tests before every publish
- Verify tarball with `npm pack --dry-run` before first publish
- Dedicated CLI README.md in packages/cli/ for npm listing page
- Manual first publish via `npm publish`

### Claude's Discretion
- Exact prepublishOnly script composition (which checks to chain)
- How to handle workspace:* in devDependencies during publish (publishConfig, pnpm pack behavior, or .npmignore)
- README.md content and structure for npm listing
- Any additional files field adjustments beyond existing `["dist"]`
- Whether to include CHANGELOG or keep minimal for first publish

### Deferred Ideas (OUT OF SCOPE)
None
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-06 | npm-publishable CLI package as `skillgate` | All research findings below enable this -- metadata, dependency fix, prepublishOnly, README, and publish workflow |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| pnpm | (workspace tool) | Publishing from monorepo | Already used; handles workspace:* resolution during publish |
| tsup | ^8.5.0 | Build step in prepublishOnly | Already configured; produces clean ESM bundle |
| vitest | ^3.2.0 | Test step in prepublishOnly | Already configured with tests |

### Supporting
No new libraries needed. This phase is pure configuration and metadata.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| pnpm publish | npm publish | pnpm publish handles workspace:* resolution automatically; npm publish does not |
| Manual publish | changesets | Overkill for single-package first publish; consider for v2+ |

**Installation:**
```bash
# No new packages needed
```

## Architecture Patterns

### Current Package Structure (packages/cli/)
```
packages/cli/
├── dist/              # Build output (whitelisted in files field)
│   ├── index.js       # ESM bundle with shebang
│   └── index.d.ts     # TypeScript declarations
├── src/               # Source (excluded from tarball by files whitelist)
├── tests/             # Tests (excluded from tarball)
├── package.json       # Needs metadata additions
├── tsup.config.ts     # Build config (excluded)
└── README.md          # NEW: npm listing page content
```

### Pattern 1: pnpm workspace:* Resolution During Publish
**What:** pnpm automatically replaces `workspace:*` with actual semver versions when running `pnpm publish` or `pnpm pack`. For devDependencies, workspace references are removed from the published package.json entirely since they are not installed by consumers.
**When to use:** Always when publishing from pnpm monorepo.
**Key detail:** Since `@skillgate/audit-engine` is NOT published to npm, it MUST be in devDependencies. If left in dependencies, consumers would get an install error because the package does not exist on the npm registry. Moving to devDependencies is safe because tsup bundles everything at build time -- the built `dist/index.js` has zero references to `@skillgate/audit-engine`.

### Pattern 2: files Whitelist for Tarball Security
**What:** The `files` field in package.json acts as a whitelist. Only listed paths (plus `package.json`, `README.md`, `LICENSE`, and `CHANGELOG.md` which are always included) end up in the tarball.
**Current state:** `files: ["dist"]` -- already correctly configured.
**Verification:** `pnpm pack --dry-run` confirms only `dist/index.js`, `dist/index.d.ts`, and `package.json` are included.
**Note:** Once we add `README.md` to `packages/cli/`, it will be auto-included (npm always includes README).

### Pattern 3: prepublishOnly Lifecycle Script
**What:** npm/pnpm runs `prepublishOnly` before `publish` and `pack`. Use it to enforce build + test before every publish.
**Recommended script:**
```json
"prepublishOnly": "pnpm run build && pnpm run test"
```
**Why this composition:** Build must come first (tests may depend on compiled output). No need for typecheck since tsup already type-checks during build. No lint step since none exists in the project.

### Anti-Patterns to Avoid
- **Publishing with workspace:* in dependencies for unpublished packages:** Consumer install will fail with "package not found". Always move to devDependencies if the dependency is workspace-only.
- **Using npm publish instead of pnpm publish:** npm does not understand workspace:* protocol. Always use `pnpm publish` from a pnpm workspace.
- **Forgetting --no-git-checks:** pnpm publish requires a clean git working tree by default. Use `--no-git-checks` if publishing with uncommitted changes (common during first publish setup).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| workspace:* resolution | Custom build script to rewrite package.json | `pnpm publish` (auto-resolves) | pnpm handles this natively and correctly |
| Tarball content control | .npmignore with complex exclusion rules | `files` whitelist in package.json | Whitelist is safer than blacklist; already configured |
| Pre-publish validation | Manual checklist | `prepublishOnly` lifecycle script | Automated, cannot be forgotten |

## Common Pitfalls

### Pitfall 1: workspace:* in dependencies for unpublished packages
**What goes wrong:** `npm install skillgate` fails because `@skillgate/audit-engine` does not exist on npm.
**Why it happens:** The workspace protocol is resolved by pnpm to a real version, but the package itself is never published.
**How to avoid:** Move to devDependencies. Verified: `dist/index.js` contains zero references to `@skillgate/audit-engine`.
**Warning signs:** `pnpm pack --dry-run` shows the dependency in the published package.json.

### Pitfall 2: Missing README in tarball
**What goes wrong:** npm listing page shows nothing -- no description, no install instructions.
**Why it happens:** No `README.md` exists in `packages/cli/` (only root README, which is not included for sub-packages).
**How to avoid:** Create `packages/cli/README.md` with install instructions and usage examples.
**Warning signs:** `pnpm pack --dry-run` output does not list README.md.

### Pitfall 3: Duplicate package name conflict
**What goes wrong:** `npm publish` fails because the name is taken.
**Why it happens:** Root `package.json` also has `"name": "skillgate"`. However, root has `"private": true` so it will never be published.
**How to avoid:** Only publish from `packages/cli/` directory. Root is already private.
**Warning signs:** Running publish from root directory instead of packages/cli.

### Pitfall 4: npx not finding the binary
**What goes wrong:** `npx skillgate install <url>` does not work.
**Why it happens:** Missing or incorrect `bin` field in package.json.
**How to avoid:** Already configured: `"bin": { "skillgate": "./dist/index.js" }`. The shebang `#!/usr/bin/env node` is added by tsup. Verified in built output.
**Warning signs:** `npx skillgate --version` fails after publish.

### Pitfall 5: Version mismatch between package.json and Commander
**What goes wrong:** `skillgate --version` shows different version than `npm view skillgate version`.
**Why it happens:** Version in `src/index.ts` is hardcoded as `"0.1.0"` and package.json is also `"0.1.0"` -- currently in sync but could drift.
**How to avoid:** For v0.1.0 first publish, they match. For future versions, consider reading version from package.json dynamically. Not critical for this phase.

## Code Examples

### package.json After Modifications
```json
{
  "name": "skillgate",
  "version": "0.1.0",
  "description": "Audit Claude skills for security risks before installing them",
  "type": "module",
  "license": "MIT",
  "author": "loris-fo",
  "repository": {
    "type": "git",
    "url": "https://github.com/loris-fo/skillgate.git",
    "directory": "packages/cli"
  },
  "homepage": "https://skillgate.dev",
  "bugs": "https://github.com/loris-fo/skillgate/issues",
  "keywords": ["claude", "skill", "security", "audit", "mcp", "cli"],
  "engines": {
    "node": ">= 18"
  },
  "bin": {
    "skillgate": "./dist/index.js"
  },
  "files": ["dist"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "dev": "tsup --watch",
    "prepublishOnly": "pnpm run build && pnpm run test"
  },
  "dependencies": {
    "chalk": "^5.6.0",
    "cli-table3": "^0.6.5",
    "commander": "^14.0.0",
    "glob": "^11.0.0",
    "ora": "^9.3.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@skillgate/audit-engine": "workspace:*",
    "@types/node": "^25.3.3",
    "tsup": "^8.5.0",
    "typescript": "^5.7.0",
    "vitest": "^3.2.0"
  }
}
```

### Publish Workflow
```bash
# 1. Verify tarball contents (from packages/cli/)
cd packages/cli
pnpm pack --dry-run

# 2. Verify no workspace:* in dependencies
pnpm pack && tar -tf skillgate-0.1.0.tgz | head -20
tar -xf skillgate-0.1.0.tgz package/package.json -O | grep -i workspace
# Should return nothing

# 3. Publish
pnpm publish --access public --no-git-checks

# 4. Verify
npm view skillgate
npx skillgate --version
```

### README.md Structure for npm Listing
```markdown
# skillgate

Audit Claude skills for security risks before installing them.

## Install

npm install -g skillgate

## Quick Start

# Audit and install a skill from URL
skillgate install https://github.com/user/repo/blob/main/.claude/skills/my-skill/SKILL.md

# Scan all skills in current project
skillgate scan

## Usage

### Install Command
skillgate install <source> [options]

Options:
  -o, --output <dir>  target directory (default: ".claude")
  --force             override High/Critical block
  --json              output machine-readable JSON

### Scan Command
skillgate scan [options]

Options:
  --path <dir>   directory to scan
  --no-fail      always exit 0 (reporting only)
  --json         output machine-readable JSON

## One-Shot Usage (no install)
npx skillgate install <url>

## Links
- Website: https://skillgate.dev
- GitHub: https://github.com/loris-fo/skillgate

## License
MIT
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| .npmignore blacklist | `files` whitelist | Long-standing best practice | Safer -- only listed paths included |
| npm publish from monorepo | pnpm publish with workspace protocol | pnpm v7+ | Automatic workspace:* resolution |
| Manual pre-publish checks | prepublishOnly lifecycle script | npm v5+ | Cannot forget to build/test |

**Deprecated/outdated:**
- `prepublish` script: Runs on both `npm install` and `npm publish` (confusing). Use `prepublishOnly` instead.

## Open Questions

1. **Homepage URL**
   - What we know: CONTEXT says "pointing to GitHub repo" but also mentions "link to skillgate.dev" in README
   - Recommendation: Use `https://skillgate.dev` for homepage, GitHub URL for repository field. If skillgate.dev is not live yet, use GitHub repo URL for homepage.

2. **CHANGELOG inclusion**
   - What we know: CONTEXT gives discretion on this
   - Recommendation: Skip for first publish. A CHANGELOG at v0.1.0 adds no value. Add when there are actual version bumps to document.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest ^3.2.0 |
| Config file | `packages/cli/vitest.config.ts` |
| Quick run command | `cd packages/cli && pnpm test` |
| Full suite command | `pnpm -r test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-06a | workspace:* not in published dependencies | smoke | `cd packages/cli && pnpm pack --dry-run` + inspect output | N/A (manual verification) |
| INFRA-06b | `skillgate --version` returns 0.1.0 | smoke | `node packages/cli/dist/index.js --version` | N/A (manual) |
| INFRA-06c | tarball contains no sensitive files | smoke | `cd packages/cli && pnpm pack --dry-run` | N/A (manual) |
| INFRA-06d | prepublishOnly runs build+test | unit | `cd packages/cli && pnpm run prepublishOnly` | N/A (script test) |
| INFRA-06e | npx skillgate works | smoke | Post-publish manual test | N/A (post-publish) |

### Sampling Rate
- **Per task commit:** `cd packages/cli && pnpm test`
- **Per wave merge:** `pnpm -r test`
- **Phase gate:** `pnpm pack --dry-run` output verified clean + `pnpm -r test` green

### Wave 0 Gaps
None -- existing test infrastructure covers all phase requirements. This phase is primarily configuration changes, not code. Validation is done through `pnpm pack --dry-run` inspection rather than automated tests.

## Sources

### Primary (HIGH confidence)
- pnpm workspace docs (https://pnpm.io/workspaces) -- workspace:* resolution behavior during publish
- Direct verification via `pnpm pack --dry-run` on the actual project -- tarball contents confirmed
- Direct verification of `dist/index.js` -- no audit-engine references in built output

### Secondary (MEDIUM confidence)
- npm docs on `files` field and package inclusion rules -- always-included files (README, LICENSE, package.json)
- npm docs on lifecycle scripts -- prepublishOnly behavior

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries, verified existing setup
- Architecture: HIGH -- verified current state with dry-run, confirmed dependency analysis
- Pitfalls: HIGH -- each pitfall verified against actual project state

**Research date:** 2026-03-06
**Valid until:** 2026-04-06 (stable domain, npm publishing conventions change rarely)
