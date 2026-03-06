# Phase 3: Web UI - Research

**Researched:** 2026-03-05
**Domain:** Next.js 15 App Router UI with Tailwind CSS v4, React 19, dynamic OG images
**Confidence:** HIGH

## Summary

Phase 3 builds the full web UI for Skillgate: a homepage audit form (paste content or enter URL), a report page with per-category severity breakdown, and sharing features (permalink, badge snippet, OG image). The existing API surface (Phase 2) provides all data endpoints -- this phase is purely frontend rendering and client-side interaction.

The tech stack is already established: Next.js 15.5 App Router, React 19, TypeScript. Tailwind CSS needs to be installed (v4, CSS-first configuration via `@theme` directive). Fonts (Inter + JetBrains Mono) use `next/font/google` with CSS variable injection. The OG image uses Next.js built-in `ImageResponse` from `next/og` (no extra package needed). No additional UI libraries are required -- Tailwind utility classes handle all styling.

**Primary recommendation:** Install Tailwind CSS v4 with `@tailwindcss/postcss`, configure dark theme via `@theme` directive with purple accent colors, build the homepage as a Client Component with form state, and the report page as a Server Component that fetches from the existing `/api/report/[id]` endpoint.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Stacked layout: URL input field on top (compact), large textarea below for pasting raw content
- Both inputs always visible -- user picks whichever method they prefer
- Client-side validation before submit: check URL format, check content non-empty, show character count
- Submit triggers a full-page loading takeover (form fades, centered loading state takes over)
- On audit completion, redirect to the report permalink URL (/report/[slug])
- Hero banner at top: large colored banner showing recommendation verdict, summary, and overall score
- All 5 security categories displayed fully expanded by default -- no accordion/click required
- Each category shows severity via a horizontal progress bar, color-coded (green=safe, yellow=low, orange=moderate, red=high, dark red=critical)
- Plain-English reasoning visible inline for each category
- Utility analysis section below the security categories
- by_design flag visually distinguished when a category's risk is intentional vs malicious
- Dark modern aesthetic -- clean dark theme like Linear or Vercel dashboard, no terminal gimmicks
- Purple/violet accent color for primary actions (submit button, links, focus states, active elements)
- Traffic-light severity colors remain for category indicators (separate from accent)
- Fonts: Inter for UI text, JetBrains Mono for code/data (SKILL.md content, badge snippets)
- Minimal motion: subtle transitions (fade in, smooth expand) -- no flashy animations
- Dedicated "Add to README" section at the bottom of the report page
- Badge preview rendered above the markdown snippet
- Markdown-only snippet format (no HTML variant)
- One-click copy button for the markdown snippet
- Copy URL button in the report header -- copies permalink to clipboard with brief confirmation toast
- Dynamic OG image per report (via @vercel/og): shows skill name + verdict + severity overview

### Claude's Discretion
- Exact Tailwind color palette values for the dark theme
- Loading state animation/design during audit
- Responsive breakpoints and mobile layout adaptation
- Error state presentation (API errors, invalid URLs, etc.)
- Report page header layout (skill name, audit date, etc.)
- OG image layout and design

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| WEB-01 | User can paste raw SKILL.md content into a textarea and trigger an audit | Homepage form component with textarea, POSTs to `/api/audit`, redirects on success |
| WEB-02 | User can enter a URL (GitHub, HTTP) to fetch and audit a remote SKILL.md | URL input field with client-side validation; API handles URL fetching (needs URL fetch route or client-side fetch + pass content) |
| WEB-03 | Audit report displays per-category severity with expandable rows showing detailed reasoning | Report page renders all 5 categories expanded with severity progress bars and inline reasoning |
| WEB-04 | Audit report displays utility analysis section | Report page renders `utility_analysis` from AuditResult below categories |
| WEB-05 | Audit report displays final recommendation prominently | Hero banner with verdict, summary, overall_score at top of report page |
| WEB-07 | Audit page shows copyable markdown badge snippet for READMEs | "Add to README" section with badge preview + copy button using Clipboard API |
| WEB-08 | Homepage IS the audit interface -- no separate landing page | Root `page.tsx` renders the audit form directly |
| WEB-09 | Dark terminal aesthetic UI with Tailwind CSS | Tailwind v4 dark theme via @theme directive with custom color palette |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| tailwindcss | ^4 | Utility-first CSS | CSS-first config via @theme, auto content detection, 5x faster builds |
| @tailwindcss/postcss | ^4 | PostCSS plugin for Tailwind v4 | Required for v4 pipeline (replaces old tailwindcss PostCSS plugin) |
| postcss | ^8 | CSS processing | Peer dependency for @tailwindcss/postcss |
| next/font | (bundled) | Font optimization | Auto self-hosts Inter + JetBrains Mono, zero layout shift |
| next/og | (bundled) | OG image generation | ImageResponse for dynamic social preview images, no extra install |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/navigation | (bundled) | Client-side routing | `useRouter().push()` for redirect after audit |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Raw Tailwind | shadcn/ui | Adds component abstraction; overkill for 2 pages with custom design |
| Tailwind v4 | Tailwind v3 | v3 needs JS config + content paths; v4 is simpler, faster |
| next/og | Custom API route | next/og is built-in, generates PNG from JSX at the edge |

