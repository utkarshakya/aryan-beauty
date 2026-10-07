# Mobile-first UI, UX, loading and error handling

Status: Phase 1 complete (DoD passed). Next: Phase 2.
Scope: whole app (public site, booking flow, admin), phased so each phase ships independently.
Decisions (locked): everything in one phased plan; restructure = multi-step booking wizard + admin sticky tab bar + dashboard reworked in place; custom lightweight toast (no new deps); ConfirmDialog = native `<dialog>` + `showModal()`; visual polish = token-driven pass with explicit DoD checklist; one dev-only a11y dep allowed in Phase 6; verify with Lighthouse mobile ≥90 plus a manual viewport checklist.

## Findings this plan is based on

**Mobile blockers**
- iOS focus-zoom on every field: inputs are `text-sm` (14px) and `html{font-size:93.75%}` (app/globals.css:66) drops them to ~13px; Safari auto-zooms <16px mid-booking.
- Tap targets: rem-based heights shrink with the root font — `min-h-11` (2.75rem) becomes **41.25px**, so all target fixes must use **px literals** (`min-h-[44px]`) or `min-h-12` (→45px). Current offenders: `ActionButton` `min-h-7` (~28px), `FilterPill` ~30px, hamburger 32px (app/components/NavbarClient.tsx:100), avatar 36px (app/components/AccountButton.tsx:100), error dismiss X 24px (components/appointments/BookingForm.tsx:188), plus not-yet-audited `ThemeToggle`, mobile-menu items, footer links, `PageHeader` back arrow, `Button` md, and the `ServiceCard` whole-card hit area.
- Rule: 44px applies to **standalone controls only**; inline text actions (`ActionButton` in a sentence) are exempt per WCAG 2.2 target size — do not blanket-apply.
- Grid inconsistency: home `sm:grid-cols-2` (app/components/ServicesPreview.tsx:23) vs `/services` `md:grid-cols-2` (app/components/ServicesFilter.tsx:69); home cards capped `max-w-[320px]` (ServicesPreview.tsx:27).
- `ServiceForm` price/minutes `grid-cols-2` with no breakpoint (components/services/ServiceForm.tsx:73); `BusinessSettingsForm` fixed px widths (components/business/BusinessSettingsForm.tsx:238,248,271,278); `StaffTable` control cluster cannot wrap (components/staff/StaffTable.tsx:94); no `env(safe-area-inset-bottom)` anywhere.

**Loading/error gaps**
- No `global-error.tsx`; root `app/error.tsx` exists but no segment-level boundaries for `(site)` or `admin`; only 2 of ~10 segments have real skeletons; zero `<Suspense>`; no admin loading/error files.
- Home (app/(site)/page.tsx:9-17) and `/services` (app/(site)/services/page.tsx:19-34) swallow DB errors into an empty "no services" state — failure looks like data.
- `try/finally` with no `catch` in ServiceForm.tsx:31-52, ServiceEditor.tsx:60-77 + 82-93, BusinessSettingsForm.tsx:80-106, AdminAppointmentsList.tsx:74-78, AppointmentDetail.tsx:55-59 — rejected actions show nothing. BookingForm.tsx:78-82 slot fetch has no `.catch()` → one throw permanently disables the time select.
- `window.alert` for errors (CancelButton.tsx:17, RestoreButton.tsx:21), `window.confirm` for destructive confirms (CancelButton.tsx:12, RestoreButton.tsx:16, CancelAppointmentButton.tsx:24, StaffTable.tsx:54). ServiceForm and BusinessSettingsForm drop `errors.form` silently.
- No error-logging convention: no decision on what gets `console.error`'d, `error.digest`, or what must never reach the UI.

**Form UX gaps**: no `autoComplete`/`inputMode`/`enterKeyHint` on phone/date fields; no submit-button loading/disabled state; no client-side pre-validation before the server round-trip; no `required` semantics.

**UX gaps**: one 313-line stacked booking form; admin nav = 3 buttons duplicated in every PageHeader (app/admin/page.tsx:142-154) and missing cross-links between sub-pages; dark-mode flash (ThemeToggle.tsx:25-33 applies class only in useEffect, no pre-hydration script); `?serviceId=` lost across sign-in (ServiceCard.tsx:27 → requireActiveUser redirect → app/auth/redirect/page.tsx:17) — **and Clerk only honors fallback redirects for URLs allow-listed in the dashboard (prerequisite)**; PageHeader back-arrow mojibake (components/ui/PageHeader.tsx:40); no motion language (durations/easing/reduced-motion policy undefined).

