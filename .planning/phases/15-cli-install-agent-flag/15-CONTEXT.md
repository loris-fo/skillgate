# Phase 15: CLI Install Agent Flag - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Add `--agent` flag to `skillgate install` so developers can install skills into any supported agent's directory. Default (no flag) installs to `.claude/skills/` (backward compatible). Requirements: INST-01, INST-02.

</domain>

<decisions>
## Implementation Decisions

### Installable Agents
- Only directory-based agents are installable: Claude (.claude/skills/) and Cursor (.cursor/rules/)
- Derive installable paths from AGENT_SCAN_MAP by filtering for paths with trailing slash (Phase 14 convention: trailing slash = directory)
- No new AGENT_INSTALL_MAP — reuse existing shared data structure
- .md file extension for all agents (no .mdc conversion for Cursor)

### Non-Installable Agent Errors
- All 6 agents from AGENT_SCAN_MAP are recognized by the --agent flag
- Dotfile-only agents (windsurf, copilot, cline, aider) get a helpful error: "Agent 'windsurf' doesn't support directory-based install. Supported: claude, cursor. Windsurf uses a single .windsurfrules file — copy content manually."
- Completely unknown agents (not in AGENT_SCAN_MAP) get: "Unknown agent 'foo'. Known agents: claude, cursor, windsurf, copilot, cline, aider"

### --agent and --output Interaction
- --agent and -o/--output are mutually exclusive — using both is an error
- --agent determines the install path entirely
- Auto-create target directory if it doesn't exist (e.g., .cursor/rules/)

### Default Behavior
- No --agent flag = equivalent to --agent claude internally (single code path)
- Default install path changes from .claude/ to .claude/skills/
- -o/--output still works as override when --agent is NOT used

### Claude's Discretion
- Exact error message wording and formatting
- How to handle the -o default value change (Commander default vs runtime logic)
- Whether to add a helper function to @skillgate/shared for install path resolution or keep it in CLI

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `AGENT_SCAN_MAP` (packages/shared/src/agent-map.ts): Agent → paths mapping with trailing-slash convention for directories
- `getAgentDisplayName()` (packages/shared): Display name lookup for error messages
- Scan command's --agent validation pattern (packages/cli/src/commands/scan.ts): VALID_AGENTS check, error formatting — directly reusable

### Established Patterns
- Commander.js `.option("--agent <name>", description)` for flag definition
- Options interface with optional `agent?: string` field
- VALID_AGENTS derived from `AGENT_SCAN_MAP.map(e => e.agent)`
- `process.exitCode = 1` for error exits (not process.exit())
- ora spinner via stderr, stdout clean for piping

### Integration Points
- `index.ts`: Add --agent option to install command definition
- `install.ts`: Add agent validation, path resolution, mutual exclusion check with -o
- `@skillgate/shared`: May export a helper for install path resolution (agent → directory)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 15-cli-install-agent-flag*
*Context gathered: 2026-03-12*
