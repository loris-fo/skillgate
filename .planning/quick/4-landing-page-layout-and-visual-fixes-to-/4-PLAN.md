---
phase: quick-4
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/header.tsx
  - apps/web/src/components/landing/hero-section.tsx
  - apps/web/src/components/landing/features-demo-section.tsx
  - apps/web/src/components/landing/badge-snippet.tsx
  - apps/web/src/app/page.tsx
  - apps/web/src/components/footer.tsx
autonomous: false
requirements: [LAYOUT-FIXES]
must_haves:
  truths:
    - "Header shows shield + Skillgate (capital S), nav links, npm pill, GitHub icon -- no green Try it button"
    - "Hero heading is massive (~120px), no trailing period, tight line-height"
    - "Hero subtitle is two distinct visual lines at 24px with wider text block"
    - "CTA buttons are same height -- solid purple and outlined purple"
    - "Features are 3 horizontal cards beside the demo mock, not stacked vertically"
    - "Demo shows Safe to Install with green check, no numeric score"
    - "Badge section is a single compact row with badges inline"
    - "All vertical spacing is tight -- page fits in ~1 viewport + small scroll"
  artifacts:
    - path: "apps/web/src/components/header.tsx"
      provides: "Redesigned landing header"
    - path: "apps/web/src/components/landing/hero-section.tsx"
      provides: "Massive hero heading + styled subtitle + matched CTA buttons"
    - path: "apps/web/src/components/landing/features-demo-section.tsx"
      provides: "3-col horizontal feature cards + updated demo mock"
    - path: "apps/web/src/components/landing/badge-snippet.tsx"
      provides: "Compact single-row badge section"
  key_links: []
---

<objective>
Match the landing page build to the mockup by fixing layout, sizing, spacing, and styling across all sections. No content changes -- purely visual alignment.

Purpose: Current build deviates from mockup in header layout, hero sizing, feature card orientation, demo content, badge compactness, and overall vertical density.
Output: Updated landing page components matching mockup specifications.
</objective>

<execution_context>
@/Users/lorisfochesato/.claude/get-shit-done/workflows/execute-plan.md
@/Users/lorisfochesato/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/web/src/app/page.tsx
@apps/web/src/components/header.tsx
@apps/web/src/components/landing/hero-section.tsx
@apps/web/src/components/landing/features-demo-section.tsx
@apps/web/src/components/landing/badge-snippet.tsx
@apps/web/src/components/footer.tsx
@apps/web/src/app/globals.css
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix Header + Hero + CTA styling</name>
  <files>apps/web/src/components/header.tsx, apps/web/src/components/landing/hero-section.tsx</files>
  <action>
**Header (landing variant only -- the `isLanding` branch):**
- Change logo text from "skillgate" to "Skillgate" (capital S), set font-size to 22px, font-weight 700, white color
- Replace the current nav links (Docs, GitHub) with center-aligned nav: "About", "Features", "Security", "Pricing", "FAQ" -- color #b8b0c8, 16px, font-weight 500, gap 32px. These are anchor links (href="#about" etc.) for now.
- Move npm pill to right side: change text to `npm i -g skillgate`, bg #1e1a28, 14px monospace, color #b8b0c8
- Add GitHub SVG icon (28px, white) to the right of the npm pill -- use the same GitHub SVG already in the non-landing header branch
- REMOVE the green "Try it" Link button entirely
- Widen the header: change max-w-4xl to max-w-[1200px], change w-[calc(100%-2rem)] to w-[calc(100%-80px)]
- Keep the floating pill style (rounded-full, backdrop-blur, etc.)

**Hero Section:**
- Remove trailing period from "Don't install blind." -- make it "Don't install blind"
- Keep the existing clamp() font-size approach but ensure lineHeight is exactly 1.0 (change from 1.05), and letter-spacing is -2px
- Subtitle: Replace single `<p>` with two separate `<p>` tags:
  - Line 1: "Trust-verify any Claude skill before it touches your codebase."
  - Line 2: "AI-powered security analysis with plain-English reasoning, not just a score."
  - Both: font-size 24px (text-2xl), font-weight 400, color #b8b0c8 (use text-[#b8b0c8]), line-height 1.5
  - Wrapper div: max-w-3xl mx-auto (roughly 70-80% page width), mt-4
