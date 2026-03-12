---
phase: 16-file-type-detection
verified: 2026-03-12T12:30:00Z
status: passed
score: 10/10 must-haves verified
re_verification: false
human_verification:
  - test: "Submit a GitHub raw URL containing '.cursorrules' in the path"
    expected: "Report page shows a purple-tinted pill labeled 'Cursor' in the hero button row"
    why_human: "Requires live browser interaction with a real API request and rendered UI"
  - test: "Submit pasted content from a .cursorrules file (no URL)"
    expected: "Report shows agent pill if LLM detects 'cursor' in detected_agent; no pill if LLM returns 'unknown'"
    why_human: "LLM inference is non-deterministic; can only be confirmed via live run"
  - test: "Run 'skillgate install https://raw.githubusercontent.com/user/repo/main/.cursorrules --force'"
    expected: "Verdict line shows '(Cursor rules file)' suffix in terminal output"
    why_human: "CLI live run required; cannot execute CLI binary in static analysis"
---

# Phase 16: File Type Detection Verification Report

**Phase Goal:** Wire URL-based agent detection into web API and CLI, surface detected agent in report page and CLI output.
**Verified:** 2026-03-12T12:30:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Submitting a GitHub URL containing `.cursorrules` in the path produces a report with `detected_agent='cursor'` | VERIFIED | `route.ts` lines 107-119: `getAgentForPath(new URL(rawUrl).pathname)` called and result stored in `urlDetectedAgent`; lines 142-144 override cached results; lines 160-162 override fresh results |
| 2 | Submitting content without a URL still gets agent detection from LLM `detected_agent` field | VERIFIED | Audit engine `prompt.ts` instructs Claude to set `detected_agent`; schema includes the field; URL detection block only runs when `rawUrl` is present — LLM value passes through unchanged when no URL |
| 3 | URL-based detection takes precedence over LLM-inferred `detected_agent` | VERIFIED | `route.ts` lines 160-162: `if (urlDetectedAgent) { result.detected_agent = urlDetectedAgent; }` unconditionally overwrites LLM value after `auditSkill()` returns |
| 4 | Cached audit results have their `detected_agent` overridden when a URL provides agent info | VERIFIED | `route.ts` lines 141-144: `if (urlDetectedAgent) { safeCachedResult.detected_agent = urlDetectedAgent; }` applied before returning cached response |
| 5 | Report page shows an agent pill/tag when `detected_agent` is known | VERIFIED | `report-hero.tsx` lines 102-113: conditional `<span>` renders with purple styling when `result.detected_agent && result.detected_agent !== "unknown"`; calls `getAgentDisplayName(result.detected_agent)` |
| 6 | Report page omits agent label when `detected_agent` is `'unknown'` | VERIFIED | `report-hero.tsx` line 102: explicit `result.detected_agent !== "unknown"` guard; nothing renders when unknown or undefined |
| 7 | CLI passes URL to API so server-side URL detection applies | VERIFIED | `install.ts` lines 119-124: `auditPayload` is `{ content, url: resolved.url }` for URL inputs — URL is sent alongside content |
| 8 | CLI applies local URL-based detection as fallback | VERIFIED | `install.ts` lines 127-141: after API call, if `detected_agent` is absent or `'unknown'` and source was URL, calls `getAgentForPath(new URL(resolved.url).pathname)` and overrides `response.result.detected_agent` |
| 9 | CLI audit output includes agent name in verdict line when detected | VERIFIED | `output.ts` lines 42-50: `agentSuffix` built from `getAgentDisplayName(result.detected_agent)` appended to `console.log` line |
| 10 | Agent label is omitted from CLI output when `detected_agent` is `'unknown'` | VERIFIED | `output.ts` line 43-46: `agentSuffix` is empty string when `detected_agent` is absent or `'unknown'` |