**Installation:**
```bash
pnpm add -D tailwindcss @tailwindcss/postcss postcss --filter @skillgate/web
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── layout.tsx              # Root layout: fonts, globals.css, dark theme class
│   ├── page.tsx                # Homepage audit form (Client Component)
│   ├── globals.css             # Tailwind v4 import + @theme config
│   ├── report/
│   │   └── [slug]/
│   │       ├── page.tsx        # Report page (Server Component, fetches data)
│   │       └── opengraph-image.tsx  # Dynamic OG image per report
│   └── api/                    # (existing Phase 2 routes)
├── components/
│   ├── audit-form.tsx          # Form with URL input + textarea + submit
│   ├── report-hero.tsx         # Verdict hero banner
│   ├── category-card.tsx       # Single security category with progress bar
│   ├── utility-section.tsx     # Utility analysis display
│   ├── badge-section.tsx       # Badge preview + copy snippet
│   ├── copy-button.tsx         # Reusable copy-to-clipboard button
│   └── toast.tsx               # Brief confirmation toast
└── lib/
    ├── types.ts                # (existing) AuditResponse, AuditMeta
    ├── severity.ts             # Score-to-color mapping, score-to-percentage
    └── constants.ts            # Category labels, theme colors
```

### Pattern 1: Homepage as Client Component with Server Action Alternative
**What:** The homepage form needs client-side state (loading, validation, character count). Use a Client Component with `"use client"` directive.
**When to use:** Any page with interactive form state.
**Example:**
```typescript
// src/app/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AuditResponse, ErrorResponse } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(content: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const err: ErrorResponse = await res.json();
        throw new Error(err.error.message);
      }
      const data: AuditResponse = await res.json();
      router.push(`/report/${data.meta.slug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Audit failed");
      setLoading(false);
    }
  }

  // render form with loading overlay...
}
```

### Pattern 2: Report Page as Server Component
**What:** The report page has no client interactivity for the main content -- fetch data server-side and render. Only copy buttons need client interactivity (small Client Component islands).
**When to use:** Pages that primarily display data.
**Example:**
```typescript
// src/app/report/[slug]/page.tsx
import type { Metadata } from "next";
import type { AuditResponse } from "@/lib/types";

// Server-side data fetching
async function getReport(slug: string): Promise<AuditResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/report/${slug}`, {
    cache: "force-cache",
  });
  if (!res.ok) throw new Error("Report not found");
  return res.json();
}

// Dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const report = await getReport(slug);
  return {
    title: `Skillgate Report: ${report.result.verdict}`,
    description: report.result.summary,
  };
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const report = await getReport(slug);
  // render report components...
}
```

### Pattern 3: Copy-to-Clipboard with Toast
**What:** Small Client Component for clipboard interaction with brief visual confirmation.
**When to use:** Any "copy" button.
**Example:**
```typescript
"use client";
import { useState } from "react";

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button onClick={handleCopy} className="...">
      {copied ? "Copied!" : label}
    </button>
  );
}
```

