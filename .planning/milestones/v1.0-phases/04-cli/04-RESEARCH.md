# Phase 4: CLI - Research

**Researched:** 2026-03-05
**Domain:** Node.js CLI tooling (Commander.js, terminal UI, HTTP client)
**Confidence:** HIGH

## Summary

The CLI package (`packages/cli`) needs to provide two commands -- `install` and `scan` -- that call the existing web API over HTTP. The project already uses pnpm workspaces, TypeScript strict mode, tsup for bundling, and Zod for validation, so the CLI follows established patterns. The key libraries are Commander.js 14 for command parsing, ora 9 for spinners, chalk 5 for colors, and cli-table3 for scan output tables.

The main technical challenge is that ora 9 and chalk 5 are pure ESM packages. Since the project uses `"type": "module"` and tsup for building, this is handled naturally -- tsup bundles ESM dependencies into the output. The CLI bin entry must point to the built output with a proper shebang line.

**Primary recommendation:** Build as ESM package with tsup bundling all dependencies, Commander.js 14 for CLI framework, native `fetch` for HTTP (Node 18+ built-in), and the existing `AuditResponse`/`AuditResult` types from `@skillgate/audit-engine` for response validation.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Compact summary by default: verdict + overall score + one-line per category (5 lines)
- Emoji + color for verdict display: checkmark Install / warning Review First / cross Avoid
- Animated spinner (ora-style) with "Auditing skill..." while API call is in progress
- Always append full web report link: "Full report: https://skillgate.dev/report/{slug}"
- --json flag outputs machine-readable JSON to stdout (no color, no spinner, no emoji)
- Default placement: .claude/ directory in project root
- Configurable via --output/-o flag to override target directory
- File naming: skill name based (extracted from SKILL.md content)
- Gating: High/Critical shows verdict + hint message, exit 1
- --force flag overrides gating, exit 0
- skills.sh registry slug resolution: try https://skills.sh/registry/{slug}/SKILL.md
- Input types: GitHub raw URLs, skills.sh slugs, any HTTP URL, local file paths
- Scan default discovery: .claude/ and .claude/skills/ in project root
- Configurable via --path flag for alternative directories
- Scan output: table format (File | Verdict | Score), pass/fail count
- Parallel scan execution with concurrency limit
- Exit code: exit 1 if ANY skill scores High/Critical
- --no-fail flag makes scan always exit 0
- Default API base URL: https://skillgate.dev/api
- Override via SKILLGATE_API_URL environment variable
- Request timeout: 60 seconds
- Retry on network failure: 2-3 retries with backoff
- --version and --help commands (Commander.js handles this)
- Standard exit codes: 0 = success, 1 = failure/blocked

### Claude's Discretion
- Commander.js command structure and subcommand pattern
- Spinner library choice (ora or alternative)
- Exact color palette for terminal output (chalk or similar)
- Concurrency limit for parallel scan
- Retry backoff strategy
- How to detect if input is URL vs local path vs registry slug
- Table rendering library for scan output
- How to extract skill name for file naming

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CLI-01 | `skillgate install <url>` audits a SKILL.md from URL and downloads it to the project on pass | Commander.js subcommand pattern, fetch-based API client, file write with extracted skill name |
| CLI-02 | `skillgate scan` audits all SKILL.md files in the current project | glob discovery in .claude/ directories, parallel API calls with concurrency limit |
| CLI-03 | CLI exits with non-zero code when any skill scores High or Critical | Gating logic using `overall_score` from AuditResult, process.exit(1) |
| CLI-04 | `--force` flag overrides High/Critical block | Commander.js option flag, skip gating check when present |
| CLI-05 | `--json` flag outputs machine-readable JSON for CI/CD | Conditional output: suppress spinner/color, JSON.stringify to stdout |
| CLI-06 | CLI accepts GitHub raw URLs, skills.sh registry slugs, any HTTP URL, and local file paths | Input resolver module with URL detection, slug expansion, local file read |
| CLI-07 | CLI displays colored terminal output with per-category breakdown | chalk for colors, compact summary format with emoji verdicts |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| commander | ^14.0.0 | CLI framework (commands, options, help) | De facto Node.js CLI framework, 117K+ dependents, built-in TypeScript types |
| ora | ^9.3.0 | Terminal spinner during API calls | Standard spinner library, 39K+ dependents, clean CI behavior |
| chalk | ^5.6.0 | Terminal color/styling | Zero-dependency, de facto standard for terminal colors |
| cli-table3 | ^0.6.5 | Table rendering for scan output | Supports ANSI colors in cells, column spanning, word wrap |
| zod | ^3.24.0 | API response validation | Already in monorepo (audit-engine), consistent validation approach |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| glob | ^11.0.0 | File discovery for scan command | Finding SKILL.md files in .claude/ directories |
| @skillgate/audit-engine | workspace:* | Shared types (AuditResult, Score, Verdict) | Type imports only -- never import engine logic (INFRA-03) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| ora | nanospinner | Lighter but less features; ora is more established |
| cli-table3 | columnify | Simpler but no borders/styling; table format is a locked decision |
| glob | fast-glob | Similar API; glob is simpler for this use case |
| native fetch | got/axios | Unnecessary dependency; Node 18+ fetch is sufficient |

