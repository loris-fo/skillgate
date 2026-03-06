# Phase 2: API Surface - Research

**Researched:** 2026-03-05
**Domain:** Next.js App Router API routes, Upstash Redis rate limiting, SVG badge generation
**Confidence:** HIGH

## Summary

Phase 2 builds the HTTP API layer on top of the Phase 1 audit engine. The web app (`apps/web`) currently has no source files -- it needs Next.js bootstrapped with App Router, then four route handlers: POST /api/audit, GET /api/report/[id], GET /api/badge/[id].svg, and the slug/KV infrastructure connecting them. The audit engine is already a workspace dependency with a clean `auditSkill(content)` API.

The stack is straightforward: Next.js 15 (stable, well-documented App Router), `@upstash/ratelimit` for sliding-window rate limiting (already using `@upstash/redis`), `badge-maker` (official shields.io library) for SVG generation, and `slugify` for URL slug creation. The `apps/web` package needs to be initialized as a Next.js project with these dependencies.

**Primary recommendation:** Bootstrap Next.js 15 App Router in `apps/web`, implement route handlers using Web standard Request/Response APIs, use `@upstash/ratelimit` sliding window for POST rate limiting, and `badge-maker` for SVG badge generation. Keep slug logic simple -- parse first H1, slugify, append 6-char hash suffix.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Slug Generation:** Extract skill name from SKILL.md content (parse first H1 heading or metadata), slugify, truncate to ~30 chars, append short hash suffix (e.g., `commit-abc123`). Slug is canonical public URL -- content hash is internal/API-only. Store slug->audit mapping in KV.
- **Badge Design:** Shields.io flat style (two-tone: [Skillgate | Verdict]). Traffic-light colors: install=green, install_with_caution=yellow, review_first=orange, avoid=red. Badge links to full audit report. Copyable markdown snippet.
- **API Response Shape:** POST /api/audit accepts `{ "content": "..." }`, returns full AuditResult + metadata (slug URL, badge URL, created_at, cached flag). GET /api/report/{slug} returns same shape. Structured JSON errors: `{ "error": { "code": "...", "message": "..." } }` mapping to AuditErrorCode.
- **Rate Limiting:** Per-IP on POST /api/audit only (30 audits/hour). GET endpoints NOT rate-limited. 429 with Retry-After header. Rate limit state in KV with TTL.

### Claude's Discretion
- Rate limit implementation approach (sliding window vs fixed window)
- How to extract skill name from SKILL.md content (regex, heading parse, etc.)
- KV key structure for slugs and rate limits
- SVG badge generation library choice
- Streaming response for long-running audits
- Next.js route handler patterns and middleware structure

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| WEB-06 | Each audit has a permanent shareable URL (content-hash based) | Slug generation pattern, KV key structure, dual URL scheme (slug public, hash internal) |
| DIST-01 | SVG badge generated at `/api/badge/[slug].svg` reflecting audit result | badge-maker library, color mapping, Next.js dynamic route with SVG content-type |
| DIST-02 | Dual URL scheme -- content hash for integrity, human-readable slug for display | Slug->hash KV mapping, bidirectional lookup pattern |
| DIST-03 | Badge and audit URLs are permanent and publicly accessible (no auth) | Public GET route handlers, no middleware auth, cache headers |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | ^15.1 | App Router framework for route handlers | Latest stable with well-documented App Router; Next.js 16 exists but 15 is battle-tested for production |
| react / react-dom | ^19.0 | Required peer deps for Next.js 15 | Next.js 15 requires React 19 |
| @upstash/ratelimit | ^2.0.8 | Sliding window rate limiting | Purpose-built for Upstash Redis, serverless-native, used by Vercel ecosystem |
| badge-maker | ^4.0.0 | SVG badge generation (shields.io official) | Official shields.io library, supports flat style with custom hex colors |
| slugify | ^1.6.6 | URL-safe slug generation | Most downloaded slugify library, supports truncation and custom replacements |

