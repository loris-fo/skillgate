# Architecture Patterns

**Domain:** Security auditing SaaS — CLI + Web + API with shared engine
**Project:** Skillgate
**Researched:** 2026-03-05
**Confidence:** HIGH (established monorepo patterns, verified against well-documented ecosystem)

---

## Recommended Architecture

### Monorepo Package Layout

```
skillgate/
  package.json              # root — pnpm workspace manifest
  pnpm-workspace.yaml       # workspace glob: packages/*
  packages/
    audit-engine/           # @skillgate/audit-engine
      src/
        index.ts            # public API surface
        analyzer.ts         # Claude SDK call + prompt orchestration
        categories.ts       # 5 security category definitions
        schema.ts           # Zod schemas for input/output
        hasher.ts           # content-hash computation (SHA-256)
      package.json
    web/                    # @skillgate/web (Next.js 14 app)
      app/
        page.tsx            # homepage = audit interface
        api/
          audit/route.ts    # POST /api/audit
          report/[id]/route.ts   # GET /api/report/:id
          badge/[id]/route.ts    # GET /api/badge/:id (SVG)
        report/[id]/page.tsx     # shareable report page
      package.json
    cli/                    # skillgate (published as npm package)
      src/
        index.ts            # bin entrypoint
        commands/
          scan.ts           # scan <url|file>
          install.ts        # install <url|file> (scan + place SKILL.md)
        fetcher.ts          # fetch from GitHub/skills.sh/HTTP/local
        api-client.ts       # HTTP client → POST /api/audit
        formatter.ts        # terminal output (dark aesthetic)
      package.json
```

### pnpm-workspace.yaml

```yaml
packages:
  - 'packages/*'
```

### Component Boundaries

| Component | Responsibility | Owns | Communicates With |
|-----------|---------------|------|-------------------|
| `audit-engine` | Core audit logic: hash, schema, Claude orchestration | Anthropic SDK calls, Zod schemas | Called by `web/api/audit` and optionally direct tests |
| `web` (API routes) | HTTP surface: receive audit requests, check cache, persist, return results | Vercel KV client, audit-engine import | Receives from browser + CLI; reads/writes KV |
| `web` (UI) | User-facing audit interface and report display | Next.js App Router, Tailwind | Calls its own API routes (`/api/audit`, `/api/report/:id`) |
| `cli` | Developer-facing tool: fetch skill content, call API, gate install | Node.js fs, HTTP fetcher | Calls `web` API over HTTP (never imports audit-engine directly) |
| Vercel KV / Upstash Redis | Audit result persistence, content-hash dedup index | Persistent storage | Written by `web/api/audit`; read by `web/api/report`, `web/api/badge` |

**Critical boundary decision:** The CLI does NOT import `audit-engine` directly. It communicates via HTTP to `/api/audit`. This keeps the CLI lightweight (no Anthropic SDK, no KV client) and ensures all audits are persisted/cached in one place.

---

## Data Flow

### Audit Request — Web Browser Path

```
User pastes SKILL.md content
  → POST /api/audit  { content: string }
      → audit-engine: sha256(content) = hash
      → KV GET audit:{hash}
          → HIT: return cached result (skip Claude call)
          → MISS:
              → audit-engine: call Claude with audit prompt
              → parse + validate response (Zod)
              → generate slug (adjective-noun-hash4)
              → KV SET audit:{hash} = full result JSON
              → KV SET slug:{slug} = hash  (redirect index)
              → return { id: hash, slug, report: ... }
  → browser redirects to /report/{slug}
  → GET /api/report/{id}  (id = hash or slug)
      → if slug: KV GET slug:{id} → resolve to hash
      → KV GET audit:{hash} → return full report JSON
```

### Audit Request — CLI Path

```
skillgate scan <url|file|github>
  → fetcher.ts: resolve + download SKILL.md content
  → POST https://skillgate.sh/api/audit  { content }
  → receive { id, slug, report }
  → formatter.ts: render terminal report
  → exit 0 (pass) or exit 1 (High/Critical, unless --force)

skillgate install <url|file|github>
  → [same as scan up to exit decision]
  → on pass: write SKILL.md to .claude/SKILL.md or specified path
  → on fail: print reason, exit 1
```