- CTA buttons: Both same height and visual weight
  - "Audit a skill": bg-[#7c5ccc], white text, px-8 py-4 (padding 16px 32px), rounded-lg (border-radius 8px), font-semibold. Remove rounded-full.
  - "View example report": transparent bg, border-2 border-[#9d7aff], text-[#9d7aff], px-8 py-4, rounded-lg, font-semibold. Remove the arrow entity and the text-sm/text-muted classes. Make it a proper button-sized Link matching the first.
  - Gap between buttons: gap-4 (16px), flex-row always (remove flex-col), justify-center
- Reduce section bottom padding: change pb-16 to pb-6 to tighten hero-to-features gap
- Reduce section top padding: pt-32 to pt-28
  </action>
  <verify>
    <automated>cd /Users/lorisfochesato/Dev/skillgate && npx next build 2>&1 | tail -5</automated>
  </verify>
  <done>Header shows Skillgate logo, 5 nav links, npm pill, GitHub icon, no Try it button. Hero heading has no period, 1.0 line-height, -2px letter-spacing. Subtitle is two lines at 24px. CTA buttons are matched height solid+outlined purple.</done>
</task>

<task type="auto">
  <name>Task 2: Fix Features/Demo layout + Badge section + overall spacing</name>
  <files>apps/web/src/components/landing/features-demo-section.tsx, apps/web/src/components/landing/badge-snippet.tsx, apps/web/src/app/page.tsx, apps/web/src/components/footer.tsx</files>
  <action>
**Features + Demo Section:**
- Change section padding: py-16 to py-6 (tighten vertical space)
- Change grid from `lg:grid-cols-2` to a custom layout: features column ~55-60%, demo ~40-45%. Use `grid-cols-1 lg:grid-cols-[3fr_2fr]` or similar.
- Add section titles: "Features" left-aligned above the cards column, "See it in action" left-aligned above the demo column. Both text-xl font-semibold text-text-heading mb-4.
- Feature cards: Change from vertical stack (`flex-col gap-6`) to a 3-column grid WITHIN the left column: `grid grid-cols-3 gap-4`. This makes 3 cards side by side.
  - Remove icon divs (no icons -- just title + body text)
  - Card styling: bg-[#2d2640] (or bg-surface-card which maps to same in dark), border-radius 12px (rounded-xl), padding 24px (p-6)
  - Add subtle border glow: `border border-accent/20`
  - Equal height: add `items-stretch` to the grid
- Demo mock report changes:
  - Change verdict from "Use with Caution" to "Safe to Install"
  - Change verdict color from `--color-severity-moderate` to `--color-severity-safe` (green)
  - REMOVE the score block entirely (the "6.2 / 10" div)
  - Update mockCategories data to match mockup:
    - Hidden Logic: "safe" stays but relabel severity display as "Status" category type
    - Data Access: "low" stays
    - Action Risk: change to severity "critical" (add critical to PILL_COLORS)
    - Permission Scope: change to severity "critical"
    - Override Attempts: change to severity "critical"
  - Add "critical" to PILL_COLORS: `{ bg: "bg-severity-critical", label: "Critical" }`
  - Browser chrome: use purple/dark tint -- change bg-surface-2 to bg-[#1e1a2e]

**Badge Section:**
- Restructure to compact single-row layout:
  - Section padding: py-16 to py-6
  - Remove subtitle paragraph
  - Title: "Trust Badges" left-aligned (not centered), text-[32px] font-semibold, remove mb-8 use mb-3
  - Replace the 3-column grid with a single card/bar: bg-[#2d2640] rounded-xl p-5 (padding 20px 24px)
  - Inside the card: flex row, all 3 ShieldBadge SVGs inline on the left with gap-4, single CopyButton on the right (ml-auto)
  - Remove individual per-badge `<pre>` code blocks
  - Max-width: keep max-w-4xl

**Page spacing (page.tsx):**
- Add a wrapper div with tighter spacing classes if needed, or rely on reduced section padding above
- The gap between sections is controlled by each section's py values which we already tightened

**Footer:**
- Change py-8 to py-6 for slightly tighter spacing
  </action>
  <verify>
    <automated>cd /Users/lorisfochesato/Dev/skillgate && npx next build 2>&1 | tail -5</automated>
  </verify>
  <done>Features display as 3 horizontal cards beside the demo. Demo shows "Safe to Install" green verdict, no numeric score, with critical severity pills. Badge section is a single compact row. All vertical spacing is reduced for a dense, mockup-matching layout.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Complete landing page visual rework: header, hero, CTA, features/demo, badges, footer spacing -- all matched to mockup specifications.</what-built>
  <how-to-verify>
    1. Run `cd /Users/lorisfochesato/Dev/skillgate && pnpm dev` (or confirm dev server is running)
    2. Visit http://localhost:3000
    3. Verify header: Shield + "Skillgate", center nav (About/Features/Security/Pricing/FAQ), npm pill + GitHub icon on right, NO green "Try it" button, header stretches wider
    4. Verify hero: Massive heading "Don't install blind" (no period), two distinct subtitle lines at 24px, two matched-height purple CTA buttons (solid + outlined)
    5. Verify features section sits close to hero (~48px gap), 3 cards horizontal beside demo
    6. Verify demo shows "Safe to Install" green verdict, no "6.2/10" score, critical severity pills
    7. Verify badge section is a compact single-row bar
    8. Verify overall page density -- should fit in roughly 1 viewport + small scroll
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues to fix</resume-signal>
</task>

</tasks>

<verification>
- `npx next build` completes without errors
- Visual inspection confirms mockup alignment across all 10 specification areas
</verification>

<success_criteria>
Landing page visually matches mockup: wider header with correct nav, massive hero, matched CTA buttons, horizontal feature cards, corrected demo, compact badges, tight overall spacing.
</success_criteria>

<output>
After completion, create `.planning/quick/4-landing-page-layout-and-visual-fixes-to-/4-SUMMARY.md`
</output>