**Installation:**
```bash
cd packages/cli && pnpm add commander ora chalk cli-table3 zod glob
pnpm add -D @types/cli-table3 tsup typescript vitest @types/node
```

Note: `@skillgate/audit-engine` as `workspace:*` dependency for type imports only.

## Architecture Patterns

### Recommended Project Structure
```
packages/cli/
  src/
    index.ts              # CLI entry point (Commander setup, bin shebang)
    commands/
      install.ts          # install command handler
      scan.ts             # scan command handler
    lib/
      api-client.ts       # HTTP client for POST /api/audit
      input-resolver.ts   # Detect input type, resolve to content or URL
      output.ts           # Terminal output formatting (color, table, JSON)
      gating.ts           # Score gating logic (High/Critical = blocked)
      retry.ts            # Fetch with retry + exponential backoff
    types.ts              # CLI-specific types, re-export from audit-engine
  tests/
    input-resolver.test.ts
    gating.test.ts
    api-client.test.ts
    output.test.ts
  package.json
  tsconfig.json
  tsup.config.ts
  vitest.config.ts
```

### Pattern 1: Commander.js Subcommand Structure
**What:** Top-level program with `install` and `scan` as subcommands
**When to use:** Always -- this is the locked CLI structure
**Example:**
```typescript
#!/usr/bin/env node
import { Command } from "commander";
import { installCommand } from "./commands/install.js";
import { scanCommand } from "./commands/scan.js";

const program = new Command();

program
  .name("skillgate")
  .description("Audit Claude skills for security risks")
  .version("0.1.0");

program
  .command("install")
  .description("Audit and install a SKILL.md")
  .argument("<source>", "URL, registry slug, or local file path")
  .option("-o, --output <dir>", "target directory", ".claude")
  .option("--force", "override High/Critical block")
  .option("--json", "output machine-readable JSON")
  .action(installCommand);

program
  .command("scan")
  .description("Audit all SKILL.md files in the project")
  .option("--path <dir>", "directory to scan")
  .option("--no-fail", "always exit 0 (reporting only)")
  .option("--json", "output machine-readable JSON")
  .action(scanCommand);

program.parse();
```