### Badge Request

```
GET /api/badge/{id}
  → resolve id (hash or slug) → load report from KV
  → compute badge color/label from report.verdict
  → return SVG (text/plain+svg, cache-control: 7d)
```

### Report Permalink

```
GET /report/{slug}
  → Next.js page (SSR or ISR)
  → fetch /api/report/{slug}
  → render full audit report UI
```

---

## API Route Design

### POST /api/audit

**Purpose:** Single entry point for all audit requests (web + CLI).

```typescript
// Request
{ content: string }  // raw SKILL.md text

// Response 200 — new or cached result
{
  id: string,         // SHA-256 content hash (hex)
  slug: string,       // human-readable: "swift-harbor-a3f2"
  cached: boolean,
  report: {
    verdict: "safe" | "risky" | "high" | "critical",
    score: number,    // 0-100
    categories: {
      [categoryName: string]: {
        rating: "safe" | "risky" | "high" | "critical",
        reasoning: string,
        flags: string[]
      }
    },
    summary: string,  // plain-English explanation
    riskByDesign: boolean,  // "risky by design" vs "maliciously risky"
    analyzedAt: string      // ISO timestamp
  }
}

// Response 400 — invalid input
{ error: string }

// Response 429 — rate limit (if implemented)
{ error: "rate limit exceeded", retryAfter: number }
```

### GET /api/report/[id]

**Purpose:** Load persisted audit result by hash or slug.

```typescript
// Response 200
{ id, slug, report }  // same shape as audit response

// Response 404
{ error: "audit not found" }
```

### GET /api/badge/[id]

**Purpose:** Return embeddable SVG shield badge.

```typescript
// Response: SVG string
// Headers:
//   Content-Type: image/svg+xml
//   Cache-Control: public, max-age=604800 (7d)

// Badge shapes:
// verdict=safe    → green  "skillgate | safe"
// verdict=risky   → yellow "skillgate | risky"
// verdict=high    → orange "skillgate | high risk"
// verdict=critical → red   "skillgate | critical"
```

---

## Content-Hash Dedup Pattern

**Rationale:** SHA-256 of raw SKILL.md content is deterministic — same content always produces same hash. This is the dedup key, collision-safe for this domain.

```typescript
// packages/audit-engine/src/hasher.ts
import { createHash } from "node:crypto";

export function contentHash(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}
```

**KV key schema:**

| Key | Value | TTL |
|-----|-------|-----|
| `audit:{sha256hex}` | Full AuditResult JSON | None (permanent) |
| `slug:{slug}` | sha256hex | None (permanent) |
| `ratelimit:{ip}:{window}` | request count | Window duration |

**Slug generation:** `{adjective}-{noun}-{hash.slice(0,4)}` — generated once, stored alongside the audit result. Adjective/noun wordlists baked into the engine package (no external dependency).

---

## Patterns to Follow

### Pattern 1: Shared Type Package via Re-export

Instead of a separate `@skillgate/types` package, export types from `audit-engine` and re-import where needed. Keeps the package graph flat.

```typescript
// packages/audit-engine/src/index.ts
export type { AuditResult, AuditRequest, AuditCategory } from "./schema";
export { runAudit } from "./analyzer";
export { contentHash } from "./hasher";

// packages/web/app/api/audit/route.ts
import { runAudit, contentHash, type AuditResult } from "@skillgate/audit-engine";
```

### Pattern 2: API Client in CLI (not SDK import)

The CLI communicates with the deployed API over HTTP. This is intentional — it avoids duplicating Claude SDK configuration and ensures all results are cached centrally.

```typescript
// packages/cli/src/api-client.ts
const BASE_URL = process.env.SKILLGATE_API_URL ?? "https://skillgate.sh";

export async function submitAudit(content: string): Promise<AuditResult> {
  const res = await fetch(`${BASE_URL}/api/audit`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": `skillgate-cli/${VERSION}` },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error(`Audit API error: ${res.status}`);
  return res.json();
}
```

The `SKILLGATE_API_URL` env var enables local development testing without hitting production.

### Pattern 3: Next.js Route Handlers as Thin Orchestrators

API route handlers do only: parse input → check cache → call engine → persist → return. Business logic lives in `audit-engine`.