### Supporting (already in workspace)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @upstash/redis | ^1.36.0 | KV storage for slugs, rate limits | Already a dependency of audit-engine; share instance |
| zod | ^3.24.0 | Request body validation | Already in audit-engine; validate POST body |
| @skillgate/audit-engine | workspace:* | Audit execution | Already wired as workspace dependency |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| badge-maker | Hand-rolled SVG template | badge-maker handles font metrics, accessibility, edge cases; hand-rolled is simpler but fragile |
| slugify | @sindresorhus/slugify | More actively maintained but ESM-only with heavier API; slugify is sufficient for this use case |
| @upstash/ratelimit | Custom Redis INCR+TTL | Ratelimit handles sliding window math, race conditions, and provides clean API; not worth hand-rolling |

**Installation (in apps/web):**
```bash
pnpm add next@^15.1 react@^19 react-dom@^19 @upstash/ratelimit@^2 badge-maker@^4 slugify@^1.6
pnpm add -D @types/react @types/node typescript
```

## Architecture Patterns

### Recommended Project Structure
```
apps/web/
  next.config.ts
  tsconfig.json
  package.json
  src/
    app/
      api/
        audit/
          route.ts          # POST /api/audit
        report/
          [id]/
            route.ts        # GET /api/report/{slug-or-hash}
        badge/
          [id].svg/
            route.ts        # GET /api/badge/{slug}.svg
      layout.tsx            # Minimal root layout (needed by Next.js)
      page.tsx              # Placeholder (Phase 3 builds the UI)
    lib/
      kv.ts                 # Shared Redis/KV client singleton
      rate-limit.ts         # Rate limiter configuration
      slug.ts               # Slug generation (extract name + slugify + hash suffix)
      badge.ts              # Badge SVG generation with color mapping
      errors.ts             # API error types and response helpers
      types.ts              # API response types (AuditResult + metadata envelope)
```

### Pattern 1: Route Handler with Web Standard APIs
**What:** Next.js 15 App Router route handlers use Web Request/Response APIs
**When to use:** All API endpoints
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/getting-started/route-handlers
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  // ... process
  return Response.json({ data }, { status: 200 });
}
```

### Pattern 2: Dynamic Route Params (Next.js 15 Promise Pattern)
**What:** In Next.js 15, route params are Promises that must be awaited
**When to use:** All dynamic route handlers ([id] segments)
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/route
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ... use id
}
```

### Pattern 3: API Response Envelope
**What:** Consistent response shape wrapping AuditResult with metadata
**When to use:** All audit-related API responses
**Example:**
```typescript
type AuditResponse = {
  result: AuditResult;
  meta: {
    slug: string;
    url: string;        // /api/report/{slug}
    badge_url: string;  // /api/badge/{slug}.svg
    created_at: string; // ISO 8601
    cached: boolean;
  };
};

type ErrorResponse = {
  error: {
    code: string;  // AuditErrorCode | "RATE_LIMITED" | "NOT_FOUND"
    message: string;
  };
};
```

### Pattern 4: Shared KV Client Singleton
**What:** Single Redis instance shared across route handlers
**When to use:** All routes that need KV access (slug storage, rate limiting)
**Example:**
```typescript
// src/lib/kv.ts
import { Redis } from "@upstash/redis";

// Singleton -- reused across hot invocations in serverless
export const redis = Redis.fromEnv();
```

### Pattern 5: Slug Generation
**What:** Extract skill name from SKILL.md, create URL-friendly slug with hash suffix
**When to use:** POST /api/audit when creating new audit entries
**Example:**
```typescript
import slugify from "slugify";
import { createHash } from "crypto";

function extractSkillName(content: string): string {
  // Parse first H1 heading: "# Skill Name"
  const match = content.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() || "unnamed-skill";
}

function buildSlug(content: string, contentHash: string): string {
  const name = extractSkillName(content);
  const slug = slugify(name, { lower: true, strict: true }).slice(0, 30);
  const suffix = contentHash.slice(0, 6); // First 6 chars of SHA-256
  return `${slug}-${suffix}`;
}
```

