# Technology Stack

**Project:** Skillgate
**Researched:** 2026-03-05
**Confidence Note:** All external fetch tools (WebSearch, WebFetch, Bash, Context7) were denied in this environment. Findings are drawn from training data (cutoff August 2025). Versions marked LOW confidence should be verified against npm/official docs before pinning.

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 14.x (App Router) | Web app + API routes | Constrained by PROJECT.md. App Router collocates API routes with UI, Vercel-native deployment. Use `/app` directory throughout. |
| TypeScript | 5.4+ | Language | Full type safety across monorepo. Shared types between CLI, web, and audit engine packages. |
| pnpm | 9.x | Package manager + workspace orchestration | Significantly faster than npm/yarn, native workspace support, no Turborepo needed for small monorepo. Hard links save disk. |
| Node.js | 20 LTS (minimum) | CLI + API runtime | LTS guarantees. Node 20 required for `--env-file` flag and stable fetch API (used in CLI HTTP fetching). |

**Confidence:** MEDIUM — Next.js 14 with App Router is well-established. pnpm 9 is current as of August 2025. Verify exact patch versions before publishing.

---

### CLI Framework

**Recommendation: Commander.js v12**

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Commander.js | 12.x | CLI argument parsing | Best TypeScript support, zero dependencies, 60M+ weekly downloads. The ecosystem standard for serious CLI tools (Vercel CLI, Prisma CLI use it). |

**Why not yargs:** Heavier, relies on `require()` convention, worse TypeScript ergonomics, cluttered API surface. Fine for complex CLIs with many subcommands needing tab completion, overkill here.

**Why not citty:** From the UnJS ecosystem (Nuxt authors). Excellent for Nuxt/Vite tooling, but tiny community vs Commander, fewer real-world production examples. Commander's longevity and ecosystem familiarity wins for an open-source tool targeting developers who will contribute.

**Commander pattern for Skillgate:**

```typescript
// packages/cli/src/index.ts
import { program } from 'commander';

program
  .name('skillgate')
  .description('Security auditor for Claude AI skill files')
  .version('0.1.0');

program
  .command('scan <source>')
  .description('Audit a SKILL.md from URL or local path')
  .option('--force', 'Install even if High/Critical findings')
  .option('--json', 'Output raw JSON')
  .action(scan);

program
  .command('install <source>')
  .description('Audit and install SKILL.md to project')
  .option('--force', 'Bypass security gate')
  .action(install);

program.parse();
```

**Confidence:** HIGH — Commander v12 TypeScript support is verified from training data. Widely deployed.

---

### Database / Persistence

**Recommendation: Upstash Redis (not Vercel KV)**

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @upstash/redis | ^1.31+ | Audit result KV store, content-hash dedup, slug→hash index | Vercel KV was deprecated/sunset in 2025 in favor of direct Upstash integration. Upstash Redis is the canonical Vercel-native KV solution. HTTP-based client, works in Edge runtime and Node.js both. |
| @upstash/ratelimit | ^2.x | Rate limiting API and web audit submissions | Built on same Redis, sliding window or fixed window. Prevents API abuse without auth overhead. |

**Critical:** Vercel KV was announced as sunset in late 2024/early 2025. Projects that used `@vercel/kv` should migrate to `@upstash/redis` directly. Do NOT use `@vercel/kv` for greenfield projects.

**Data schema pattern:**

```typescript
// Key patterns:
// audit:{contentHash}     → AuditResult JSON (permanent, deduped by content)
// slug:{slug}             → contentHash (human-readable → canonical lookup)
// hash:{contentHash}      → slug (reverse lookup)
// rate:{ip}               → request count (ephemeral, TTL-based)

interface AuditResult {
  hash: string;          // SHA-256 of normalized SKILL.md content
  slug: string;          // e.g., "swift-falcon-7x2"
  score: 'SAFE' | 'CAUTION' | 'HIGH' | 'CRITICAL';
  categories: CategoryResult[];
  reasoning: string;
  createdAt: number;
  skillName?: string;
}
```