```typescript
// packages/web/app/api/audit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { runAudit, contentHash } from "@skillgate/audit-engine";
import { kv } from "@vercel/kv";

export async function POST(req: NextRequest) {
  const { content } = await req.json();
  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "content required" }, { status: 400 });
  }

  const hash = contentHash(content);
  const cached = await kv.get<AuditResult>(`audit:${hash}`);
  if (cached) return NextResponse.json({ id: hash, slug: cached.slug, cached: true, report: cached });

  const report = await runAudit(content);
  await kv.set(`audit:${hash}`, report);
  await kv.set(`slug:${report.slug}`, hash);

  return NextResponse.json({ id: hash, slug: report.slug, cached: false, report });
}
```

### Pattern 4: CLI Fetcher Abstraction

All SKILL.md source resolution goes through one fetcher that normalizes GitHub URLs, skills.sh registry URLs, arbitrary HTTP URLs, and local file paths.

```typescript
// packages/cli/src/fetcher.ts
export async function fetchSkillContent(source: string): Promise<string> {
  if (source.startsWith("http://") || source.startsWith("https://")) {
    const url = resolveGitHubRaw(source); // github.com → raw.githubusercontent.com
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
    return res.text();
  }
  // local file
  return fs.readFile(path.resolve(source), "utf8");
}
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: CLI Importing audit-engine Directly

**What:** `packages/cli` imports `@skillgate/audit-engine` and calls Claude SDK directly.
**Why bad:** Doubles the dependency footprint of the CLI (adds Anthropic SDK, KV client). Splits caching — CLI-run audits would never be persisted. CLI bundle size grows significantly, breaking the "lightweight tool" expectation.
**Instead:** CLI is always a thin HTTP client to `/api/audit`. Use `SKILLGATE_API_URL` env var for local dev override.

### Anti-Pattern 2: Turborepo or Build Orchestrator

**What:** Adding Turborepo/Nx for build caching and task orchestration.
**Why bad:** Project has 3 packages, simple dependency graph. Turborepo adds config surface area with minimal payoff at this scale. pnpm's native `--filter` and `--recursive` cover the use cases.
**Instead:** Simple pnpm scripts at root: `pnpm -r build`, `pnpm --filter @skillgate/web dev`.

### Anti-Pattern 3: Separate Types Package

**What:** `packages/types` with shared TypeScript interfaces.
**Why bad:** At 3 packages, a shared types package creates a third dependency everyone must declare. Types are owned by the engine — consumers import from it.
**Instead:** Export types from `@skillgate/audit-engine/index.ts`. Types travel with the logic that defines them.

### Anti-Pattern 4: Route-Level Business Logic

**What:** Audit prompt, scoring logic, and hash computation inside Next.js route handlers.
**Why bad:** Cannot be unit tested without spinning up Next.js. Cannot be reused. Audit prompt changes require touching the web package.
**Instead:** All audit logic in `audit-engine`. Route handlers are orchestrators only (10-30 lines each).

### Anti-Pattern 5: Mutable KV Keys (hash collisions)

**What:** Using non-hash keys (e.g., sequential IDs) as primary audit keys.
**Why bad:** Breaks the dedup guarantee. Two identical SKILL.md files would create two audit records, wasting Claude API spend and creating inconsistent results.
**Instead:** Always primary-key by SHA-256 content hash. Slugs are secondary lookup indexes only.

---

## Build Order (Phase Dependencies)

The package dependency graph dictates build order:

```
1. audit-engine         ← no internal deps, foundation
2. web (API routes)     ← depends on audit-engine + KV
3. web (UI)             ← depends on web API routes existing
4. cli                  ← depends on web API being deployed (HTTP)
```

**Implication for roadmap phases:**

| Phase | What to Build | Why This Order |
|-------|--------------|----------------|
| Phase 1 | `audit-engine` — schema, hasher, Claude call, prompt wiring | Everything else depends on this. Can be tested in isolation with unit tests before any web surface exists. |
| Phase 2 | `web` API routes — `/api/audit`, `/api/report/[id]`, `/api/badge/[id]` | Core HTTP surface. CLI can be built against this. KV integration happens here. |
| Phase 3 | `web` UI — homepage audit form, `/report/[id]` page, dark aesthetic | Needs working API routes. Landing page = audit interface as per project decision. |
| Phase 4 | `cli` — fetcher, API client, `scan` + `install` commands, exit code gating | Needs deployed API to call. Can be developed against local `SKILLGATE_API_URL`. |
| Phase 5 | Polish — badge SVG rendering, rate limiting, error states, CLI install flow | Cross-cutting concerns after core paths work end-to-end. |

---

## Scalability Considerations

| Concern | At launch (100 audits/day) | At traction (10K audits/day) | At scale (100K+) |
|---------|---------------------------|------------------------------|------------------|
| KV storage | Vercel KV free tier sufficient | Upstash Redis pay-per-request scales linearly | KV remains fine; add TTL-less permanent tier |
| Claude API costs | ~$0.10/audit → content-hash dedup eliminates repeats | Cache hit rate improves as popular skills recur; costs plateau | Dedup is the primary cost control |
| API route cold starts | Vercel Edge/Node cold starts acceptable | Enable ISR on report pages to reduce route invocations | Consider edge runtime for badge route (pure KV read) |
| Rate limiting | IP-based via KV counter (simple) | Upstash Ratelimit library (sliding window) | Vercel WAF or Cloudflare in front |
| Badge caching | `Cache-Control: public, max-age=604800` at CDN | Same — badges are static per audit result | Same |

---

## Component Diagram (Text)

```
┌─────────────────────────────────────────────────────────┐
│                     BROWSER / CI                        │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js 14 App (Vercel)                    │
│  ┌─────────────────┐    ┌──────────────────────────┐   │
│  │   App Router UI  │    │      API Routes          │   │
│  │  /  → audit form │    │  POST /api/audit         │   │
│  │  /report/[slug]  │◄───│  GET  /api/report/[id]   │   │
│  └─────────────────┘    │  GET  /api/badge/[id]    │   │
│                          └──────────┬───────────────┘   │
└─────────────────────────────────────┼───────────────────┘
                                      │ import
                                      ▼
                         ┌────────────────────────┐
                         │   @skillgate/audit-     │
                         │   engine               │
                         │                        │
                         │  contentHash()          │
                         │  runAudit()             │
                         │  Zod schemas            │
                         └───────────┬────────────┘
                                     │ Anthropic SDK
                                     ▼
                         ┌────────────────────────┐
                         │  Claude API             │
                         │  (claude-sonnet-4-...)  │
                         └────────────────────────┘

                         ┌────────────────────────┐
                         │  Vercel KV / Redis      │
                         │  audit:{hash} → JSON    │
                         │  slug:{slug} → hash     │
                         └────────────────────────┘
                                     ▲
                                     │ kv.get / kv.set
                                     │ (from API routes only)