### Anti-Patterns to Avoid
- **Importing audit-engine at module top level without lazy loading:** The engine creates an Anthropic client at import time via `createEngine()` default export. Route handlers should use `createEngine()` explicitly or import the factory, not the default singleton, to control initialization.
- **Blocking on cache writes:** The engine already uses fire-and-forget for cache; slug KV writes should follow the same pattern.
- **Using Pages Router API routes:** The project uses App Router. Never create `pages/api/` files.
- **Synchronous params access:** Next.js 15 requires `await params` -- forgetting this causes runtime errors.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rate limiting | Custom Redis INCR + TTL logic | @upstash/ratelimit sliding window | Race conditions, window boundary math, cleanup -- all solved |
| SVG badges | String template SVG | badge-maker (shields.io) | Font metrics, text width calculation, accessibility attributes, dark/light contrast |
| URL slugification | Custom regex replace | slugify library | Unicode handling, special character edge cases, transliteration |
| Request validation | Manual if/else checks | Zod schemas | Already used in audit-engine, consistent error messages |

**Key insight:** Rate limiting and badge generation have deceptively complex edge cases. The sliding window algorithm needs atomic Redis operations to avoid race conditions in concurrent serverless invocations. Badge SVG needs precise text-width measurement for proper layout.

## Common Pitfalls

### Pitfall 1: Badge SVG Route Path Convention
**What goes wrong:** Next.js treats dots in route segments specially. `/api/badge/[id].svg` needs a folder literally named `[id].svg` or a catch-all route.
**Why it happens:** File-system routing conflicts with the `.svg` extension in the URL.
**How to avoid:** Use a catch-all or named segment like `[id]` and handle the `.svg` suffix in the handler logic. Alternatively, create the folder as `[id].svg/route.ts` which Next.js does support as a valid segment name. Test locally to confirm.
**Warning signs:** 404 errors on badge URLs during development.

### Pitfall 2: Content-Type for SVG Response
**What goes wrong:** Badge endpoint returns JSON content-type instead of SVG.
**Why it happens:** Default Response.json() sets application/json.
**How to avoid:** Return `new Response(svgString, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" } })`.
**Warning signs:** Browser shows raw SVG XML instead of rendering the image.

### Pitfall 3: Upstash Redis Client Initialization
**What goes wrong:** Redis.fromEnv() fails because UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars aren't set in the web app.
**Why it happens:** Env vars configured for audit-engine package but not for the Next.js app.
**How to avoid:** Ensure `.env.local` in `apps/web/` has the Upstash credentials, or use a shared `.env` at root.
**Warning signs:** Runtime "missing environment variable" errors on first request.

### Pitfall 4: Slug Collision
**What goes wrong:** Two different SKILL.md files produce the same slug (same name, different content).
**Why it happens:** Slug is name-based, not content-based.
**How to avoid:** The 6-char hash suffix from the content SHA-256 makes collisions astronomically unlikely. But still: before storing, check if slug already exists and points to a different content hash. If collision detected, extend the hash suffix.
**Warning signs:** GET /api/report/{slug} returns wrong audit data.

### Pitfall 5: Rate Limit Bypass via Headers
**What goes wrong:** Attackers spoof X-Forwarded-For to bypass per-IP rate limiting.
**Why it happens:** Trusting client-provided headers for IP identification.
**How to avoid:** On Vercel, use `request.headers.get("x-real-ip")` or `request.ip` (NextRequest). Vercel sets x-real-ip from the actual connection, which cannot be spoofed. In development, fall back to "127.0.0.1".
**Warning signs:** Rate limiting is ineffective in production.

### Pitfall 6: Long-Running Audit Timeouts
**What goes wrong:** Claude API call takes >10 seconds, hitting Vercel Hobby timeout.
**Why it happens:** Audit engine calls Claude which can take 10-30 seconds.
**How to avoid:** Set `export const maxDuration = 60;` in the audit route handler (requires Vercel Pro). Consider streaming the response to keep the connection alive. STATE.md already flags this as a concern.
**Warning signs:** 504 Gateway Timeout on POST /api/audit.

## Code Examples

