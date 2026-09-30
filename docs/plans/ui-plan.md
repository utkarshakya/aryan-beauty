# UI Improvement Plan

Companion to `plans/plan.md` (this folder; the original implementation plan). Scope: visual quality, consistency, and polish of the website for the real parlour — customer-facing pages first, owner admin second. No product behaviour changes unless explicitly listed.

## Current State — 25 September 2026

What the UI looks like today:

- Theme tokens defined in `app/globals.css` with a full dark-mode palette (`primary`, `success`, `warning`, `danger`, `neutral`, `muted`, `border`).
- Shared primitives are minimal: `components/ui/Button.tsx` (primary / secondary / ghost / danger, md / lg) and `components/ui/Container.tsx` (default / narrow). Everything else is hand-rolled Tailwind per file.
- Marketing components live in `app/components/` (Hero, Navbar, Footer, ServiceCard, ServicesPreview, ServicesFilter, EmptyServices, ThemeToggle, not-found).
- Admin screens inline long class strings repeatedly: `app/admin/page.tsx` restyles the same pill `Link` as a button four times and defines `SummaryCard` locally; status badges are styled ad hoc in the appointments list and detail views.
- Forms (BookingForm, BusinessSettingsForm, ServiceForm, CustomerProfileForm, StaffInviteForm, ServiceEditor) now share `Field` + `Input`/`Textarea`/`Select` from `components/ui/` instead of defining their own input classes; `Field` standardises label, hint, and error rendering.
- Typography: system font stack for body; Fraunces (warm serif, loaded via `next/font` in `app/fonts.ts`) for `h1`–`h3` through a base rule, plus a `font-display` utility and `text-display` size token.
- Focus is defined once as the `focus-ring` utility in `app/globals.css` and used at every interactive element (2px primary outline, 2px offset; works in both themes).
- Hardcoded dark-mode hexes are gone: `Hero.tsx` uses `dark:bg-background` and the new `surface` / `surface-strong` tokens.
- Hero calls `formatHoursDays([])` with an empty array instead of the real `closedWeekdays`, so the opening-days line can be wrong; the fallback address is hardcoded.

Goal of this plan: one coherent design language applied everywhere, expressed through shared primitives and tokens, with the public site reading as warm, calm, and trustworthy for a small parlour.