┌─────────────────────────────────────────────────────────┐
│                    CLI (npm: skillgate)                  │
│  skillgate scan  <source>                               │
│  skillgate install <source>                             │
│                                                         │
│  fetcher.ts → normalize GitHub/HTTP/local               │
│  api-client.ts → POST https://skillgate.sh/api/audit  │
│  formatter.ts → terminal output                         │
│  exit 0 (safe/risky) | exit 1 (high/critical)          │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP (fetch)
                           └───────────────────────────►
                                          /api/audit (same API)
```

---

## Sources

- **HIGH confidence:** pnpm workspaces documentation (pnpm.io/workspaces) — well-established pattern, no breaking changes in 2025-2026
- **HIGH confidence:** Next.js 14 App Router Route Handlers (nextjs.org/docs/app/building-your-application/routing/route-handlers) — stable API as of 14.x
- **HIGH confidence:** Vercel KV / Upstash Redis client patterns — `@vercel/kv` package is the standard integration
- **HIGH confidence:** Content-addressable storage via SHA-256 — cryptographic standard, no version concerns
- **MEDIUM confidence:** CLI-to-API pattern (not SDK import) — inferred from standard "thin CLI" patterns in open-source tooling (e.g., Vercel CLI, Railway CLI); direct verification via docs not available in this session
- **MEDIUM confidence:** Slug generation pattern (adjective-noun-hash4) — common approach (similar to Docker names, Heroku app names); no single authoritative source
