# Mobile-first UI, UX, loading and error handling

Status: Phase 4 complete (DoD passed; manual verification pending). Next: Phase 5.
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

- [x] `components/ui/Toast.tsx`: provider mounted in root layout, `useToast()` hook, `aria-live`, max 3 stacked, auto-dismiss, token-based success/danger styling, bottom-center mobile (with safe-area) / bottom-right desktop, `motion-reduce` respected.
- [x] **Stacking rule:** toasts layer above page content but below the wizard's sticky action bar; while the bar is present, the toast tray offsets above it (or moves top on mobile) — never cover the Confirm button. Document z-index tiers in `architecture.md`.
- [x] Replace `window.alert` errors (CancelButton, RestoreButton) with toasts; toast success for row actions (confirm/cancel/restore, staff invite/disable, settings saved).
- [x] Replace `window.confirm` (4 sites) with `components/ui/Dialog.tsx` built on **native `<dialog>` + `showModal()`** (focus trap, Escape, backdrop, top-layer — all free); mobile-friendly layout, `motion-reduce`-safe close.
- [x] Keep contextual inline `FormBanner` for form-level messages; unify BookingForm's hand-rolled dismissible banner on the same pattern.

**Phase 2 DoD:** `lint` ✓ `typecheck` ✓ `test` ✓ (55 tests) `build` ✓ + served smoke (`/` 200, `/services` 200, unknown route 404; compiled CSS contains toast/dialog keyframes + `z-index:60`); zero `window.confirm`/`window.alert` matches repo-wide.


## Phase 3 — Booking flow → multi-step wizard

Split for reviewability: **3a** restructure with behavior unchanged, **3b** new interaction. Server contract unchanged throughout: `createAppointment` + `useActionState`; final step submits the same FormData.

**Phase 3a — Extract step shell (no behavior change) — DONE**
- [x] Split `components/appointments/BookingForm.tsx` (346 lines, not the 313 the first audit counted) into step components + a stepper/progress header shell; Back preserves state across steps; all existing fields/validation/success panel reachable exactly as today. Now: `BookingWizard.tsx` (shell — `useActionState`, all state, the single `<form>`, success branch) + `booking/{Stepper,StepService,StepSchedule,StepDetails,BookingSuccess}.tsx`.
- [x] Success panel: `dl` rows stack on narrow screens (was `flex justify-between gap-4`, now `flex flex-col sm:flex-row sm:justify-between`; desktop unchanged).
- [x] `BookAppointmentSection.tsx` becomes the expandable wizard shell; its dead `formRef` (attached, never read) is now wired to `scrollIntoView({ block: "nearest" })` on expand.
- **Forced deviation — native `required` is gone.** Steps unmount when inactive, so a `required` control on step 1 validates nothing at step 3. Replaced with an explicit `canAdvance` gate on Continue plus a `STEP_FOR_ERROR` map that routes a returned `serviceId`/`startTime`/`phone` error back to its owning step. The server remains the backstop; behaviour for a customer who fills the form in order is identical.
- **FormData contract unchanged:** a step's visible control carries no `name`; the shell mirrors `serviceId`/`startTime` as hidden inputs. `phone` keeps its real `name` (only autofillable field on the submit step). The date input's `name="date"` was never read server-side and is dropped.
- **Also in 3a (from the audit):** `app/actions/appointments.ts:24` re-exported the raw `getAvailableSlots` DB function and the UI imported *that* instead of the guarded `getAvailableSlotsAction` — the slot fetch ran with no auth check and the guard was dead code. Raw re-export deleted, wizard now calls the guarded action. Noted so 3b doesn't re-litigate it.
- **Deferred to 3b:** the date input's `min` is UTC-derived (`new Date().toISOString().split("T")[0]`), an off-by-one for IST. Fixing it needs the business `timeZone` threaded from the server page as a prop.
- **Bugs found in manual verification (both fixed):** (1) entering step 3 auto-submitted — `Continue` and `Confirm` occupied the same slot in the nav row, so React patched Continue's DOM node's `type` from `"button"` to `"submit"` mid-click and the browser ran the activation behaviour; fixed with distinct `key`s. (2) "Book another appointment" threw *"An async function with useActionState was called outside of a transition"* — the `useActionState` dispatch was called straight from `onClick`; fixed with `startTransition`. **Lesson for 3b:** never let two buttons share a nav slot across differing `type`s, and always wrap a direct `formAction` dispatch in `startTransition`.
- **Phase 3a DoD:** `lint` ✓ `typecheck` ✓ `test` ✓ (66 tests, +11 for `createAppointment` in `tests/actions/error-shape.test.ts`) `build` ✓. Note: `build` fails while `npm run dev` is running — the dev server writes `.next/dev/types/validator.ts` and the build's TS pass type-checks it. Stop the dev server first.