**Score:** 10/10 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/web/src/app/api/audit/route.ts` | URL-based agent detection before/after audit, override on cached results | VERIFIED | 206 lines; imports `getAgentForPath` from `@skillgate/shared` and `DetectedAgent` from `@skillgate/audit-engine`; full detection + override logic present |
| `apps/web/src/components/report-hero.tsx` | Agent pill/tag display near report title | VERIFIED | 237 lines; imports `getAgentDisplayName`; conditional pill in button row at lines 102-113 |
| `packages/cli/src/commands/install.ts` | Sends URL to API for URL-based detection | VERIFIED | 173 lines; sends `{ content, url }` payload; local fallback detection present |
| `packages/cli/src/lib/output.ts` | Agent display in compact result output | VERIFIED | 219 lines; `agentSuffix` logic in `printCompactResult` at lines 42-50 |
| `packages/cli/src/lib/api-client.ts` | Updated `auditViaApi` signature accepting optional url with content | VERIFIED | Signature: `body: { content: string; url?: string } | { url: string }` at line 12 |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `apps/web/src/app/api/audit/route.ts` | `@skillgate/shared getAgentForPath` | import and call with URL pathname | WIRED | Line 10: `import { getAgentForPath } from "@skillgate/shared"`; Line 112: `const agent = getAgentForPath(urlPath)` |
| `apps/web/src/components/report-hero.tsx` | `AuditResult.detected_agent` | result prop | WIRED | Line 5: `import { getAgentDisplayName } from "@skillgate/shared"`; Line 102: `result.detected_agent`; Line 111: `getAgentDisplayName(result.detected_agent)` |
| `packages/cli/src/commands/install.ts` | `packages/cli/src/lib/api-client.ts` | `auditViaApi` call with url payload | WIRED | Line 3: import; Line 124: `await auditViaApi(auditPayload)` where `auditPayload` includes `url: resolved.url` for URL inputs |
| `packages/cli/src/lib/output.ts` | `AuditResult.detected_agent` | `response.result.detected_agent` | WIRED | Lines 43-46: reads `result.detected_agent`; Line 45: calls `getAgentDisplayName(result.detected_agent)` |
| `apps/web/src/app/report/[slug]/page.tsx` | `ReportHero` component | `result` prop containing `detected_agent` | WIRED | Line 4: import; Line 43: `<ReportHero result={report.result} meta={report.meta} slug={slug} />` |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| DETECT-01 | 16-01-PLAN.md, 16-02-PLAN.md | File type/agent detection from URL patterns (e.g., `.cursorrules` in GitHub URL) | SATISFIED | `route.ts`: `getAgentForPath(new URL(rawUrl).pathname)` with override on both cached and fresh results. `install.ts`: same logic applied both via API payload and local fallback |
| DETECT-02 | 16-01-PLAN.md, 16-02-PLAN.md | File type/agent detection from content patterns when pasted | SATISFIED | Audit engine `prompt.ts` instructs LLM to detect agent from content patterns; `detected_agent` field in schema; per 16-CONTEXT.md decision: "Rely entirely on Claude's existing `detected_agent` field from the audit prompt — no regex pre-detection". LLM-inferred value flows through when no URL is present. |

Note: DETECT-02 is satisfied by the existing LLM-based detection in the audit engine (Phase 13). The 16-CONTEXT.md explicitly documents this decision: content-based detection deliberately relies on Claude's inference rather than a separate regex pass. Both plans correctly claim DETECT-02 as their scope covers surfacing the LLM-detected value in the UI and CLI output.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None found | — | — | — | — |

No stubs, placeholders, empty implementations, or TODO/FIXME markers found in the modified files. TypeScript compiles cleanly for both `apps/web` and `packages/cli`.

### Human Verification Required

#### 1. Report page agent pill — URL-submitted `.cursorrules`

**Test:** Submit `https://raw.githubusercontent.com/{user}/{repo}/main/.cursorrules` in the web audit form
**Expected:** Report page displays a purple-tinted "Cursor" pill in the hero button row, to the right of the "Copy Link" button
**Why human:** Requires browser, live API call, and visual inspection of rendered JSX

#### 2. Report page agent pill — pasted content detection

**Test:** Paste the content of a `.cursorrules` file directly (no URL) and submit
**Expected:** If the LLM detects cursor-specific patterns, "Cursor" pill appears; if LLM returns unknown, no pill
**Why human:** LLM output is non-deterministic; outcome depends on file content

#### 3. CLI install — URL with agent detection

**Test:** Run `skillgate install https://raw.githubusercontent.com/{user}/{repo}/main/.cursorrules --force`
**Expected:** Verdict line reads something like `Install  Score: safe (Cursor rules file)`
**Why human:** Requires executing the installed CLI binary and making a real API call

#### 4. Cache override behavior

**Test:** Submit a URL containing `.cursorrules` twice with the same content but from different repos
**Expected:** Both report pages show "Cursor" pill; second request hits cache but `detected_agent` is still overridden to `cursor`
**Why human:** Requires two separate requests and inspecting Redis cache behavior in production

### Gaps Summary

No gaps found. All 10 observable truths are fully verified against the actual codebase. Both plans (16-01 and 16-02) are completely implemented:

- **Web API route** (`route.ts`): `getAgentForPath` is imported, called on URL pathname, and result is used to override `detected_agent` on both cached and fresh audit results.
- **Report hero** (`report-hero.tsx`): `getAgentDisplayName` is imported and called; conditional pill renders with correct purple styling only for known agents.
- **CLI install command** (`install.ts`): URL is passed to API alongside pre-fetched content; local fallback detection also applied.
- **CLI output** (`output.ts`): `agentSuffix` appended to verdict line using `getAgentDisplayName`.
- **API client** (`api-client.ts`): Signature updated to accept `{ content: string; url?: string }`.
- **TypeScript**: No compilation errors in either `apps/web` or `packages/cli`.

The DETECT-02 requirement (content patterns when pasted) is fulfilled via the existing LLM `detected_agent` inference in the audit engine, which was an explicit design decision documented in 16-CONTEXT.md.

---

_Verified: 2026-03-12T12:30:00Z_
_Verifier: Claude (gsd-verifier)_