### Pattern 4: Tailwind v4 Dark Theme Configuration
**What:** CSS-first theme setup using @theme directive for dark colors and severity palette.
**Example:**
```css
/* src/app/globals.css */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
  --font-sans: var(--font-inter);
  --font-mono: var(--font-jetbrains-mono);
}

@theme {
  /* Dark theme base colors */
  --color-surface-0: #0a0a0f;
  --color-surface-1: #12121a;
  --color-surface-2: #1a1a26;
  --color-surface-3: #242432;
  --color-border: #2a2a3c;

  /* Text colors */
  --color-text-primary: #f0f0f5;
  --color-text-secondary: #9898b0;
  --color-text-muted: #5e5e78;

  /* Purple accent */
  --color-accent: #8b5cf6;
  --color-accent-hover: #7c3aed;
  --color-accent-muted: #8b5cf620;

  /* Severity colors */
  --color-severity-safe: #22c55e;
  --color-severity-low: #eab308;
  --color-severity-moderate: #f97316;
  --color-severity-high: #ef4444;
  --color-severity-critical: #991b1b;

  /* Subtle transitions */
  --animate-fade-in: fade-in 0.2s ease-out;

  @keyframes fade-in {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
}
```

### Pattern 5: next/font Setup for Inter + JetBrains Mono
**What:** Self-hosted Google Fonts with CSS variable injection for Tailwind v4.
**Example:**
```typescript
// src/app/layout.tsx
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-surface-0 text-text-primary font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
```

### Pattern 6: Dynamic OG Image with opengraph-image.tsx
**What:** File-based metadata that generates a per-report social preview image.
**Example:**
```typescript
// src/app/report/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Skillgate Audit Report";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/report/${slug}`);
  const data = await res.json();

  return new ImageResponse(
    (
      <div style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#0a0a0f",
        color: "#f0f0f5",
        padding: "60px",
        fontFamily: "Inter",
      }}>
        <div style={{ fontSize: 32, color: "#9898b0" }}>Skillgate Audit</div>
        <div style={{ fontSize: 64, fontWeight: 700, marginTop: 20 }}>
          {data.result.recommendation.verdict.replace(/_/g, " ").toUpperCase()}
        </div>
        <div style={{ fontSize: 28, color: "#9898b0", marginTop: 20 }}>
          {data.result.summary}
        </div>
      </div>
    ),
    { ...size }
  );
}
```

### Anti-Patterns to Avoid
- **Fetching report data client-side on the report page:** Use Server Components -- the report page URL is a permalink, data is static once created. Server-side fetch enables SEO and instant render.
- **Using `useEffect` for data fetching:** Next.js App Router Server Components handle this natively. Only the homepage form needs client-side state.
- **Putting all components in a single file:** Split by concern (hero, category card, badge section) for readability and reuse.
- **Hardcoding colors instead of using theme variables:** Always reference Tailwind theme tokens (`bg-surface-1`, `text-severity-safe`) so the palette is centralized.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Font loading/optimization | Manual `@font-face` + preload | `next/font/google` | Handles self-hosting, preloading, font-display, fallback metrics |
| OG image generation | Canvas/SVG-based image API | `next/og` ImageResponse | Built into Next.js, JSX syntax, edge-optimized |
| Clipboard interaction | Custom execCommand fallback | `navigator.clipboard.writeText()` | Modern API, supported in all current browsers |
| CSS dark mode | JS-based theme toggle | Tailwind `dark:` variant with `.dark` class on html | Static class, no hydration flash, CSS-only |
| URL validation | Custom regex | `new URL()` constructor in try/catch | Handles all edge cases (protocol, encoding, etc.) |

**Key insight:** This phase is pure UI rendering over existing API endpoints. Every data operation already exists -- the work is presentation, not plumbing.

## Common Pitfalls

### Pitfall 1: Tailwind v4 Font Variable Resolution
**What goes wrong:** `font-sans` utility renders with default system fonts instead of Inter.
**Why it happens:** `@theme` (without `inline`) creates a new CSS variable that doesn't resolve to the runtime-injected `next/font` variable.
**How to avoid:** Use `@theme inline { --font-sans: var(--font-inter); }` -- the `inline` keyword tells Tailwind to inline the var() reference so it resolves at runtime.
**Warning signs:** Fonts look like system defaults in dev mode.

### Pitfall 2: Server Component Fetching Its Own API
**What goes wrong:** Report Server Component fetches `localhost:3000/api/report/[slug]` during build or SSR, which fails or is slow.
**Why it happens:** Self-referencing fetch in Server Components goes through the network stack unnecessarily.
**How to avoid:** Import the KV/Redis logic directly in the Server Component instead of fetching via HTTP. Or use a shared `getReport(slug)` function that reads from Redis directly. Alternatively, use `NEXT_PUBLIC_BASE_URL` env var with the deployed URL and accept the network hop.
**Warning signs:** Slow page loads, build failures, `fetch failed` errors.

### Pitfall 3: Hydration Mismatch with Dark Mode
**What goes wrong:** Flash of light theme on initial load, then dark mode applies.
**Why it happens:** HTML rendered on server doesn't have `dark` class, client adds it.
**How to avoid:** Hardcode `className="dark"` on the `<html>` element in layout.tsx since the app is dark-only (no theme toggle). No JS-based toggle needed.
**Warning signs:** Brief white flash on page load.

### Pitfall 4: WEB-02 URL Fetching Architecture
**What goes wrong:** Implementing URL-to-content fetching client-side exposes CORS issues with GitHub raw URLs and other sources.
**Why it happens:** Browser fetch to arbitrary URLs gets blocked by CORS.
**How to avoid:** Either (a) add a `url` field to the `/api/audit` POST body and fetch the URL server-side in the route handler, or (b) create a small `/api/fetch-url` proxy endpoint. Option (a) is cleaner -- extend the existing audit route.
**Warning signs:** CORS errors in browser console when entering URLs.

### Pitfall 5: Next.js 15 Async Params
**What goes wrong:** `params` destructuring fails or TypeScript errors in dynamic routes.
**Why it happens:** Next.js 15 changed `params` to be a Promise that must be awaited.
**How to avoid:** Always use `const { slug } = await params;` pattern (already used in Phase 2 routes).
**Warning signs:** TypeScript errors about params type.

### Pitfall 6: OG Image Font Loading
**What goes wrong:** OG image renders with default sans-serif instead of Inter.
**Why it happens:** ImageResponse runs in edge runtime and needs font data as ArrayBuffer, not CSS.
**How to avoid:** Fetch the font file from Google Fonts CDN or bundle a `.ttf` in the project and load with `readFile` or `fetch`. Pass to the `fonts` option of ImageResponse.
**Warning signs:** OG preview shows generic font.

## Code Examples

### Severity Score to Visual Properties
```typescript
// src/lib/severity.ts
import type { Score } from "@skillgate/audit-engine";