**Phase 3b — New interaction — DONE**
- [x] Step 1 **Service**: tappable card list instead of `<Select>` (single column, name left / price+duration right); `?serviceId` preselects and skips to step 2.
- [x] Step 2 **Date & time**: date input, then available slots as a tappable chip grid (`grid-cols-2 sm:grid-cols-3`, `min-h-[44px]` px-based targets); `SkeletonGroup` chips while loading; `EmptyState` ("No times available" → "Choose another date") and the existing error row with Retry.
- [x] Step 3 **Details & review**: phone field + `BookingSummary` (service/price/date/time) + sticky bottom Back/Confirm bar with safe-area padding on **all three steps** (deviation from "step 3 only", so the primary action never moves). Bar sets `--toast-inset-bottom` via `ResizeObserver`.
- [x] Shared picker primitive `components/ui/ChoiceCard.tsx` + new `focus-within-ring` utility: real `<input type="radio">` visually hidden inside its own `<label>`, selection/focus expressed on the card with `has-[:checked]:` + `focus-within-ring`. Native arrow-key navigation, no roving-tabindex code.
- [x] Preserve redirect across sign-in: `lib/auth/redirect.ts` (`sanitizeReturnTo`, `authFallbackRedirectUrl`) + `/auth/redirect` honours `returnTo`; sign-in/sign-up forward Clerk's `redirect_url` then `returnTo`. **The Clerk-dashboard prerequisite turned out to be unnecessary** — the allow-list is only consulted for URLs handed to the Clerk components, and the final hop is a server-side `redirect()` to a locally-validated path. Verified by reading the flow, not by a live sign-in.
- [x] Hardening: `?serviceId=abc` no longer auto-opens the wizard (`Number("abc")` is truthy `NaN`) — the id must now match an active service. Date `min` derives from the business `timeZone` instead of UTC (was an off-by-one for IST).
- **Test finding:** the first `sanitizeReturnTo` test run caught `/%2fevil.example.com` passing validation — a percent-encoded slash in the first segment decodes to a protocol-relative URL once anything normalises it. Fixed and covered. 24 tests in `tests/auth/redirect.test.ts`.
- **Phase 3b DoD:** `lint` ✓ `typecheck` ✓ `test` ✓ (88 tests) `build` ✓. Manual checks still owed on cards/chips/sticky bar and a real sign-in redirect.

## Phase 4 — Admin: sticky tab bar + dashboard rework in place — DONE

- [x] New `AdminTabBar` (`components/admin/AdminTabBar.tsx`) rendered from `app/admin/layout.tsx`: sticky under header (`top-14 sm:top-16` — both rem, so they track the reduced mobile root font exactly like `h-14`/`h-16`), horizontally scrollable row (Appointments / Services / Staff / Settings), active state via `usePathname` + `aria-current="page"`; at 320px: scroll, never wrap; hidden scrollbar with `px-1 py-1.5` so `overflow` cannot clip the 2px focus ring + 2px offset; ≥44px targets.
  - **Not** a plain prefix match: `startsWith("/admin")` would light the Appointments tab on every admin page, so that tab claims `/admin` and `/admin/appointments/*` explicitly. `isActivePath` was therefore *not* extracted from `NavbarClient.tsx` (it is wrong for this case).
  - `z-30` sits below the header's `z-40`, so an expanded mobile menu correctly covers the bar.
