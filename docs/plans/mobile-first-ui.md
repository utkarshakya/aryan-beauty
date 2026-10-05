# Mobile-first UI, UX, loading and error handling

Status: not started
Scope: whole app (public site, booking flow, admin), phased so each phase ships independently.
Decisions (locked): everything in one phased plan; restructure = multi-step booking wizard + admin sticky tab bar + dashboard reworked in place; custom lightweight toast (no new deps); verify with Lighthouse mobile ≥90 plus a manual viewport checklist.

## Findings this plan is based on

**Mobile blockers**
- iOS focus-zoom on every field: inputs are `text-sm` (14px) and `html{font-size:93.75%}` (app/globals.css:66) drops them to ~13px; Safari auto-zooms <16px mid-booking.
- Sub-44px tap targets: `ActionButton` `min-h-7` (~28px), `FilterPill` ~30px, hamburger 32px (app/components/NavbarClient.tsx:100), avatar 36px (app/components/AccountButton.tsx:100), error dismiss X 24px (components/appointments/BookingForm.tsx:188) — all shrunk further by the root font shrink.
- Grid inconsistency: home `sm:grid-cols-2` (app/components/ServicesPreview.tsx:23) vs `/services` `md:grid-cols-2` (app/components/ServicesFilter.tsx:69); home cards capped `max-w-[320px]` (ServicesPreview.tsx:27).
- `ServiceForm` price/minutes `grid-cols-2` with no breakpoint (components/services/ServiceForm.tsx:73); `BusinessSettingsForm` fixed px widths (components/business/BusinessSettingsForm.tsx:238,248,271,278); `StaffTable` control cluster cannot wrap (components/staff/StaffTable.tsx:94); no `env(safe-area-inset-bottom)` anywhere.

**Loading/error gaps**
- No `global-error.tsx`; only 2 of ~10 segments have real skeletons; zero `<Suspense>`; no admin loading/error files.
- Home (app/(site)/page.tsx:9-17) and `/services` (app/(site)/services/page.tsx:19-34) swallow DB errors into an empty "no services" state — failure looks like data.
- `try/finally` with no `catch` in ServiceForm.tsx:31-52, ServiceEditor.tsx:60-77 + 82-93, BusinessSettingsForm.tsx:80-106, AdminAppointmentsList.tsx:74-78, AppointmentDetail.tsx:55-59 — rejected actions show nothing. BookingForm.tsx:78-82 slot fetch has no `.catch()` → one throw permanently disables the time select.
- `window.alert` for errors (CancelButton.tsx:17, RestoreButton.tsx:21), `window.confirm` for destructive confirms (CancelButton.tsx:12, RestoreButton.tsx:16, CancelAppointmentButton.tsx:24, StaffTable.tsx:54). ServiceForm and BusinessSettingsForm drop `errors.form` silently.

**UX gaps**: one 313-line stacked booking form; admin nav = 3 buttons duplicated in every PageHeader (app/admin/page.tsx:142-154); dark-mode flash (ThemeToggle.tsx:25-33 applies class only in useEffect, no pre-hydration script); `?serviceId=` lost across sign-in (ServiceCard.tsx:27 → requireActiveUser redirect → app/auth/redirect/page.tsx:17); PageHeader back-arrow mojibake (components/ui/PageHeader.tsx:40).

---

## Phase 0 — Foundations (primitives first)

- [ ] iOS zoom fix: `components/ui/controls.tsx` → `text-[16px] sm:text-sm` (px value bypasses the root shrink on mobile only; desktop keeps 14px). Keep `html{font-size:93.75%}`.
- [ ] Tap targets ≥44px: `ActionButton` `min-h-11`; `FilterPill` mobile `min-h-11` centered; hamburger `p-2.5` + `h-6 w-6`; avatar `p-2 h-8 w-8`; BookingForm dismiss button `p-2`.
- [ ] New `components/ui/Skeleton.tsx` primitive; rebuild `app/(site)/services/loading.tsx` and `app/(site)/appointments/loading.tsx` on it.
- [ ] Safe-area: `env(safe-area-inset-bottom)` padding on mobile menu, toast tray, sticky tab bar, wizard action bar.
- [ ] Unify service grids + skeleton on one class pattern; drop home's `max-w-[320px]` wrapper.
- [ ] Fix PageHeader back-arrow mojibake (PageHeader.tsx:40).
- [ ] `Field.tsx`: wire `aria-describedby` to hint/error paragraphs.

## Phase 1 — Loading & error handling