export const SEVERITY_CONFIG: Record<Score, {
  color: string;
  bg: string;
  percent: number;
  label: string;
}> = {
  safe:     { color: "text-severity-safe",     bg: "bg-severity-safe",     percent: 10,  label: "Safe" },
  low:      { color: "text-severity-low",      bg: "bg-severity-low",      percent: 30,  label: "Low" },
  moderate: { color: "text-severity-moderate",  bg: "bg-severity-moderate", percent: 55,  label: "Moderate" },
  high:     { color: "text-severity-high",      bg: "bg-severity-high",     percent: 80,  label: "High" },
  critical: { color: "text-severity-critical",  bg: "bg-severity-critical", percent: 100, label: "Critical" },
};

export const VERDICT_CONFIG: Record<string, { color: string; bg: string }> = {
  install:              { color: "text-severity-safe",     bg: "bg-severity-safe" },
  install_with_caution: { color: "text-severity-low",      bg: "bg-severity-low" },
  review_first:         { color: "text-severity-moderate",  bg: "bg-severity-moderate" },
  avoid:                { color: "text-severity-high",      bg: "bg-severity-high" },
};
```

### Category Progress Bar Component
```typescript
// src/components/category-card.tsx
import type { CategoryResult } from "@skillgate/audit-engine";
import { SEVERITY_CONFIG } from "@/lib/severity";

const CATEGORY_LABELS: Record<string, string> = {
  hidden_logic: "Hidden Logic",
  data_access: "Data Access",
  action_risk: "Action Risk",
  permission_scope: "Permission Scope",
  override_attempts: "Override Attempts",
};