- [x] Remove the 3 duplicated nav `ButtonLink`s from the dashboard `PageHeader` (`app/admin/page.tsx:145-157` — the only site; the other admin pages used `backHref`, not nav buttons). Also dropped `backHref`/`backLabel` from services/staff/settings, which the tab bar now covers. `/admin/appointments/[id]` keeps its back link — it is a detail view below the dashboard, not a sibling section.
- [x] Dashboard filters collapse into an accessible "Filters" disclosure on mobile (`components/admin/AdminFilters.tsx`, button + `aria-expanded`/`aria-controls`, with a count of non-default filters so a hidden-but-active filter is visible). Always open from 640px up. Summary cards keep 2×2; card-view (`md:hidden`) / table (`md:block`) swap untouched.
  - **Caught in the compiled CSS before shipping:** the first version used `hidden={!open}` + `sm:block`, but Tailwind v4 preflight emits `[hidden]:where(:not([hidden=until-found])){display:none!important}` — `!important` beats any `sm:block`, so filters would have been *unreachable on every screen ≥640px* (the toggle is `sm:hidden`). Rewritten to `open ? "block" : "max-sm:hidden"` — mutually exclusive classes, no reliance on stylesheet order.
  - **Status pill nav lifted out of `AdminAppointmentsList` into `app/admin/page.tsx`** — it is pure links derived from URL params, so it renders fine server-side, and living in the client component is what made it impossible to group with the search/date filters under one disclosure. All filter values stay URL-driven; the disclosure owns only open state.
- [x] `ServiceForm.tsx:91` `grid-cols-2` → `grid-cols-1 sm:grid-cols-2` (plan's `:73` had drifted).
- [x] `BusinessSettingsForm` fixed px widths → responsive classes. `:296`'s `minWidth: "200px"` was the real overflow — a flex item's `min-width` is a hard floor, so it needs `min-w-0` to shrink at all; the row needed 380px in a 264px box.
- [x] `StaffTable` control cluster (plan's `:94`, actually `:133`): wraps at narrow widths, and the `Select` gets `w-full sm:w-32`. Root cause across the repo is `controls.tsx:8` baking `w-full` into every control. Same bug fixed in `AdminAppointmentsList`'s table action cluster (`:358`) — not in the plan, found during the audit.
- [x] Unify all 5 admin hand-rolled containers (`container mx-auto max-w-6xl px-3 sm:px-6`) onto shared `Container`; added `size="wide"` (`max-w-4xl`) for settings + appointment detail. Decision: adopt `Container`'s existing `sm:px-4`, which tightens admin's tablet+ gutter from 24px to 16px. Phase 5 settles the final rhythm.

**Phase 4 DoD:** `lint` ✓ `typecheck` ✓ `test` ✓ (90 tests) `build` ✓. Manual checks owed: tab bar scroll + active states at 320px across all five admin routes, and the Filters disclosure on mobile.

## Phase 5 — Public-site visual polish (token-driven, explicit DoD)

Each item is a checkbox with a checkable criterion — no "pass"-style entries.

- [x] **Type scale:** every heading/body/meta text uses the defined scale (`--text-*` + Fraunces display rule); no ad-hoc `text-[13px]` etc. remain outside `controls.tsx`. The desktop `sm:text-sm` control rule remains intentional to preserve the 16px mobile / 14px desktop form-control behavior.
- [x] **Section rhythm:** consistent vertical spacing between home sections (one spacing token per breakpoint, reused); hero/footer/service-card spacing on the same scale.
- [x] **Card density:** uniform padding + gap inside all public card variants (service cards, appointment cards, `SummaryCard`).
- [x] **Interactive states:** every button/link/card has hover + active (`active:` scale or tone shift) + focus-ring, all `motion-reduce`-safe.
- [x] **Button hierarchy:** one primary action per visual group; secondary/outline/ghost usage documented in `architecture.md`.
- [x] **Empty states:** every list/filter route uses `EmptyState` with title + body (+ action where sensible) — no bare "no results" text.
- [x] Appointment cards: padding + header stacking pass (AppointmentGroup.tsx:46-47).
- [x] Price-render cleanup: no redundant `Math.round()` calls remain at the price render sites; the referenced schema follow-ups plan is not present in this checkout. The remaining `Math.round()` is for cancellation-hours display, not price.

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
- New primitives + tokens to document in `docs/architecture.md`: `Skeleton`, `Toast`, `Dialog`, the multi-step-form pattern, `AdminTabBar`, motion tokens, toast z-index tiers; fix existing `prisma:studio` → `db:studio` drift while there.
- No new runtime npm dependencies; one dev-only a11y dependency allowed in Phase 6.
