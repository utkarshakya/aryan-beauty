# UI Improvement Plan

Companion to `plans/plan.md` (this folder; the original implementation plan). Scope: visual quality, consistency, and polish of the website for the real parlour — customer-facing pages first, owner admin second. No product behaviour changes unless explicitly listed.

## Current State — 24 September 2026

What the UI looks like today:

- Theme tokens defined in `app/globals.css` with a full dark-mode palette (`primary`, `success`, `warning`, `danger`, `neutral`, `muted`, `border`).
- Shared primitives are minimal: `components/ui/Button.tsx` (primary / secondary / ghost / danger, md / lg) and `components/ui/Container.tsx` (default / narrow). Everything else is hand-rolled Tailwind per file.
- Marketing components live in `app/components/` (Hero, Navbar, Footer, ServiceCard, ServicesPreview, ServicesFilter, EmptyServices, PageHeader, ThemeToggle, not-found).
- Admin screens inline long class strings repeatedly: `app/admin/page.tsx` restyles the same pill `Link` as a button four times and defines `SummaryCard` locally; status badges are styled ad hoc in the appointments list and detail views.
- Forms (BookingForm, BusinessSettingsForm, ServiceForm, CustomerProfileForm, StaffInviteForm) each define their own input classes.
- Typography is the system font stack only; no brand or display font.
- Some hardcoded dark-mode hexes bypass the theme (`Hero.tsx` `dark:bg-[#17131a]`, `dark:bg-[#2b2530]`, `dark:bg-[#3b3342]`).
- Hero calls `formatHoursDays([])` with an empty array instead of the real `closedWeekdays`, so the opening-days line can be wrong; the fallback address is hardcoded.

Goal of this plan: one coherent design language applied everywhere, expressed through shared primitives and tokens, with the public site reading as warm, calm, and trustworthy for a small parlour.

**Progress:** No sections started yet. All checkboxes below are unchecked.

## Working Order

Work in order; each section builds on the last. Keep every change shippable on its own (lint + typecheck + build green before moving on).

### 1. Design Foundation

- [ ] Load a brand font via `next/font` (e.g. a warm serif for display/headings plus the existing system stack for body). No external font CDN.
- [ ] Audit `@theme` tokens: add any missing sizes the UI needs (e.g. `--text-display`, card radii, shadow tokens) rather than inventing one-off values in components.
- [ ] Replace hardcoded dark-mode hexes in `Hero.tsx` (and anywhere else they appear) with theme tokens; extend the token set if a needed shade is missing.
- [ ] Define the standard focus-visible treatment once (ring width, offset, colour) and reuse it from the primitives.
- [ ] Document the token/primitive conventions briefly in `docs/architecture.md` (which classes/components to reach for first).

### 2. Shared UI Primitives (`components/ui/`)

Extract duplicates only where three or more call sites already repeat the same styling. Do not redesign while extracting — extract first, restyle later.

- [ ] `Input`, `Textarea`, `Select`, and a `Field` wrapper (label + hint + error) with consistent sizing; adopt in all five forms above.
- [ ] `Card` (border + background + radius + shadow) and use it for `SummaryCard`, `ServiceCard`, appointment groups, and detail panels.
- [ ] `Badge` with the status variants the app actually uses (pending, confirmed, completed, cancelled) and a neutral variant; single source for admin list, detail, and customer history.
- [ ] `PageHeader` (eyebrow + title + description + actions slot) — already exists as a marketing component; make it the standard for admin subpages too.
- [ ] `EmptyState` (icon/illustration slot, title, body, optional action) and adopt it in admin list, customer history, services, and search results.
- [ ] `SectionHeading` for consistent secondary headings on public pages.
- [ ] Keep `Button.tsx` API unchanged; only touch its internals if a token change forces it.

### 3. Public Site Polish

- [ ] Hero: fix the `formatHoursDays([])` bug to use real `closedWeekdays` from `BusinessSettings`; remove the hardcoded fallback address in favour of the existing DB fallback; refresh the visual (typography scale, spacing, the decorative glow) using tokens only.
- [ ] Navbar: consistent height and active-link styling on desktop; a proper mobile menu state (accessible: aria-expanded, focus management, Escape closes) instead of whatever the current breakpoint collapse does.
- [ ] Services page and `ServicesFilter`: aligned card grid (equal heights), category filter as a single consistent control style, clear selected state.
- [ ] `ServiceCard`: visual hierarchy pass — category eyebrow, name, price prominence, duration; consistent card heights; consider a subtle hover lift consistent with `Card`.
- [ ] Footer: tidy columns, consistent small-text treatment, business settings data unchanged.
- [ ] Loading states: skeleton (not spinner-only) for `/appointments` and `/services` route-level `loading.tsx`, styled with tokens.
- [ ] Review `error.tsx`, `not-found.tsx`, and `loading.tsx` so breakage states match the design language.

### 4. Admin Experience

- [ ] Replace the four inline pill-button `Link`s on `app/admin/page.tsx` with `ButtonLink` (secondary variant), adding any needed variant.
- [ ] Promote `SummaryCard` out of the page file into `components/ui/` and reuse it on admin subpages where counts are shown.
- [ ] Appointments list: consistent row/table rhythm, right-aligned meta, single `Badge` component, consistent action buttons (Confirm / Cancel / Restore) on mobile cards and desktop rows.
- [ ] Appointment detail page: same `Card` + `Badge` + `PageHeader` language; align labels/values.
- [ ] Services, settings, and staff pages: same header, form, and table treatment so the admin area feels like one product.
- [ ] Forms: loading/pending states on submit buttons where they exist today, and consistent inline error styling from `Field`.

### 5. Responsive and Accessibility Pass

- [ ] Check every public page and admin page at 360px, 768px, 1024px, and desktop widths; no horizontal overflow.
- [ ] Touch targets at least ~44px on primary mobile actions.
- [ ] Keyboard pass: all inputs reachable and labelled, focus visible on dark and light, menu and dialogs trap/return focus correctly.
- [ ] Contrast-check text and badge pairs against WCAG AA in both themes; adjust tokens, not per-component overrides.
- [ ] Run through the README "Devices and accessibility" checklist sections.

### 6. Verification

- [ ] `npm run lint`, `npx tsc --noEmit`, `npm run prisma:validate`, `npm run build` all pass.
- [ ] `npm run test` — 39 tests still green (UI work must not touch them).
- [ ] Manual pass of the README manual testing checklist (customer, owner, business settings, access) — UI changes must not alter flows.
- [ ] Update this plan's checkboxes and the "Current state" note as sections complete.

## Rules

- No new component libraries (shadcn, MUI, etc.) — extend `components/ui/` instead. New npm dependencies only for fonts, and only via `next/font`.
- No data-model, action, or authorization changes. UI work must not change what the tests assert.
- Prefer editing existing files over creating new pages; a new file only when a primitive or a genuinely new screen requires it.
- Extract duplicated styling into primitives; do not add a third copy of the same class string.
- Dark mode is a first-class theme: every new style must be checked in both themes using tokens, not hexes.
- Marketing copy (texts, service names, prices) is out of scope here.

## Explicitly Postponed

- Photography/imagery for services and hero (needs real parlour assets).
- Animations beyond existing subtle transitions (no motion library).
- Any "People and permissions" work — tracked in `../../product.md` and `plans/plan.md`, not here.