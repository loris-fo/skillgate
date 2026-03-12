# Phase 14: CLI Scan Multi-Directory - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

`skillgate scan` auto-discovers and audits all known agent skill files in a project, labeling each result with its detected agent. Supports Claude, Cursor, Windsurf, Copilot, Cline, and Aider. Requirements: SCAN-01, SCAN-02.

</domain>

<decisions>
## Implementation Decisions

### Discovery Strategy
- Unified scan map: hard-coded agent → paths/patterns mapping (e.g., claude → .claude/skills/**/*.md, cursor → .cursorrules + .cursor/rules/, copilot → .github/copilot-instructions.md)
- Scan map defined in packages/shared/ for reuse by future detection features (Phase 16)
- Scan both single dotfiles (.cursorrules, .windsurfrules, .clinerules) AND agent directories (.cursor/rules/, etc.) if they exist
- Glob patterns: `**/*.md` and `**/*.txt` for directory-based scanning

### Output Labeling
- Results grouped by agent with section headers showing agent name + path hint (e.g., "Claude (.claude/skills/)")
- Only show sections for agents where files were found — skip empty agents
- Agent label determined by scan map (path-based) with fallback to audit engine's detected_agent for files from --path
- JSON output (--json): flat array with an "agent" field per result — easier for piping/filtering

### No-Files Behavior
- When no files found: display "no agent skill files found" + list of directories checked + suggestion ("Run skillgate install <url> to add your first skill")
- Exit code 0 (success) when no files found — not an error condition
- JSON no-files output: `{ results: [], directories_checked: [...], message: "..." }` object with metadata

### Path Flag Changes
- `--path` now adds to auto-discovery (scans custom dir IN ADDITION to all agent dirs) — behavior change from current "replace" mode
- New `--agent <name>` filter flag to scan only a specific agent's files (e.g., --agent cursor)
- Single --path value only (no repeat flags)
- `--agent` and `--path` are independent: --agent filters auto-discovery, --path results use audit engine detection for labeling

### Claude's Discretion
- Exact scan map entries per agent (which directories/files to include)
- Section header styling and formatting details
- Deduplication strategy for overlapping paths
- How to handle the --path behavioral change (breaking change notice or silent)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `scan.ts` (packages/cli/src/commands/scan.ts): Current scan implementation with glob, concurrency limiting (5 max), deduplication, table/JSON output
- `output.ts` (packages/cli/src/lib/output.ts): Table formatting with cli-table3, chalk colors, JSON mode
- `api-client.ts` (packages/cli/src/lib/api-client.ts): auditViaApi() with retry logic
- `types.ts` (packages/audit-engine/src/types.ts): DetectedAgent type already defined (claude/cursor/windsurf/copilot/cline/aider/unknown)
- `gating.ts` (packages/cli/src/lib/gating.ts): isBlocked() for exit code determination

### Established Patterns
- Commander.js for CLI commands with .option() and .action()
- glob("**/*.md", { cwd }) for file discovery
- Concurrency-limited parallel API calls (max 5)
- Rate limit warning at 25+ files
- ora spinner via stderr, stdout clean for piping
- Zod validation on API responses

### Integration Points
- `index.ts`: Add --agent option to scan command definition
- `scan.ts`: Replace defaultDirs array with shared scan map, add grouping logic
- New shared module: packages/shared/src/agent-map.ts (or similar) for the agent → paths mapping

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 14-cli-scan-multi-directory*
*Context gathered: 2026-03-12*