**Confidence:** MEDIUM — Upstash Redis as Vercel KV successor is well-documented in the ecosystem. The `@vercel/kv` deprecation was announced but verify exact timing. The `@upstash/redis` package and `@upstash/ratelimit` APIs are stable.

---

### AI / Audit Engine

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @anthropic-ai/sdk | ^0.24+ | Claude API client | Official SDK. Streaming support, TypeScript-first. Use `claude-sonnet-4-20250514` per PROJECT.md constraint. |

**Pattern: Shared audit engine as internal package**

The audit engine lives in `packages/audit-engine` and is consumed by both the API route (`apps/web/app/api/audit/route.ts`) and potentially directly by the CLI (though CLI should call the API endpoint, not the SDK directly — keeps the AI key server-side).

```typescript
// packages/audit-engine/src/index.ts
export interface AuditInput {
  content: string;      // Raw SKILL.md content
  source?: string;      // URL or filename for context
}

export interface AuditOutput {
  score: SecurityScore;
  categories: CategoryAudit[];
  utility: UtilityAudit;
  reasoning: string;
  raw: string;          // Full Claude response for transparency
}

export async function auditSkill(
  input: AuditInput,
  client: Anthropic
): Promise<AuditOutput> {
  // The audit prompt is pre-written per PROJECT.md
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: buildPrompt(input) }]
  });
  return parseAuditResponse(response);
}
```

**CLI calls API, not SDK directly:** This keeps `ANTHROPIC_API_KEY` server-side only. The CLI posts to `https://skillgate.dev/api/audit` (or a configurable endpoint). No AI key ever ships in the npm package.

**Confidence:** HIGH — Pattern is standard for this architecture. SDK version may need verification.

---

### SVG Badge Generation

**Recommendation: `badge-maker` (formerly `gh-badges`)**

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| badge-maker | ^3.3+ | Generate SVG shields.io-style badges | The library that powers shields.io itself. Zero browser dependencies, pure SVG string output. No canvas, no puppeteer. Produces standard flat/flat-square/plastic badge styles. |

**Alternative considered: `@nicolo-ribaudo/shields-io` or direct shields.io API**

Do NOT use the shields.io API for dynamic badges — it adds an external dependency and latency. Generate SVG server-side at `/api/badge/{slug}.svg` and return with `Cache-Control: public, max-age=3600` headers.

**Badge API pattern:**

```typescript
// apps/web/app/api/badge/[slug]/route.ts
import { makeBadge } from 'badge-maker';

export async function GET(req: Request, { params }) {
  const audit = await getAuditBySlug(params.slug);

  const svg = makeBadge({
    label: 'skillgate',
    message: audit.score,    // 'SAFE' | 'CAUTION' | 'HIGH' | 'CRITICAL'
    color: scoreToColor(audit.score),
    style: 'flat',
  });

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    }
  });
}
```

**README embed snippet (what skill authors paste):**
```markdown
[![Skillgate](https://skillgate.dev/api/badge/swift-falcon-7x2.svg)](https://skillgate.dev/a/swift-falcon-7x2)
```

**Confidence:** MEDIUM — `badge-maker` is the shields.io underlying library, well-established. Version needs verification.

---

### Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | 4.x | Utility-first styling | Constrained by PROJECT.md. v4 uses CSS-native config (no `tailwind.config.js` required), faster builds, better dark mode. Terminal aesthetic maps well to Tailwind's monospace/zinc/slate palette. |
| shadcn/ui | (copy-paste) | Component primitives | Not a dependency — you copy components. Radix UI primitives underneath. Dark mode out of the box. Use sparingly: Textarea for SKILL.md input, Button, Badge components. |

**Why shadcn/ui over pure Tailwind:** The audit result display needs structured components (collapsible categories, risk badges). shadcn's Collapsible and Badge save implementation time vs. building from scratch.