---

## Standing rules (apply to every phase)

- **Definition of done per phase:** `npm run lint` → `typecheck` → `build` pass before a phase is checked off. Phase 6 is a final sweep, not the first check.
- **Tap targets:** px literals (`min-h-[44px]`), standalone controls only.
- **No new runtime deps.** Dev-only a11y tooling allowed in Phase 6 only.

## Phase 0 — Foundations (primitives first) — DONE

- [x] iOS zoom fix: `components/ui/controls.tsx` → `text-[16px] sm:text-sm` (px value bypasses the root shrink on mobile only; desktop keeps 14px). Keep `html{font-size:93.75%}`.
- [x] Tap targets ≥44px via px values, standalone controls only. **Deviation:** rem-based `p-2.5 + h-6 w-6` still yields 41.25px under the root shrink, so all icon buttons use px boxes (`h-[44px] w-[44px]`): hamburger, avatar, ThemeToggle icon, BookingForm dismiss (`-my-2` to not inflate banner). Also fixed beyond original list: `Button` `min-h-11`→`min-h-[44px]`, `ActionButton` `min-h-7`→`min-h-[44px]` (all current usages are standalone), desktop+mobile nav links, Login link, account-menu items, footer links (via `inline-flex min-h-[44px] items-center`), `PageHeader` back link, checkbox labels in ServiceForm/ServiceEditor/BusinessSettingsForm, `ServiceCard` whole-card via stretched-link `after:absolute after:inset-0` (+`relative` on article).
- [x] Dark-mode pre-hydration script in `app/layout.tsx` (`dangerouslySetInnerHTML` + `suppressHydrationWarning`); `ThemeToggle.tsx` `useEffect` removed. **Note:** script sits as first child of `<body>` (App Router doesn't bless a manual `<head>`), verified in served HTML.
- [x] Motion tokens in `globals.css`: `--duration-fast/base` (120/180ms), `--ease-out`, `prefers-reduced-motion` kill-switch (animations/transitions → 0.01ms, incl. skeleton pulse). `body` transition now uses tokens.
- [x] New `components/ui/Skeleton.tsx` (`Skeleton` + `SkeletonGroup` with `role="status"`); both `loading.tsx` rebuilt on it.
- [x] Safe-area: `pb-safe` utility (`env(safe-area-inset-bottom, 0px)`) + `viewport: { viewportFit: "cover" }` export (prerequisite — verified in served meta). Applied to mobile menu + footer. Toast tray / tab bar / wizard bar get it when built in Phases 2/4/3.
- [x] Unify service grids: shared `app/components/serviceGrid.ts` (`grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3`) used by ServicesPreview, ServicesFilter, services skeleton; `max-w-[320px]` wrapper dropped.
- [x] PageHeader back arrow: `←` char → inline SVG arrow (byte-level check showed the char was valid UTF-8; SVG removes any encoding ambiguity) + 44px hit area.
- [x] `Field.tsx`: `aria-describedby` (hint id when no error), `aria-errormessage` (error id) wired on the control; ids on hint/error `<p>`s. Hint stays visible when an error shows (ARIA wiring changes, rendering doesn't).
- [x] **DoD passed:** `typecheck` ✓ `lint` ✓ `build` ✓ + served-HTML smoke test (theme script, viewport-fit, 16px/duration/safe-area/reduced-motion all in compiled CSS).

## Phase 1 — Loading & error handling

- [x] Add `app/global-error.tsx` (root-layout failures currently fall to Next's default page). Own `<html>/<body>` + re-imports `globals.css`, font variable, and theme init script (Next 16.3: global-error gets no global styles automatically).
- [x] Add segment `error.tsx` for `(site)` and `admin` — friendly copy + retry via `retry()` (stable in Next 16.3); the admin one must render inside the admin shell so navigation survives a crash. (Root `app/error.tsx` exists — do not duplicate it; refactor it onto the shared `ErrorState`.)
- [x] Add `not-found.tsx` for `/admin/appointments/[id]` (renders inside the admin shell; `EmptyState` + back-to-dashboard link).
- [x] Error-logging convention: every boundary and catch logs `console.error` with route context; server errors carry `digest`; never render `error.message`/stack in production UI (generic copy + digest reference). Documented in `docs/architecture.md` ("Error Handling and Logging") + shared helpers in `lib/errors.ts`.
- [x] Stop swallowing: home + `/services` remove catch-to-empty and throw into `error.tsx`.
- [x] Loading skeletons for every admin route (dashboard, services, staff, settings + appointment detail — detail added beyond the original 4) — today they get only the generic root spinner.
- [x] Client `catch` in **all 10 catch-less handlers** (original 6 + CancelButton, RestoreButton, WalkInCustomerLinker, StaffTable's bare await — the latter 4 were missed in the first audit) → set a form-level error / inline banner; BookingForm slot fetch gets `.catch()` → error row with "Retry" (fixes permanently-disabled select).
- [x] Server actions: wrap unwrapped DB writes (services.ts, business.ts, customers.ts + appointment mutations) in try/catch returning the generic `errors.form` message; each action **keeps its existing return shape** (no cross-shape conversion — `{ ok, error }` → `{ errors, success }` conversion is deferred to Phase 2 where consumers get reworked).
- [x] **Vitest coverage for the standardized server-action error shape** (only automatable part of this plan; uses existing DB test setup) — `tests/actions/error-shape.test.ts`, 16 tests incl. sentinel-leak assertions.
- [x] Form UX baseline: `autoComplete="tel"`/`inputMode="tel"`/`enterKeyHint` on phone, sensible attrs on date fields; submit button loading/disabled state while action pending (audited — already present everywhere async); client-side phone pre-validation before server round-trip (BookingForm + CustomerProfileForm); `required` semantics (audited).
- [x] Render `errors.form` in ServiceForm + BusinessSettingsForm (moved here from Phase 2 — without it the new catches display nothing).
- Out of scope (by decision): Suspense/streaming restructure — pages keep direct awaits + segment `loading.tsx`.

**Phase 1 DoD:** `lint` ✓ `typecheck` ✓ `test` ✓ (55 tests) `build` ✓ + served smoke (`/` 200, `/services` 200, unknown route 404).

## Phase 2 — Feedback layer (custom toast, no new deps)

- [ ] `components/ui/Toast.tsx`: provider mounted in root layout, `useToast()` hook, `aria-live`, max 3 stacked, auto-dismiss, token-based success/danger styling, bottom-center mobile (with safe-area) / bottom-right desktop, `motion-reduce` respected.
- [ ] **Stacking rule:** toasts layer above page content but below the wizard's sticky action bar; while the bar is present, the toast tray offsets above it (or moves top on mobile) — never cover the Confirm button. Document z-index tiers in `architecture.md`.
- [ ] Replace `window.alert` errors (CancelButton, RestoreButton) with toasts; toast success for row actions (confirm/cancel/restore, staff invite/disable, settings saved).
- [ ] Replace `window.confirm` (4 sites) with `components/ui/Dialog.tsx` built on **native `<dialog>` + `showModal()`** (focus trap, Escape, backdrop, top-layer — all free); mobile-friendly layout, `motion-reduce`-safe close.
- [ ] Keep contextual inline `FormBanner` for form-level messages; unify BookingForm's hand-rolled dismissible banner on the same pattern.


## Phase 3 — Booking flow → multi-step wizard

Split for reviewability: **3a** restructure with behavior unchanged, **3b** new interaction. Server contract unchanged throughout: `createAppointment` + `useActionState`; final step submits the same FormData.

**Phase 3a — Extract step shell (no behavior change)**
- [ ] Split `components/appointments/BookingForm.tsx` (313 lines) into step components + a stepper/progress header shell; Back preserves state across steps; all existing fields/validation/success panel reachable exactly as today.
- [ ] Success panel: `dl` rows stack on narrow screens (BookingForm.tsx:114-129 currently fights label vs long date string at 320–360px).
- [ ] `BookAppointmentSection.tsx` becomes the expandable wizard shell.

**Phase 3b — New interaction**
- [ ] Step 1 **Service**: tappable card list instead of `<Select>`; `?serviceId` preselects and skips to step 2.
- [ ] Step 2 **Date & time**: date input, then available slots as a tappable chip grid (≥44px px-based targets); skeleton chips while loading; empty state ("no times available" → suggest another date) and error state with Retry.
- [ ] Step 3 **Details & review**: phone field + sticky summary (service/price/date/time) + sticky bottom Back/Confirm bar with safe-area padding (z-index per Phase 2 stacking rule).
- [ ] Preserve redirect across sign-in: generalize to full `path + query` (`returnTo` pattern) captured as Clerk's return target and forwarded in `app/auth/redirect/page.tsx`. **Prerequisite:** add the callback URL to Clerk's allowed-redirect-urls dashboard config; verify on a real sign-in.

## Phase 4 — Admin: sticky tab bar + dashboard rework in place

- [ ] New `AdminTabBar` rendered from `app/admin/layout.tsx`: sticky under header (`top-14 sm:top-16`), horizontally scrollable row (Appointments / Services / Staff / Settings), active state via `usePathname` + `aria-current="page"`; at 320px: scroll, never wrap; scroll affordance (edge fade or hidden scrollbar with padding); ≥44px px-based targets.
- [ ] Remove the 3 duplicated nav `ButtonLink`s from every admin PageHeader (app/admin/page.tsx:142-154 and equivalents); keep page-specific actions (e.g. "New service").
- [ ] Dashboard rework in place (app/admin/page.tsx): search/date/status filters collapse into an accessible "Filters" disclosure on mobile (button + `aria-expanded`/`aria-controls`); summary cards keep 2×2; existing card-view (`md:hidden`, AdminAppointmentsList.tsx:167) / table (`md:block`, :272) swap stays; density/spacing pass.
- [ ] `ServiceForm.tsx:73` `grid-cols-2` → `grid-cols-1 sm:grid-cols-2`.
- [ ] `BusinessSettingsForm` fixed px widths (100px/180px/200px) → responsive classes.
- [ ] `StaffTable.tsx:94` control cluster: allow wrapping at narrow widths.
- [ ] Unify admin hand-rolled containers (`container mx-auto max-w-6xl px-3 sm:px-6`) onto shared `Container`.

## Phase 5 — Public-site visual polish (token-driven, explicit DoD)

Each item is a checkbox with a checkable criterion — no "pass"-style entries.

- [ ] **Type scale:** every heading/body/meta text uses the defined scale (`--text-*` + Fraunces display rule); no ad-hoc `text-[13px]` etc. remain outside `controls.tsx`.
- [ ] **Section rhythm:** consistent vertical spacing between home sections (one spacing token per breakpoint, reused); hero/footer/service-card spacing on the same scale.
- [ ] **Card density:** uniform padding + gap inside all card variants (`Card`, service cards, appointment cards, `SummaryCard`).
- [ ] **Interactive states:** every button/link/card has hover + active (`active:` scale or tone shift) + focus-ring, all `motion-reduce`-safe.
- [ ] **Button hierarchy:** one primary action per visual group; secondary/outline/ghost usage documented in `architecture.md`.
- [ ] **Empty states:** every list/filter route uses `EmptyState` with title + body (+ action where sensible) — no bare "no results" text.
- [ ] Appointment cards: padding + header stacking pass (AppointmentGroup.tsx:46-47).
- [ ] *Blocked on `docs/plans/schema-review-followups.md`:* drop redundant `Math.round()` at the 7 price render sites.

## Phase 6 — Verification

- [ ] `npm run db:validate` → `typecheck` → `lint` → `test` → `build`.
- [ ] **Add one dev-only a11y tool** (choose at this point: `@axe-core/cli` or Lighthouse CI with a stored config) and run it against `/` and `/services`.
- [ ] Lighthouse mobile ≥90 on `/` and `/services`, measured against the known Clerk `prefetchUI` ceiling (that avenue stays closed — no headless-Clerk redesign).
- [ ] Manual matrix at 320 / 390 / 768 px, dark + light:
  - no focus-zoom on any input; tap targets ≥44px (standalone controls);
  - keyboard-only pass: skip-link works, logical focus order, focus visible on every interactive element, heading hierarchy sane, contrast spot-check on muted/surface text;
  - wizard happy path, Back preserves state, slot-load error → Retry works;
  - admin tab bar active states + scroll at 320px;
  - no dark-mode flash on load;
  - toast never covers the sticky action bar; ConfirmDialog focus trap/Escape/backdrop behaviour.
- [ ] Real-phone pass stays the separate pre-launch item (tracked in `docs/product.md`).

## Sequencing & notes

- Phase order is ship-as-you-go: 0 → 1 → 2 are safe refactors; 3a → 3b and 4 are the restructures; 5 is polish. Run the standing-rules DoD after each.
- No overlap with `docs/plans/schema-review-followups.md` (except the blocked Phase 5 price-render cleanup).
- New primitives + tokens to document in `docs/architecture.md`: `Skeleton`, `Toast`, `Dialog`, `AdminTabBar`, motion tokens, toast z-index tiers; fix existing `prisma:studio` → `db:studio` drift while there.
- No new runtime npm dependencies; one dev-only a11y dependency allowed in Phase 6.
