---
phase: quick-8
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/header.tsx
  - apps/web/src/components/landing/hero-section.tsx
  - apps/web/src/components/landing/features-demo-section.tsx
  - apps/web/src/components/footer.tsx
autonomous: true
requirements: [MOBILE-RESPONSIVE]
must_haves:
  truths:
    - "Landing page renders without horizontal overflow on 375px-wide viewport"
    - "Header shows only logo and GitHub icon on screens <= 768px"
    - "Hero heading fits on 1-2 lines at 36px on mobile"
    - "CTA buttons stack vertically full-width on mobile"
    - "Feature cards stack single-column on mobile"
    - "Trust badges stack vertically on mobile"
    - "Footer links wrap cleanly with reduced spacing on mobile"
  artifacts:
    - path: "apps/web/src/components/header.tsx"
      provides: "Mobile-responsive landing header"
    - path: "apps/web/src/components/landing/hero-section.tsx"
      provides: "Mobile-responsive hero with 36px heading"
    - path: "apps/web/src/components/landing/features-demo-section.tsx"
      provides: "Single-column mobile layout for features, badges, and demo"
    - path: "apps/web/src/components/footer.tsx"
      provides: "Mobile-friendly footer with wrapped links"
  key_links: []
---

<objective>
Fix broken landing page layout on mobile screens (<=768px). All sections overflow or render incorrectly on small viewports. Apply responsive Tailwind breakpoints so the page is usable on phones.

Purpose: Landing page is the first thing users see -- must work on mobile.
Output: All four landing components updated with mobile-first responsive classes.
</objective>

<execution_context>
@/Users/lorisfochesato/.claude/get-shit-done/workflows/execute-plan.md
@/Users/lorisfochesato/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@apps/web/src/components/header.tsx
@apps/web/src/components/landing/hero-section.tsx
@apps/web/src/components/landing/features-demo-section.tsx
@apps/web/src/components/footer.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Header and Hero mobile responsiveness</name>
  <files>apps/web/src/components/header.tsx, apps/web/src/components/landing/hero-section.tsx</files>
  <action>
**header.tsx — Landing variant (isLanding block):**
- Hide the npm pill button on mobile: add `hidden sm:inline-flex` (or `hidden md:inline-flex`) to the pill button
- On mobile (<=768px), make header full-width with smaller padding: change `w-[calc(100%-80px)]` to `w-[calc(100%-32px)] md:w-[calc(100%-80px)]` and `px-4 sm:px-6` stays as-is (already has 16px mobile padding)
- The GitHub icon stays visible at all sizes — no change needed there

**hero-section.tsx:**
- Change the `fontSize` clamp from `clamp(48px, 8vw, 96px)` to `clamp(36px, 8vw, 96px)` so mobile gets 36px
- Add responsive center alignment: the section already has `text-center`, keep that
- Add `pt-8 md:pt-28` to the section (replacing current `pt-28`) so mobile gets 32px padding-top
- Subtitle paragraphs: change `text-2xl` to `text-base md:text-2xl` for 16px on mobile
- Subtitle container: change `maxWidth: "820px"` inline style to add Tailwind `max-w-full md:max-w-[820px]` and remove the inline style
- CTA buttons div: change `flex-row` to `flex-col md:flex-row` and change `gap-4` to `gap-3 md:gap-4`
- Both CTA buttons: add `w-full md:w-auto` so they fill mobile width
- Ensure "Audit a skill" link comes first in DOM order (it already does) and "View example report" second
  </action>
  <verify>Run `npx next build --no-lint` from apps/web to confirm no build errors. Visually: open localhost on mobile viewport (375px) in dev tools — heading should be ~36px, buttons stacked, subtitle 16px.</verify>
  <done>Header hides npm pill on mobile, shows only logo + GitHub. Hero heading is 36px on mobile, subtitle 16px, CTAs stacked full-width, padding-top 32px.</done>
</task>

<task type="auto">
  <name>Task 2: Features/Demo section and Footer mobile responsiveness</name>
  <files>apps/web/src/components/landing/features-demo-section.tsx, apps/web/src/components/footer.tsx</files>
  <action>
**features-demo-section.tsx:**
- The outer grid `grid-cols-1 lg:grid-cols-[3fr_2fr]` is already single-column on mobile — good, keep it
- Feature cards inner grid: change `grid-cols-3` to `grid-cols-1 lg:grid-cols-3` and change `gap-4` to `gap-3 lg:gap-4` (12px gap on mobile)
- Trust Badges container: change `flex items-center` to `flex flex-col sm:flex-row sm:items-center` with `gap-2 sm:gap-0`
- Inside the badges container, the inner badges flex: change `flex items-center gap-4` to `flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4`
- Move CopyButton: on mobile it should be below badges full-width. Change `ml-auto` wrapper to `sm:ml-auto w-full sm:w-auto` and on the CopyButton container add `mt-2 sm:mt-0`
- Demo section already stacks below features on mobile due to `grid-cols-1` default — this is correct per spec (Features title -> cards -> badges -> demo)

**footer.tsx:**
- Change the inner div: add `flex flex-wrap justify-center gap-x-1 gap-y-2 md:gap-x-0 md:gap-y-0` to the container, replacing the existing layout where middots create spacing
- Actually simpler: keep current span-based layout but add responsive padding. Change `px-4 sm:px-6` to `px-4` (16px on all sizes). Change `py-6` to `py-6 md:py-6` (keep 24px). The existing inline spans with middots will naturally wrap — just ensure the container allows wrapping by adding `flex flex-wrap justify-center` or keeping the current inline flow which already wraps.
- Reduce the middot spacing on mobile: change `mx-2` to `mx-1 md:mx-2` on the middot spans
  </action>
  <verify>Run `npx next build --no-lint` from apps/web to confirm no build errors. Visually: on 375px viewport, feature cards should stack vertically, badges stack vertically with copy button below, demo screenshot is full-width below badges, footer links wrap with reduced spacing.</verify>
  <done>Feature cards single-column on mobile with 12px gap. Trust badges stack vertically with copy button below. Demo is full-width below features. Footer links wrap with 16px padding and tighter spacing.</done>
</task>

</tasks>

<verification>
Open the landing page at localhost:3000 with Chrome DevTools responsive mode at 375px width:
1. No horizontal scrollbar / overflow
2. Header: logo left, GitHub icon right, no nav links or npm pill
3. Hero: heading ~36px, 1-2 lines, centered. Subtitle 16px. Buttons stacked full-width
4. Features: single-column cards, vertical badges, copy button below badges
5. Demo: full-width below all feature content
6. Footer: links wrap, reduced spacing
</verification>

<success_criteria>
All landing page sections render correctly on a 375px viewport with no horizontal overflow. Layout matches the 8-section spec provided by the user.
</success_criteria>

<output>
After completion, create `.planning/quick/8-landing-page-mobile-responsive-fixes/8-SUMMARY.md`
</output>