**Progress:** Section 1 (Design Foundation) complete — 25 September 2026. Section 2: form primitives (`Input`, `Textarea`, `Select`, `Field`) shipped and adopted in all five forms plus `ServiceEditor.tsx`; `Card` (shell + `cardClassName` helper) and `Badge` (single status tone map + `badgeTone` fallback) shipped 28 September 2026 and adopted across admin dashboard, appointments list/detail, customer history, ServiceCard, ServiceEditor, and the admin services/settings/staff panels — this also reconciles the `rounded-card`/`shadow-card` tokens `architecture.md` already prescribed but nothing used. Bonus fix: `AuthStatusBadge` role pills referenced nonexistent `purple`/`blue`/`green` tokens (dead classes) and now map to real palette tokens. Not migrated by design: border-only rows in `StaffTable`/`WalkInCustomerLinker` (2 sites, no shadow — not a 3+ duplicate) and the `bg-muted-soft` "Upcoming today" notice on the admin dashboard (sits inside a card; a dashed box there would nest borders — revisit in Section 4). `PageHeader` promoted to `components/ui/` (30 September 2026): adds `eyebrow`, `backHref`/`backLabel`, and an `actions` slot; one h1 scale everywhere (`text-2xl sm:text-3xl`, replacing marketing's `sm:text-4xl` and admin's `text-xl`); `align="center"` kept for the two public pages; the four ad-hoc admin back links are now one prop (`backLabel="Back to dashboard"`); `app/components/PageHeader.tsx` deleted. `EmptyState` shipped 30 September 2026: one dashed `rounded-card` shell (`title` + optional `icon`/`body`/`actions` slots) replacing five hand-rolled variants — admin appointments list (both the plain and search-result empties), customer `AppointmentGroup`, admin services, `StaffTable`, and `WalkInCustomerLinker` — so `border-dashed` now lives only in the primitive. `SectionHeading` shipped 30 September 2026: `text-lg/semibold/sm:text-xl` for in-page groups and `text-xl/bold/tracking-tight/sm:text-3xl` for landing sections (both scales pre-existed — extracted, not redesigned), with `description`, `actions`, and `id` for `aria-labelledby`; adopted in `ServicesPreview`, the customer appointments "Book new appointment" section, `AppointmentGroup`, and `EmptyServices`. `Button.tsx` untouched. **Section 2 complete — 30 September 2026.** Section 3 started same day: Hero fixed — passes real `business.closedWeekdays`, the local try/catch with the hardcoded description/address fallback is gone (`getBusinessSettingsForDisplay()`'s DB fallbacks are the single source), h1 uses the `text-display` token, spacing refreshed, and the decorative glow now renders in both themes from tokens (`bg-primary/20` light, `dark:bg-primary/10`) instead of dark-only. Navbar reworked same day: desktop links are uniform 36px pills (`px-3.5 py-2`, matching `ThemeToggle`/`AccountButton`) with a token active state (`bg-primary-soft text-primary-strong`) + `aria-current="page"` derived from `usePathname()`, `focus-ring` on every nav link; the mobile menu is now a real disclosure — `aria-expanded`/`aria-controls`, focus moves to the first item on open, Escape and outside-click close it and return focus to the toggle (mirrors `AccountButton`), and it closes on route change via the render-adjustment pattern (the lint rule forbids setState-in-effect). Services grid + filters: `ServiceCard` fills its grid cell (`h-full`), so cards are equal-height on `/services` and the home preview; category pills now share one selected state (`border-primary/30 bg-primary-soft text-primary-strong` vs transparent/muted) with `aria-pressed`. Aligning them with the admin status/date pills made three copies of the same class string, so the style moved to `filterPillClasses()` in `components/ui/FilterPill.tsx`, adopted at all three sites (admin pills also gained `focus-ring` + `aria-current="page"`, which they lacked). `ServiceCard` hierarchy pass: category eyebrow now `text-primary` (matches the `PageHeader` eyebrow), price bumped to `text-lg/bold sm:text-xl`, the price/duration row sits behind a `border-t` hairline like the admin card internals, and hover adds a subtle `-translate-y-0.5` lift with `shadow-md` (disabled under `motion-reduce`). Footer: the duplicate `formatHoursDays([])` bug fixed (real `closedWeekdays`), its local try/catch fallback removed in favour of the DB fallbacks (matching Hero), hours line guards an empty-hours dangling colon, and the tagline's responsive `text-xs→sm` is one consistent `text-sm`. Loading skeletons added for `/appointments` and `/services` (route-level `loading.tsx`, token-only `animate-pulse` bars mirroring each page's real layout, `role="status"` + sr-only label; root spinner unchanged). Breakage states reviewed: `error.tsx` shed hardcoded `red-500`/`red-50` hexes and the nonexistent `wrap-break-word` class for `danger`/`danger-soft`/`break-words`/`rounded-control`, and its h1 now matches the unified `text-2xl sm:text-3xl` scale; `not-found.tsx` h1 uses the `text-display` token instead of a one-off `sm:text-4xl`; root `loading.tsx` already conformed. **Section 3 complete — 30 September 2026.** Remaining known issue: `closedWeekdays` indices are Sunday-first in availability (`date.getDay()` and the display helpers) but Monday-first in `BusinessSettingsForm`'s `WEEKDAYS` array — a data/action semantics bug, out of scope for this plan. Sections 4–6 untouched; their checkboxes are unchecked.

## Working Order

Work in order; each section builds on the last. Keep every change shippable on its own (lint + typecheck + build green before moving on).

### 1. Design Foundation

- [x] Load a brand font via `next/font` (e.g. a warm serif for display/headings plus the existing system stack for body). No external font CDN.
- [x] Audit `@theme` tokens: add any missing sizes the UI needs (e.g. `--text-display`, card radii, shadow tokens) rather than inventing one-off values in components.
- [x] Replace hardcoded dark-mode hexes in `Hero.tsx` (and anywhere else they appear) with theme tokens; extend the token set if a needed shade is missing.
- [x] Define the standard focus-visible treatment once (ring width, offset, colour) and reuse it from the primitives.
- [x] Document the token/primitive conventions briefly in `docs/architecture.md` (which classes/components to reach for first).

### 2. Shared UI Primitives (`components/ui/`)

Extract duplicates only where three or more call sites already repeat the same styling. Do not redesign while extracting — extract first, restyle later.

- [x] `Input`, `Textarea`, `Select`, and a `Field` wrapper (label + hint + error) with consistent sizing; adopt in all five forms above (done, plus `ServiceEditor.tsx` which repeated the same class string).
- [x] `Card` (border + background + radius + shadow) and use it for `SummaryCard`, `ServiceCard`, appointment groups, and detail panels.
- [x] `Badge` with the status variants the app actually uses (pending, confirmed, completed, cancelled) and a neutral variant; single source for admin list, detail, and customer history.
- [x] `PageHeader` (eyebrow + title + description + actions slot) — promoted from `app/components/` into `components/ui/`; now the standard header on admin dashboard, staff, services, settings, and appointment detail, plus the two public pages.
- [x] `EmptyState` (icon/illustration slot, title, body, optional action) and adopt it in admin list, customer history, services, and search results.
- [x] `SectionHeading` for consistent secondary headings on public pages (md for in-page groups, lg for landing sections, optional `description`/`actions`/`id` for `aria-labelledby`).
- [x] Keep `Button.tsx` API unchanged; only touch its internals if a token change forces it. (Untouched through Sections 1–2.)

### 3. Public Site Polish

- [x] Hero: fix the `formatHoursDays([])` bug to use real `closedWeekdays` from `BusinessSettings`; remove the hardcoded fallback address in favour of the existing DB fallback; refresh the visual (typography scale, spacing, the decorative glow) using tokens only.
- [x] Navbar: consistent height and active-link styling on desktop; a proper mobile menu state (accessible: aria-expanded, focus management, Escape closes) instead of whatever the current breakpoint collapse does.
- [x] Services page and `ServicesFilter`: aligned card grid (equal heights), category filter as a single consistent control style, clear selected state.
- [x] `ServiceCard`: visual hierarchy pass — category eyebrow, name, price prominence, duration; consistent card heights; consider a subtle hover lift consistent with `Card`.
- [x] Footer: tidy columns, consistent small-text treatment, business settings data unchanged.
- [x] Loading states: skeleton (not spinner-only) for `/appointments` and `/services` route-level `loading.tsx`, styled with tokens.
- [x] Review `error.tsx`, `not-found.tsx`, and `loading.tsx` so breakage states match the design language.

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

- [ ] `npm run lint`, `npx tsc --noEmit`, `npm run db:validate`, `npm run build` all pass.
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