- [ ] Add `app/global-error.tsx` (root-layout failures currently fall to Next's default page).
- [ ] Add `error.tsx` for `(site)` and `admin` segments — friendly copy + retry via `reset()`; the admin one must render inside the admin shell so navigation survives a crash.
- [ ] Add `not-found.tsx` for `/admin/appointments/[id]`.
- [ ] Stop swallowing: home + `/services` remove catch-to-empty and throw into `error.tsx`.
- [ ] Loading skeletons for every admin route (dashboard, services, staff, settings) — today they get only the generic root spinner.
- [ ] Client `catch` in all 6 `try/finally` handlers → set a form-level error; BookingForm slot fetch gets `.catch()` → error row with "Retry" (fixes permanently-disabled select).
- [ ] Server actions: wrap unwrapped DB writes (services.ts, business.ts, customers.ts) in try/catch returning `errors.form` = generic message; standardize on the `{ errors, success }` shape.
- [ ] Out of scope: Suspense/streaming restructure — pages keep direct awaits + segment `loading.tsx`.

## Phase 2 — Feedback layer (custom toast, no new deps)

- [ ] `components/ui/Toast.tsx`: provider mounted in root layout, `useToast()` hook, `aria-live`, max 3 stacked, auto-dismiss, token-based success/danger styling, bottom-center mobile (with safe-area) / bottom-right desktop, `motion-reduce` respected.
- [ ] Replace `window.alert` errors (CancelButton, RestoreButton) with toasts; toast success for row actions (confirm/cancel/restore, staff invite/disable, settings saved).
- [ ] Replace `window.confirm` (4 sites) with a small `ConfirmDialog` primitive (focus-trapped, mobile-friendly, Escape/backdrop dismiss).
- [ ] Keep contextual inline `FormBanner` for form-level messages; unify BookingForm's hand-rolled dismissible banner on the same pattern.
- [ ] `errors.form` display in ServiceForm + BusinessSettingsForm (currently dropped).

## Phase 3 — Booking flow → multi-step wizard

Restructure `components/appointments/BookingForm.tsx` (313 lines). Server contract unchanged: `createAppointment` + `useActionState` stays; final step submits the same FormData.

- [ ] Step 1 **Service**: tappable card list instead of `<Select>`; `?serviceId` preselects and skips to step 2.
- [ ] Step 2 **Date & time**: date input, then available slots as a tappable chip grid (better than native select on phones); skeleton chips while loading; empty state ("no times available" → suggest another date) and error state with Retry.
- [ ] Step 3 **Details & review**: phone field + sticky summary (service/price/date/time) + sticky bottom Back/Confirm bar with safe-area padding.
- [ ] Stepper/progress header; Back preserves state across steps.
- [ ] Success panel: `dl` rows stack on narrow screens (BookingForm.tsx:114-129 currently fights label vs long date string at 320–360px).
- [ ] Preserve `?serviceId=` across sign-in: capture the full URL as Clerk's return target and forward searchParams in `app/auth/redirect/page.tsx`.
- [ ] `BookAppointmentSection.tsx` becomes the expandable wizard shell.

## Phase 4 — Admin: sticky tab bar + dashboard rework in place

- [ ] New `AdminTabBar` rendered from `app/admin/layout.tsx`: sticky under header (`top-14 sm:top-16`), horizontally scrollable row (Appointments / Services / Staff / Settings), active state via `usePathname`.
- [ ] Remove the 3 duplicated nav `ButtonLink`s from every admin PageHeader (app/admin/page.tsx:142-154 and equivalents); keep page-specific actions (e.g. "New service").
- [ ] Dashboard rework in place (app/admin/page.tsx): search/date/status filters collapse into a "Filters" disclosure on mobile; summary cards keep 2×2; existing card-view (`md:hidden`, AdminAppointmentsList.tsx:167) / table (`md:block`, :272) swap stays; density/spacing pass.
- [ ] `ServiceForm.tsx:73` `grid-cols-2` → `grid-cols-1 sm:grid-cols-2`.
- [ ] `BusinessSettingsForm` fixed px widths (100px/180px/200px) → responsive classes.
- [ ] `StaffTable.tsx:94` control cluster: allow wrapping at narrow widths.
- [ ] Unify admin hand-rolled containers (`container mx-auto max-w-6xl px-3 sm:px-6`) onto shared `Container`.

## Phase 5 — Public-site polish + dark mode

- [ ] Dark-mode pre-hydration script in `app/layout.tsx` (`dangerouslySetInnerHTML` + `suppressHydrationWarning`); refactor `ThemeToggle.tsx` to stop re-applying the class in `useEffect`.
- [ ] Appointment cards: padding + header stacking pass (AppointmentGroup.tsx:46-47).
- [ ] Hero/footer/service-card spacing and type rhythm pass.
- [ ] If schema plan is already live: drop redundant `Math.round()` at the 7 price render sites.

## Phase 6 — Verification

- [ ] `npm run db:validate` → `typecheck` → `lint` → `test` → `build`.
- [ ] Lighthouse mobile ≥90 on `/` and `/services`, measured against the known Clerk `prefetchUI` ceiling (that avenue stays closed — no headless-Clerk redesign).
- [ ] Manual matrix at 320 / 390 / 768 px, dark + light:
  - no focus-zoom on any input; tap targets ≥44px;
  - wizard happy path, Back preserves state, slot-load error → Retry works;
  - admin tab bar active states + scroll;
  - no dark-mode flash on load;
  - toast and ConfirmDialog keyboard/ARIA behaviour.
- [ ] Real-phone pass stays the separate pre-launch item (tracked in `docs/product.md`).

## Sequencing & notes

- Phase order is ship-as-you-go: 0 → 1 → 2 are safe refactors; 3 and 4 are the two restructures; 5 is polish.
- No overlap with `docs/plans/schema-review-followups.md` (except the optional Phase 5 price-render cleanup).
- New primitives to document in `docs/architecture.md`: `Skeleton`, `Toast`, `ConfirmDialog`, `AdminTabBar`.
- No new npm dependencies.