**Confidence:** MEDIUM — Tailwind v4 released stable in early 2025. shadcn/ui component model is unchanged.

---

### Monorepo Structure

**No build orchestrator.** Per PROJECT.md, pnpm workspaces without Turborepo.

```
skillgate/
├── package.json          # Root — workspace definition, shared dev deps
├── pnpm-workspace.yaml   # Workspace globs
├── packages/
│   ├── audit-engine/     # Core auditing logic (@skillgate/audit-engine)
│   │   ├── package.json
│   │   └── src/
│   └── cli/             # npm CLI (skillgate)
│       ├── package.json  # "name": "skillgate", "bin": { "skillgate": "./dist/index.js" }
│       └── src/
└── apps/
    └── web/             # Next.js app (not published to npm)
        ├── package.json
        └── app/
```

**pnpm-workspace.yaml:**
```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

**Root package.json scripts:**
```json
{
  "scripts": {
    "dev": "pnpm --filter web dev",
    "build": "pnpm --filter @skillgate/audit-engine build && pnpm --filter skillgate build && pnpm --filter web build",
    "lint": "pnpm -r lint",
    "type-check": "pnpm -r type-check"
  }
}
```

**Note on ordering:** Build `audit-engine` before `cli` and `web` since both depend on it. Without Turborepo, the `build` script manually sequences this. For a 3-package repo this is fine — add Turborepo only if build times become painful.

**Confidence:** HIGH — pnpm workspace patterns are very stable. This structure is idiomatic.

---

### CLI Publishing

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| tsup | ^8.x | TypeScript bundler for CLI | Zero-config, esbuild-based. Produces CJS + ESM dual output, handles shebang injection. Much simpler than tsc + rollup for CLI packages. |

**tsup config for CLI:**
```typescript
// packages/cli/tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],          // CLI: CJS only, Node.js compat
  target: 'node20',
  clean: true,
  banner: {
    js: '#!/usr/bin/env node',   // Shebang injection
  },
});
```

**package.json `bin` field:**
```json
{
  "name": "skillgate",
  "version": "0.1.0",
  "bin": { "skillgate": "./dist/index.js" },
  "files": ["dist"],
  "engines": { "node": ">=20" },
  "publishConfig": { "access": "public" }
}
```

**Publishing workflow:** Manual `pnpm publish --filter skillgate` from root. No changesets needed for MVP — add when multiple contributors commit version bumps. The web app (`apps/web`) is never published; CLI (`packages/skillgate`) and optionally audit-engine (`packages/audit-engine`) are.

**Confidence:** HIGH — tsup is the de-facto standard for TypeScript CLI/library bundling as of 2025.

---

### Content Hash + Slug Generation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Node.js built-in `crypto` | — | SHA-256 content hashing | No dependency. `crypto.createHash('sha256').update(content).digest('hex')`. Normalize content (trim, LF line endings) before hashing for reliable dedup. |
| `unique-names-generator` | ^4.7+ | Human-readable slug generation (`swift-falcon-7x2`) | Lightweight, adjective-animal-number pattern. Memorable and shareable. Seed with first 8 chars of hash for reproducibility. |

**Alternative for slugs:** `nanoid` produces random URL-safe IDs but not human-readable. Use `unique-names-generator` for the slug, store hash→slug and slug→hash mappings in Redis.

**Confidence:** MEDIUM — `unique-names-generator` is stable but small library. `nanoid` is a reasonable alternative if readability is deprioritized.

---

### Development Tooling

| Tool | Version | Purpose | Why |
|------|---------|---------|-----|
| tsx | ^4.x | TypeScript execution (dev, scripts) | Runs `.ts` files directly without compile step. Replaces `ts-node`. Faster startup, ESM support. |
| Vitest | ^2.x | Testing | Workspace-aware, TypeScript-native, no babel config. Use for audit-engine unit tests (mock Anthropic SDK), CLI integration tests. |
| ESLint | ^9.x | Linting | Flat config (`eslint.config.mjs`). Shared config at root, extended in packages. |
| Prettier | ^3.x | Formatting | Single root `.prettierrc`. Consistent across packages. |

**Confidence:** MEDIUM — These are the 2025 TypeScript toolchain standards. Vitest v2 and ESLint v9 (flat config) are current.

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| CLI framework | Commander.js | yargs | Heavier, worse TS ergonomics, more appropriate for shell-script-style CLIs |
| CLI framework | Commander.js | citty | Smaller ecosystem, UnJS-specific conventions |
| CLI framework | Commander.js | oclif | Too heavy (Salesforce), good for plugin architectures, overkill for 2 commands |
| Persistence | Upstash Redis | Vercel KV (`@vercel/kv`) | Deprecated/sunset in 2025 |
| Persistence | Upstash Redis | PlanetScale/Neon (SQL) | Over-engineered for KV workload, PROJECT.md explicitly excludes a database |
| Persistence | Upstash Redis | Vercel Blob | Wrong data type — blob is for file storage, not structured KV |
| Bundler (CLI) | tsup | tsc + custom | tsup handles shebang, CJS/ESM, tree-shaking automatically |
| Bundler (CLI) | tsup | Rollup | More config, same result |
| Badge | badge-maker | shields.io API | External dependency, latency, rate limits |
| Badge | badge-maker | Canvas/Puppeteer | Massive overhead for SVG string output |
| Monorepo tooling | pnpm workspaces | Turborepo | Overkill for 3 packages, adds complexity per PROJECT.md constraint |
| Monorepo tooling | pnpm workspaces | Nx | Enterprise-scale tooling, wrong fit |

---

## Installation

```bash
# Root setup
pnpm init
# Create pnpm-workspace.yaml