### Pattern 2: Input Resolution Chain
**What:** Detect input type and resolve to either `{ content }` or `{ url }` for the API
**When to use:** `install` command source argument
**Example:**
```typescript
type ResolvedInput =
  | { type: "content"; content: string; name: string }
  | { type: "url"; url: string };

function resolveInput(source: string): ResolvedInput {
  // 1. Local file path: starts with ./ or / or contains path separators, or file exists
  if (isLocalPath(source)) {
    const content = fs.readFileSync(source, "utf-8");
    return { type: "content", content, name: path.basename(source) };
  }
  // 2. Full URL: starts with http:// or https://
  if (/^https?:\/\//i.test(source)) {
    return { type: "url", url: source };
  }
  // 3. Registry slug: anything else -> expand to skills.sh URL
  return { type: "url", url: `https://skills.sh/registry/${source}/SKILL.md` };
}
```

### Pattern 3: Conditional Output (Human vs JSON)
**What:** Suppress spinner/color when --json is set, output raw JSON
**When to use:** All output paths
**Example:**
```typescript
function createOutputHandler(jsonMode: boolean) {
  return {
    startSpinner(text: string) {
      if (jsonMode) return { stop() {}, fail() {} };
      return ora(text).start();
    },
    printResult(response: AuditResponse) {
      if (jsonMode) {
        process.stdout.write(JSON.stringify(response, null, 2) + "\n");
        return;
      }
      // Colored terminal output
      printColoredResult(response);
    },
  };
}
```

### Pattern 4: Retry with Exponential Backoff
**What:** Retry failed fetch calls 2-3 times before giving up
**When to use:** All API calls
**Example:**
```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(60_000),
      });
      return response;
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      const delay = Math.min(1000 * 2 ** attempt, 5000);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Unreachable");
}
```

### Anti-Patterns to Avoid
- **Importing audit-engine logic:** CLI calls the web API only (INFRA-03). Import types, never import `auditSkill` or `createEngine`
- **Writing to stdout in non-JSON mode during spinner:** ora captures stdout; use `spinner.text` for updates, not `console.log`
- **Mixing stderr and stdout:** JSON goes to stdout only; spinner/progress can go to stderr for clean piping
- **Hardcoding API URL:** Always use SKILLGATE_API_URL env var with fallback to default

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CLI argument parsing | Custom arg parser | Commander.js 14 | Handles help, version, validation, subcommands |
| Terminal colors | ANSI escape codes | chalk 5 | Cross-platform, terminal detection, nesting |
| Spinner animation | setInterval + cursor | ora 9 | Handles CI detection, cleanup, fail states |
| Table formatting | String padding | cli-table3 | ANSI-aware column width, truncation, borders |
| File globbing | fs.readdir + filter | glob | Handles nested dirs, patterns, symlinks |
| Retry logic | -- | Custom (simple enough) | Only 15 lines, no library needed |

**Key insight:** CLI UX libraries handle edge cases (non-TTY detection, window resize, ANSI stripping in pipes) that are painful to get right manually.

## Common Pitfalls

### Pitfall 1: Pure ESM Imports in CJS Context
**What goes wrong:** ora 9 and chalk 5 are ESM-only. If the CLI output is CJS, `require()` fails at runtime.
**Why it happens:** tsup can output CJS but ESM-only deps can't be required.
**How to avoid:** Build the CLI as ESM format only. Set `"type": "module"` in package.json. The bin entry runs via Node with ESM support. tsup config: `format: ["esm"]`.
**Warning signs:** `ERR_REQUIRE_ESM` errors when running the built CLI.

### Pitfall 2: Spinner Output in CI/Non-TTY
**What goes wrong:** Spinner frames pollute CI logs with garbage characters.
**Why it happens:** CI environments don't support terminal escape sequences.
**How to avoid:** ora automatically detects non-TTY and falls back to static text. When --json is set, skip the spinner entirely. For CI, recommend --json flag.
**Warning signs:** CI logs showing spinner frame characters.

### Pitfall 3: Exit Code Not Set on Gating
**What goes wrong:** CLI reports "blocked" but exits 0, breaking CI pipelines.
**Why it happens:** Commander.js catches errors and may exit 0. Need explicit `process.exit(1)`.
**How to avoid:** After all output is flushed, call `process.exit(1)` explicitly for gated results. Don't throw errors (Commander catches them with different exit codes).
**Warning signs:** CI pipeline passes despite High/Critical audit.

### Pitfall 4: JSON Output Mixed with Spinner/Color
**What goes wrong:** JSON output contains ANSI escape sequences or spinner artifacts.
**Why it happens:** Spinner writes to stdout, interleaving with JSON.
**How to avoid:** When --json is set: no spinner, no chalk, no table. Only `JSON.stringify` to stdout. Use a flag check at the top of every output path.
**Warning signs:** `jq` fails to parse CLI output in --json mode.

### Pitfall 5: Concurrent Scan Hitting Rate Limit
**What goes wrong:** Scanning 30+ files triggers API rate limit (30/hr per IP).
**Why it happens:** All files sent concurrently overwhelm the rate limiter.
**How to avoid:** Limit concurrency to 5 parallel requests. Log a warning if file count exceeds 25 ("Warning: scanning {n} files may approach the API rate limit of 30/hour").
**Warning signs:** 429 errors during scan of large projects.

### Pitfall 6: Shebang Line Missing or Wrong
**What goes wrong:** `npx skillgate` fails with "cannot execute" or syntax errors.
**Why it happens:** Built file lacks `#!/usr/bin/env node` at the top.
**How to avoid:** tsup `banner` option: `{ js: '#!/usr/bin/env node' }`. Also set file as executable in package.json bin field.
**Warning signs:** Permission denied or syntax error when running globally.