export function CategoryCard({
  name,
  result,
}: {
  name: string;
  result: CategoryResult;
}) {
  const config = SEVERITY_CONFIG[result.score];

  return (
    <div className="rounded-lg bg-surface-1 border border-border p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-text-primary">
          {CATEGORY_LABELS[name] ?? name}
        </h3>
        <div className="flex items-center gap-2">
          {result.by_design && (
            <span className="text-xs px-2 py-0.5 rounded bg-accent-muted text-accent">
              By Design
            </span>
          )}
          <span className={`text-sm font-medium ${config.color}`}>
            {config.label}
          </span>
        </div>
      </div>

      {/* Severity progress bar */}
      <div className="h-2 rounded-full bg-surface-3 mb-4">
        <div
          className={`h-full rounded-full ${config.bg} transition-all duration-500`}
          style={{ width: `${config.percent}%` }}
        />
      </div>

      {/* Finding */}
      <p className="text-text-secondary text-sm mb-2">{result.finding}</p>
      {/* Detail */}
      <p className="text-text-muted text-sm">{result.detail}</p>
    </div>
  );
}
```

### Badge Section with Copy
```typescript
// src/components/badge-section.tsx
import { CopyButton } from "./copy-button";

export function BadgeSection({ slug }: { slug: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://skillgate.sh";
  const badgeUrl = `${baseUrl}/api/badge/${slug}`;
  const reportUrl = `${baseUrl}/report/${slug}`;
  const snippet = `[![Skillgate](${badgeUrl})](${reportUrl})`;

  return (
    <section className="rounded-lg bg-surface-1 border border-border p-6">
      <h2 className="text-lg font-semibold text-text-primary mb-4">
        Add to README
      </h2>

      {/* Badge preview */}
      <div className="mb-4 p-4 bg-surface-2 rounded-md flex justify-center">
        <img src={badgeUrl} alt="Skillgate badge" />
      </div>

      {/* Markdown snippet */}
      <div className="relative">
        <pre className="bg-surface-0 border border-border rounded-md p-4 text-sm font-mono text-text-secondary overflow-x-auto">
          {snippet}
        </pre>
        <CopyButton text={snippet} label="Copy" />
      </div>
    </section>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| tailwind.config.js (JS) | @theme directive (CSS) | Tailwind v4 (Jan 2025) | No JS config file needed, CSS-first |
| @tailwind base/components/utilities | @import "tailwindcss" | Tailwind v4 | Single import line |
| tailwindcss PostCSS plugin | @tailwindcss/postcss | Tailwind v4 | New package name |
| @vercel/og separate install | next/og built-in | Next.js 14+ | No extra dependency |
| content: ["./src/**/*.tsx"] in config | Automatic content detection | Tailwind v4 | No content paths needed |
| next/font + tailwind.config.js fontFamily | next/font + @theme inline | Tailwind v4 | CSS variable mapping via @theme inline |

**Deprecated/outdated:**
- `@tailwind` directives: replaced by `@import "tailwindcss"` in v4
- `tailwind.config.js`: replaced by `@theme` directive for most use cases
- `ImageResponse` from `next/server`: moved to `next/og` in Next.js 14

## Open Questions

1. **WEB-02: URL fetching mechanism**
   - What we know: The existing `/api/audit` route accepts `{ content }`. URL fetching needs server-side implementation to avoid CORS.
   - What's unclear: Whether to extend `/api/audit` to accept `{ url }` OR create a separate `/api/fetch-url` endpoint.
   - Recommendation: Extend `/api/audit` to accept either `{ content }` or `{ url }` -- simpler contract, single endpoint. The route handler fetches the URL server-side and passes content to `auditSkill()`.

2. **OG image font loading strategy**
   - What we know: ImageResponse needs font data as ArrayBuffer. Can use `fetch()` from Google Fonts CDN or bundle a .ttf file.
   - What's unclear: Whether to bundle font files (increases bundle) or fetch at runtime (adds latency).
   - Recommendation: Fetch Inter font from Google Fonts CDN at runtime in the OG image handler -- edge runtime makes this fast, and it avoids bundling large font files.

3. **Report page data fetching: HTTP vs direct Redis**
   - What we know: Server Components can either fetch their own API route or import Redis directly.
   - What's unclear: Self-referencing fetch works in production (Vercel) but may be problematic during build.
   - Recommendation: Import the KV read logic directly (extract a `getReportBySlug` function from the existing route handler into a shared lib). Avoids self-fetch issues entirely.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 3.2 |
| Config file | apps/web/vitest.config.ts |
| Quick run command | `pnpm --filter @skillgate/web test` |
| Full suite command | `pnpm --filter @skillgate/web test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| WEB-01 | Audit form submits content to /api/audit | unit (component) | `pnpm --filter @skillgate/web test -- src/components/__tests__/audit-form.test.tsx` | No -- Wave 0 |
| WEB-02 | URL input validates format and submits | unit (component) | `pnpm --filter @skillgate/web test -- src/components/__tests__/audit-form.test.tsx` | No -- Wave 0 |
| WEB-03 | Category cards render severity + reasoning | unit (component) | `pnpm --filter @skillgate/web test -- src/components/__tests__/category-card.test.tsx` | No -- Wave 0 |
| WEB-04 | Utility section renders analysis data | unit (component) | `pnpm --filter @skillgate/web test -- src/components/__tests__/utility-section.test.tsx` | No -- Wave 0 |
| WEB-05 | Hero banner shows verdict prominently | unit (component) | `pnpm --filter @skillgate/web test -- src/components/__tests__/report-hero.test.tsx` | No -- Wave 0 |
| WEB-07 | Badge snippet is copyable markdown | unit (component) | `pnpm --filter @skillgate/web test -- src/components/__tests__/badge-section.test.tsx` | No -- Wave 0 |
| WEB-08 | Homepage renders audit form | unit (page) | `pnpm --filter @skillgate/web test -- src/app/__tests__/page.test.tsx` | No -- Wave 0 |
| WEB-09 | Dark theme classes applied | unit (smoke) | `pnpm --filter @skillgate/web test -- src/app/__tests__/layout.test.tsx` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm --filter @skillgate/web test`
- **Per wave merge:** `pnpm --filter @skillgate/web test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `@testing-library/react` + `@testing-library/jest-dom` -- add as devDependencies for component testing
- [ ] `jsdom` environment -- add `vitest` environment config for DOM testing
- [ ] `src/components/__tests__/` directory -- all component tests are new
- [ ] `src/app/__tests__/` directory -- page-level smoke tests are new
- [ ] Severity mapping unit tests: `src/lib/__tests__/severity.test.ts`

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS v4 Next.js Guide](https://tailwindcss.com/docs/guides/nextjs) -- installation steps, package names
- [Tailwind CSS @theme docs](https://tailwindcss.com/docs/theme) -- theme variable syntax, namespaces, inline keyword
- [Tailwind CSS dark mode docs](https://tailwindcss.com/docs/dark-mode) -- @custom-variant dark syntax
- [Next.js ImageResponse API](https://nextjs.org/docs/app/api-reference/functions/image-response) -- import from next/og, options, font loading
- [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts) -- next/font/google setup, variable fonts, CSS variables

### Secondary (MEDIUM confidence)
- [Tailwind v4 + next/font discussion](https://github.com/tailwindlabs/tailwindcss/discussions/15267) -- @theme inline pattern for font variables
- [Next.js OG Image guide](https://www.buildwithmatija.com/blog/complete-guide-dynamic-og-image-generation-for-next-js-15) -- opengraph-image.tsx file convention
- [Google Fonts in Next.js 15 + Tailwind v4](https://www.buildwithmatija.com/blog/how-to-use-custom-google-fonts-in-next-js-15-and-tailwind-v4) -- end-to-end setup pattern

### Tertiary (LOW confidence)
- None -- all findings verified with primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Tailwind v4, next/font, next/og all verified with official docs
- Architecture: HIGH -- Next.js App Router patterns well-documented, existing codebase patterns established
- Pitfalls: HIGH -- Font variable resolution, async params, OG font loading all documented issues with known solutions

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (stable stack, no fast-moving dependencies)