### Rate Limiter Setup
```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./kv";

export const auditRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 h"),
  prefix: "ratelimit:audit",
  ephemeralCache: new Map(), // In-memory cache to reduce Redis calls
});
```

### Rate Limit Middleware in Route Handler
```typescript
// In POST /api/audit route handler
import { auditRateLimiter } from "@/lib/rate-limit";

const ip = request.headers.get("x-real-ip") ?? request.ip ?? "127.0.0.1";
const { success, limit, remaining, reset } = await auditRateLimiter.limit(ip);

if (!success) {
  const retryAfter = Math.ceil((reset - Date.now()) / 1000);
  return Response.json(
    { error: { code: "RATE_LIMITED", message: "Too many audit requests" } },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": String(remaining),
      },
    }
  );
}
```

### Badge Generation
```typescript
// src/lib/badge.ts
import { makeBadge } from "badge-maker";
import type { Verdict } from "@skillgate/audit-engine";

const VERDICT_COLORS: Record<Verdict, string> = {
  install: "#4c1",            // green
  install_with_caution: "#dfb317", // yellow
  review_first: "#fe7d37",    // orange
  avoid: "#e05d44",           // red
};

const VERDICT_LABELS: Record<Verdict, string> = {
  install: "Install",
  install_with_caution: "Caution",
  review_first: "Review First",
  avoid: "Avoid",
};

export function generateBadge(verdict: Verdict): string {
  return makeBadge({
    label: "Skillgate",
    message: VERDICT_LABELS[verdict],
    color: VERDICT_COLORS[verdict],
    labelColor: "#555",
    style: "flat",
  });
}
```

### KV Key Structure
```typescript
// Recommended key prefixes:
// audit:{contentHash}        -> AuditResult (set by engine cache)
// slug:{slug}                -> { contentHash, createdAt }
// hash-to-slug:{contentHash} -> slug (reverse lookup for dedup)
// ratelimit:audit:{ip}       -> managed by @upstash/ratelimit
```