## Code Examples

### tsup.config.ts for CLI Package
```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  clean: true,
  dts: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
});
```

### package.json bin and type Fields
```json
{
  "name": "skillgate",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "skillgate": "./dist/index.js"
  },
  "files": ["dist"],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  }
}
```

### API Client Pattern
```typescript
import type { AuditResponse, ErrorResponse } from "./types.js";

const DEFAULT_API_URL = "https://skillgate.dev/api";

function getApiUrl(): string {
  return process.env.SKILLGATE_API_URL || DEFAULT_API_URL;
}

export async function auditViaApi(
  body: { content: string } | { url: string },
): Promise<AuditResponse> {
  const response = await fetchWithRetry(`${getApiUrl()}/audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = (await response.json()) as ErrorResponse;
    throw new Error(error.error.message);
  }

  return response.json() as Promise<AuditResponse>;
}
```

### Gating Logic
```typescript
import type { Score } from "@skillgate/audit-engine";

const BLOCKED_SCORES: Score[] = ["high", "critical"];

export function isBlocked(score: Score): boolean {
  return BLOCKED_SCORES.includes(score);
}
```

### Colored Terminal Output
```typescript
import chalk from "chalk";
import type { AuditResponse } from "./types.js";

const VERDICT_DISPLAY: Record<string, string> = {
  install: chalk.green("Install"),
  install_with_caution: chalk.yellow("Install with Caution"),
  review_first: chalk.hex("#FF8800")("Review First"),
  avoid: chalk.red("Avoid"),
};

const SCORE_COLOR: Record<string, (s: string) => string> = {
  safe: chalk.green,
  low: chalk.cyan,
  moderate: chalk.yellow,
  high: chalk.hex("#FF8800"),
  critical: chalk.red,
};