# Audit engine
mkdir -p packages/audit-engine/src
cd packages/audit-engine && pnpm init

# CLI package
mkdir -p packages/cli/src
cd packages/cli && pnpm init

# Web app
pnpm create next-app@14 apps/web --typescript --tailwind --app --no-src-dir

# Core dependencies (web)
pnpm --filter web add @upstash/redis @upstash/ratelimit @anthropic-ai/sdk badge-maker unique-names-generator

# Core dependencies (CLI)
pnpm --filter skillgate add commander

# Shared dev tools (root)
pnpm add -D -w typescript tsx tsup vitest eslint prettier

# Audit engine
pnpm --filter @skillgate/audit-engine add @anthropic-ai/sdk
```

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| pnpm workspaces structure | HIGH | Stable, well-documented pattern |
| Commander.js for CLI | HIGH | 60M+/wk downloads, industry standard |
| tsup for CLI bundling | HIGH | De-facto 2025 standard |
| Next.js 14 App Router | HIGH | Per constraint, widely deployed |
| Upstash Redis (not @vercel/kv) | MEDIUM | @vercel/kv deprecation reported but verify exact status |
| badge-maker library | MEDIUM | Powers shields.io, but verify version is current |
| Tailwind v4 | MEDIUM | Released stable early 2025 per training data |
| Specific package versions | LOW | All versions need verification against npm registry before pinning |
| Anthropic SDK version | LOW | SDK evolves rapidly; verify `@anthropic-ai/sdk` latest against npm |

---

## Sources

All findings from training data (cutoff August 2025). External verification tools (WebSearch, WebFetch, Bash, Context7) were denied in this research session.

**Verify these before implementation:**
- `pnpm` latest stable: https://pnpm.io/installation
- `commander` latest: https://www.npmjs.com/package/commander
- `@upstash/redis` latest + Vercel KV sunset status: https://upstash.com/docs/redis/quickstarts/vercel
- `badge-maker` latest: https://www.npmjs.com/package/badge-maker
- `@anthropic-ai/sdk` latest: https://www.npmjs.com/package/@anthropic-ai/sdk
- `tsup` latest: https://tsup.egoist.dev
- Next.js 14 App Router docs: https://nextjs.org/docs/app