### SVG Badge Route Handler
```typescript
// app/api/badge/[id].svg/route.ts
import { NextRequest } from "next/server";
import { redis } from "@/lib/kv";
import { generateBadge } from "@/lib/badge";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // id will include ".svg" suffix from folder name -- strip it if needed
  const { id } = await params;
  const slug = id.replace(/\.svg$/, "");

  const entry = await redis.get<{ contentHash: string }>(`slug:${slug}`);
  if (!entry) {
    return new Response("Not Found", { status: 404 });
  }

  const result = await redis.get<{ recommendation: { verdict: string } }>(
    `audit:${entry.contentHash}`
  );
  if (!result) {
    return new Response("Not Found", { status: 404 });
  }

  const svg = generateBadge(result.recommendation.verdict as any);
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router `pages/api/*` | App Router `app/api/*/route.ts` | Next.js 13+ (stable 14+) | Web standard Request/Response, better streaming |
| Sync params `{ params: { id } }` | Async params `await params` | Next.js 15 | Must await before accessing; TypeScript enforces it |
| GET routes cached by default | GET routes uncached by default | Next.js 15 | No need to opt-out of caching for dynamic data |
| Custom rate limit middleware | @upstash/ratelimit v2 | 2024-2025 | Built-in sliding window, analytics, ephemeral cache |

**Deprecated/outdated:**
- `export const config = { runtime: 'edge' }` -- no longer needed for standard route handlers on Vercel
- Pages Router API routes (`pages/api/`) -- replaced by App Router route handlers
- `req.query` / `req.body` (Pages Router) -- replaced by `request.json()` and `await params`

## Open Questions

1. **Badge folder naming: `[id].svg` vs catch-all**
   - What we know: Next.js supports dots in folder names for route segments. `[id].svg` as a folder name should work.
   - What's unclear: Whether the `.svg` extension gets included in the `id` param or stripped automatically.
   - Recommendation: Test with `[id].svg/route.ts` folder structure. If the param includes `.svg`, strip it in the handler. Fallback: use `[...id]/route.ts` catch-all and parse the full path.

2. **Streaming for long-running audits**
   - What we know: Claude API can take 10-30s. Vercel Pro allows 60s maxDuration. STATE.md mentions streaming as needed.
   - What's unclear: Whether streaming is necessary for Phase 2 (API-only, no UI). CLI consumers can wait.
   - Recommendation: Set `maxDuration = 60` on the audit route. Defer streaming to Phase 3 (web UI) where UX actually benefits. Keep the POST response simple JSON for now.

3. **Next.js version: 15 vs 16**
   - What we know: Next.js 16.1.6 is latest stable. Next.js 15 is well-documented and battle-tested.
   - What's unclear: Whether Next.js 16 introduces breaking changes relevant to route handlers.
   - Recommendation: Use Next.js 15 (latest 15.x) for stability. Upgrade to 16 later if needed.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.2+ (already in workspace) |
| Config file | `apps/web/vitest.config.ts` -- needs creation (Wave 0) |
| Quick run command | `pnpm --filter @skillgate/web test` |
| Full suite command | `pnpm test` (runs all workspace tests) |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| WEB-06 | POST /api/audit returns permanent URL with slug | integration | `pnpm --filter @skillgate/web exec vitest run src/app/api/audit/route.test.ts -x` | No -- Wave 0 |
| DIST-01 | GET /api/badge/[slug].svg returns colored SVG | unit + integration | `pnpm --filter @skillgate/web exec vitest run src/lib/badge.test.ts -x` | No -- Wave 0 |
| DIST-02 | Dual URL scheme (slug + hash) both resolve | integration | `pnpm --filter @skillgate/web exec vitest run src/app/api/report/route.test.ts -x` | No -- Wave 0 |
| DIST-03 | Badge and audit URLs are public (no auth) | integration | `pnpm --filter @skillgate/web exec vitest run src/app/api/audit/route.test.ts -x` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm --filter @skillgate/web test`
- **Per wave merge:** `pnpm test` (full workspace)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `apps/web/vitest.config.ts` -- test config for web app
- [ ] `apps/web/src/lib/badge.test.ts` -- unit tests for badge generation
- [ ] `apps/web/src/lib/slug.test.ts` -- unit tests for slug generation
- [ ] `apps/web/src/app/api/audit/route.test.ts` -- integration tests for POST audit
- [ ] `apps/web/src/app/api/report/__tests__/route.test.ts` -- integration tests for GET report
- [ ] `apps/web/src/app/api/badge/__tests__/route.test.ts` -- integration tests for GET badge
- [ ] Framework setup: `pnpm --filter @skillgate/web add -D vitest` (if not inherited from workspace)
- [ ] Mock infrastructure: Redis mock / in-memory store for testing KV operations without Upstash

## Sources

### Primary (HIGH confidence)
- [Next.js App Router Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers) -- route handler conventions, params as Promise, caching defaults
- [Next.js Route Segment Config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config) -- maxDuration export
- [@upstash/ratelimit GitHub](https://github.com/upstash/ratelimit-js) -- v2.0.8, sliding window API, limit() return type
- [badge-maker GitHub README](https://github.com/badges/shields/blob/master/badge-maker/README.md) -- makeBadge() API, flat style, hex colors

### Secondary (MEDIUM confidence)
- [Vercel maxDuration docs](https://vercel.com/docs/functions/configuring-functions/duration) -- Pro tier 60s limit
- [Upstash rate limiting blog](https://upstash.com/blog/nextjs-ratelimiting) -- Next.js integration patterns
- [slugify npm](https://www.npmjs.com/package/slugify) -- v1.6.6, API surface

### Tertiary (LOW confidence)
- Badge dark/light GitHub background compatibility -- needs manual testing; badge-maker flat style uses solid background colors which should work on both, but no official guarantee found

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries are well-established, versions verified
- Architecture: HIGH -- Next.js App Router patterns are well-documented, existing engine DI pattern provides clear integration path
- Pitfalls: HIGH -- common issues with route conventions, rate limiting, and timeouts are well-documented in community
- Badge rendering: MEDIUM -- badge-maker API is stable but dark/light background behavior needs testing

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (stable ecosystem, 30-day validity)