export function printCompactResult(response: AuditResponse): void {
  const { result, meta } = response;
  const verdict = VERDICT_DISPLAY[result.recommendation.verdict] ?? result.recommendation.verdict;

  console.log(`\n${verdict}  Score: ${SCORE_COLOR[result.overall_score]?.(result.overall_score) ?? result.overall_score}`);

  for (const [key, cat] of Object.entries(result.categories)) {
    const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    const color = SCORE_COLOR[cat.score] ?? ((s: string) => s);
    console.log(`  ${color(cat.score.padEnd(10))} ${label}`);
  }

  console.log(`\nFull report: https://skillgate.dev/report/${meta.slug}`);
}
```

### Skill Name Extraction for File Naming
```typescript
// Reuse same logic as apps/web/src/lib/slug.ts
export function extractSkillName(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  const name = match?.[1]?.trim() || "unnamed-skill";
  // Sanitize for filesystem: lowercase, replace spaces/special chars with hyphens
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| chalk 4 (CJS) | chalk 5 (ESM-only) | 2022 | Must use ESM or bundle with tsup |
| ora 5 (CJS) | ora 9 (ESM-only) | 2021+ | Must use ESM or bundle with tsup |
| node-fetch | Native fetch | Node 18 (2022) | No external HTTP dependency needed |
| commander 9 | commander 14 | 2024-2025 | Better TypeScript types, same API patterns |
| yargs | commander | -- | Both viable; commander simpler for subcommand CLIs |

**Deprecated/outdated:**
- `request`/`node-fetch`: Use native `fetch` (Node 18+)
- chalk 4: Still works but chalk 5 is current for ESM projects
- `inquirer` for prompts: Not needed here (no interactive prompts required)

## Open Questions

1. **skills.sh Registry URL Format**
   - What we know: Decision says `https://skills.sh/registry/{slug}/SKILL.md`
   - What's unclear: Exact URL pattern (skills.sh may not exist yet)
   - Recommendation: Implement the URL pattern as decided; fail gracefully with clear error if registry is unreachable. This can be updated when the registry launches.

2. **Scan File Discovery Pattern**
   - What we know: Look in `.claude/` and `.claude/skills/` for SKILL.md files
   - What's unclear: Whether to match `*.md` or only `SKILL.md` or `*.md` files
   - Recommendation: Match `**/*.md` in the target directories (skills can have various names like `commit.md`, `review-pr.md`). The API determines if content is a valid SKILL.md.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 3.2+ |
| Config file | packages/cli/vitest.config.ts (Wave 0) |
| Quick run command | `pnpm --filter skillgate test` |
| Full suite command | `pnpm test` (runs all packages) |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CLI-01 | install command audits and downloads on pass | integration | `pnpm --filter skillgate exec vitest run tests/commands/install.test.ts -t "downloads on pass"` | Wave 0 |
| CLI-02 | scan command audits all SKILL.md files | integration | `pnpm --filter skillgate exec vitest run tests/commands/scan.test.ts` | Wave 0 |
| CLI-03 | exit 1 on High/Critical score | unit | `pnpm --filter skillgate exec vitest run tests/gating.test.ts` | Wave 0 |
| CLI-04 | --force overrides gating | unit | `pnpm --filter skillgate exec vitest run tests/gating.test.ts -t "force"` | Wave 0 |
| CLI-05 | --json outputs machine-readable JSON | unit | `pnpm --filter skillgate exec vitest run tests/output.test.ts -t "json"` | Wave 0 |
| CLI-06 | accepts URLs, slugs, local paths | unit | `pnpm --filter skillgate exec vitest run tests/input-resolver.test.ts` | Wave 0 |
| CLI-07 | colored terminal output with categories | unit | `pnpm --filter skillgate exec vitest run tests/output.test.ts -t "colored"` | Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm --filter skillgate test`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `packages/cli/vitest.config.ts` -- vitest configuration
- [ ] `packages/cli/tests/input-resolver.test.ts` -- covers CLI-06
- [ ] `packages/cli/tests/gating.test.ts` -- covers CLI-03, CLI-04
- [ ] `packages/cli/tests/output.test.ts` -- covers CLI-05, CLI-07
- [ ] `packages/cli/tests/api-client.test.ts` -- covers API client retry logic
- [ ] `packages/cli/tests/commands/install.test.ts` -- covers CLI-01
- [ ] `packages/cli/tests/commands/scan.test.ts` -- covers CLI-02
- [ ] Framework install: `pnpm --filter skillgate add -D vitest` -- vitest already in monorepo

## Sources

### Primary (HIGH confidence)
- [commander npm](https://www.npmjs.com/package/commander) - v14.0.3, subcommand API, TypeScript support
- [ora npm](https://www.npmjs.com/package/ora) - v9.3.0, ESM-only, spinner API
- [chalk npm](https://www.npmjs.com/package/chalk) - v5.6.2, ESM-only, zero dependencies
- [cli-table3 npm](https://www.npmjs.com/package/cli-table3) - v0.6.5, ANSI-compatible tables

### Secondary (MEDIUM confidence)
- [tsup for TypeScript CLI packages](https://blog.logrocket.com/tsup/) - tsup config patterns for bin entries
- [Commander.js TypeScript CLI guide](https://blog.logrocket.com/building-typescript-cli-node-js-commander/) - subcommand patterns

### Tertiary (LOW confidence)
- skills.sh registry URL format -- assumed from CONTEXT.md decisions, not yet verified

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries verified on npm with current versions
- Architecture: HIGH - follows established monorepo patterns already in use
- Pitfalls: HIGH - ESM/CJS issues well-documented, spinner/CI behavior verified
- Input resolution: MEDIUM - skills.sh registry format is assumed

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (stable domain, slow-moving libraries)
