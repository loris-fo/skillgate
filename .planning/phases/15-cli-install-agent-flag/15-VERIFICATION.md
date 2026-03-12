---
phase: 15-cli-install-agent-flag
verified: 2026-03-12T11:40:00Z
status: passed
score: 5/5 must-haves verified
re_verification: false
---

# Phase 15: CLI Install Agent Flag Verification Report

**Phase Goal:** Add --agent flag to skillgate install so skills install into the correct agent directory
**Verified:** 2026-03-12T11:40:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth                                                                           | Status     | Evidence                                                                                                                                  |
| --- | ------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `skillgate install <url> --agent cursor` installs into `.cursor/rules/`         | VERIFIED   | `install.ts` L80-90: `getInstallPath("cursor")` returns `.cursor/rules/` (from `AGENT_SCAN_MAP`), used as `targetDir`                   |
| 2   | `skillgate install <url>` without --agent installs into `.claude/skills/`       | VERIFIED   | `install.ts` L93-96: else branch sets `targetDir = ".claude/skills/"` when neither `options.agent` nor `options.output` provided          |
| 3   | `skillgate install <url> --agent windsurf` shows helpful dotfile-only error     | VERIFIED   | `install.ts` L80-88: `getInstallPath("windsurf")` returns null → error message names single file and instructs manual copy               |
| 4   | `skillgate install <url> --agent foo` shows error listing known agents           | VERIFIED   | `install.ts` L72-78: VALID_AGENTS check + error `"Error: Unknown agent \"foo\". Known agents: claude, cursor, windsurf, copilot, cline, aider"` |
| 5   | `skillgate install <url> --agent cursor -o ./custom` shows mutual exclusion error| VERIFIED   | `install.ts` L59-65: both `options.agent` and `options.output` present → error message `"--agent and -o/--output are mutually exclusive..."` |

**Score:** 5/5 truths verified

---

### Required Artifacts

| Artifact                                      | Expected                                          | Status     | Details                                                                                          |
| --------------------------------------------- | ------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------ |
| `packages/shared/src/agent-map.ts`            | `getInstallPath` helper function exported         | VERIFIED   | L99-104: function defined, returns `dirPath ?? null`. Wired: imported in `install.ts`           |
| `packages/shared/src/index.ts`                | `getInstallPath` export present                   | VERIFIED   | L6: `getInstallPath` in named export list from `./agent-map.js`                                  |
| `packages/cli/src/commands/install.ts`        | Install command with `--agent` flag support       | VERIFIED   | L13-18: `InstallOptions` has `agent?: string`, L59-96: full validation + path resolution logic  |
| `packages/cli/src/index.ts`                   | Commander `--agent` option on install command     | VERIFIED   | L16: `.option("--agent <name>", "install into target agent directory (claude, cursor)")`        |

---

### Key Link Verification

| From                                      | To                                     | Via                    | Status   | Details                                                                                  |
| ----------------------------------------- | -------------------------------------- | ---------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `packages/cli/src/commands/install.ts`    | `packages/shared/src/agent-map.ts`     | `getInstallPath` import | WIRED    | L7-10: imports `AGENT_SCAN_MAP`, `getInstallPath`, `getAgentDisplayName` from `@skillgate/shared`; all three actively used |
| `packages/cli/src/index.ts`               | `packages/cli/src/commands/install.ts` | Commander option wiring | WIRED    | L16: `--agent` defined; L20: `.action(installCommand)` wires the command handler        |

---

### Requirements Coverage

| Requirement | Source Plan | Description                                                            | Status    | Evidence                                                                                                        |
| ----------- | ----------- | ---------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------- |
| INST-01     | 15-01-PLAN  | `skillgate install` accepts `--agent` flag to target specific agent dir | SATISFIED | `index.ts` L16: option defined; `install.ts` L70-90: agent validation + path resolution                       |
| INST-02     | 15-01-PLAN  | Default install behavior remains `.claude/skills/` when no flag provided| SATISFIED | `install.ts` L93-96: `targetDir = ".claude/skills/"` when neither `--agent` nor `-o` provided; verified in help output |

No orphaned requirements. Both INST-01 and INST-02 are mapped to Phase 15 in REQUIREMENTS.md traceability table and marked `[x]` complete.

---

### Anti-Patterns Found

No anti-patterns detected across the four modified files:
- No TODO/FIXME/HACK/PLACEHOLDER comments
- No empty return stubs (`return null`, `return {}`)
- No console-log-only implementations
- No stub API handlers

---

### Commit Verification

Both commits documented in the SUMMARY exist and are valid:

| Commit    | Description                                        | Files Changed                                              |
| --------- | -------------------------------------------------- | ---------------------------------------------------------- |
| `9fec92f` | feat(15-01): add getInstallPath helper to shared   | `packages/shared/src/agent-map.ts`, `packages/shared/src/index.ts` |
| `818a0f8` | feat(15-01): wire --agent flag into install command | `packages/cli/src/commands/install.ts`, `packages/cli/src/index.ts` |

---

### Build Verification

- `packages/shared` build: SUCCESS (ESM + DTS, 7ms)
- `packages/cli` build: SUCCESS (ESM + DTS, 8ms / 752ms)
- `node packages/cli/dist/index.js install --help`: confirms `--agent <name>` option visible in output

---

### Human Verification Required

#### 1. Live install with --agent cursor

**Test:** Run `skillgate install <real-url> --agent cursor` against a live URL in a project directory
**Expected:** File appears in `.cursor/rules/<skill-name>.md`, directory created if absent
**Why human:** Requires network call to real URL + filesystem write that can't be simulated in static analysis

#### 2. Backward compatibility — no flag

**Test:** Run `skillgate install <real-url>` (no flags) in a project that previously used `.claude/` default
**Expected:** File appears in `.claude/skills/<skill-name>.md` (new default), not `.claude/`
**Why human:** Real-world regression check; previous users had `.claude/` default

---

### Gaps Summary

No gaps. All five observable truths are satisfied by substantive, wired implementation. Both requirements are fully covered. Build passes with zero TypeScript errors. No anti-patterns found.

---

_Verified: 2026-03-12T11:40:00Z_
_Verifier: Claude (gsd-verifier)_
