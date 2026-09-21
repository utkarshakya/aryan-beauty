# Active Implementation Plan

> Moved from `docs/plan.md` into `docs/plans/` so that active, in-progress plans live
> together in one place.

This plan covers the first deployment of Unknown Beauty for one family-run
beauty parlour. Keep the product useful for this parlour before considering
multiple businesses, organizations, billing, or complex permissions.

## Current state — 11 September 2026

Completed product work:

- Clerk sign-in and database-backed user/customer records.
- Super-admin, admin, staff, and customer roles.
- Customer booking, appointment history, and eligible self-cancellation.
- Consolidated `/appointments` page; `/book` redirects there.
- Owner appointment dashboard at `/admin`.
- Owner service management: create, edit, activate, and deactivate services.
- Public and booking pages exclude inactive services.
- Business settings fully wired: `BusinessSettings` schema, migration, `lib/db/business.ts`, `app/actions/business.ts`, `/admin/settings` form. Booking availability reads per-weekday `openingHours`, `closedWeekdays`, `closures`, `slotIntervalMin`, `minBookingNoticeMin`, `timeZone` from DB. Cancellation cutoff uses `cancellationCutoffMin`. Marketing pages (Hero, Footer, EmptyServices, not-found, BookingForm) read from DB. `lib/business.ts` and `shared/` deleted.
- Service data improved: required field validation (name, price, duration), snapshot fields (`serviceName`, `servicePrice`, `serviceDurationMin`) on `Appointment` captured at booking time, all display components read snapshots, inactive services excluded from booking flows.

Completed safety corrections:

- Clerk profile webhooks preserve existing roles and disabled status.
- Ordinary authorization reads role and status from Prisma, not stale session
  metadata.
- The bootstrap-admin environment value creates an initial record only when
  missing; subsequent database status controls access.

Current repository note: the webhook parsing fix and service active-state fix
are committed (`04169b8`). Section 7 test suite (`npm run test`) and Vitest
infrastructure added, including a fix for customer self-cancellation (cancelMyAppointment
now resolves the `Customer` by `userId` instead of passing `User.id`).

## Next session starting point

Sections 1–5 complete (Section 4 now includes validation, snapshotting, and
inactive service handling). All features migrated from `features/` to target
structure. Dead files removed. Business settings fully implemented, wired into
booking/cancellation logic, and all marketing pages. `lib/business.ts` and
`shared/` deleted. Service snapshot fields on `Appointment` schema, migration,
booking flow, and all display components updated.

Next:

1. Section 7 (reliability and launch readiness) — tests, checklist, production
   review.

## Working order

### 1. Stabilize the current product

- [x] Run lint, typecheck, Prisma validation, and production build successfully.
- [x] Test the customer flow: sign in → book → refresh → upcoming/history →
  cancel.
- [x] Test owner flow: view appointment → confirm/cancel → manage services.
- [x] Verify disabled account behavior and each role's access.
- [x] Commit the current verified changes before future structural work.

### 2. Finish customer quality checks

- [x] Add an appointment empty state for a signed-in customer with no bookings.
- [x] Review all customer screens on phone, tablet, and desktop.
- [x] Check keyboard navigation, focus visibility, labels, and contrast.
- [x] Confirm cancellation cutoff messaging is understandable.

### 3. Simplify the codebase gradually

Target structure:

```text
app/          routes and Server Actions
components/   reusable UI
lib/          auth, configuration, and database access
prisma/       schema and migrations
```

- [x] Consolidate duplicate UI primitives into `components/ui`.
- [x] Move appointments from `features/` to `components/appointments`,
  `app/actions/appointments.ts`, and `lib/db/appointments.ts`.
- [x] Verify and remove the old appointment location.
- [x] Move services from `features/services-catalog/` to `components/services/`,
  `app/actions/services.ts`, and `lib/db/services.ts`.
- [x] Move customers from `features/customers/` to `components/customers/`,
  `app/actions/customers.ts`, and `lib/db/customers.ts`.
- [x] Move auth from `features/auth/` to `components/auth/` and `lib/auth/`.
- [x] Remove unused barrel exports and dead files only after imports are moved.

Do not perform a repository-wide move in one change.

### 4. Improve service data

- [x] Validate required name, category, price, and duration boundaries.
- [x] Snapshot service name, price, and duration on an appointment so later
  service edits do not rewrite historical records.
- [x] Confirm inactive services never appear in booking, while old
  appointments remain readable.

### 5. Business settings

- [x] Business name, phone, address, and time zone (schema + admin form).
- [x] Opening hours, closed weekdays, closures/holidays, and slot interval
  (schema + admin form; now read by booking logic).
- [x] Minimum booking notice and cancellation cutoff (schema + admin form;
  now read by booking/cancellation logic).
- [x] Replace `lib/business.ts` / `shared/config/business.ts` usage in
  `lib/db/appointments.ts` and `app/actions/appointments.ts` with
  `BusinessSettings` from the database.
- [x] Update `getAvailableSlots` to use per-weekday `openingHours`, skip
  `closedWeekdays` and dates in `closures`, and respect `minBookingNoticeMin`
  (current implementation only supports one global opening/closing hour).
- [x] Update the cancellation cutoff check to use `cancellationCutoffMin`
  (minutes) instead of `business.cancellationCutoffHours`.
- [x] Add marketing fields to `BusinessSettings` model (`tagline`, `description`,
  `phoneDisplay`, `phoneHref`, `addressLine2`) and wire into Hero, Footer,
  EmptyServices, not-found, BookingForm.
- [x] Delete `lib/business.ts` and `shared/config/business.ts` — no remaining
  imports.
- [x] Ensure updated settings affect new availability only, not existing
  visits.

### 6. Owner appointment workflow

- [x] Search by customer name/phone.
- [x] Date selector and filters with clear empty states.
- [x] Appointment detail view with useful customer contact/notes.
- [x] Explicit, validated status transitions and reversible cancellation.

#### 6.1 Completed appointments view — next owner-dashboard slice

Status: implemented and manually verified.

Goal: show past work truthfully without adding a manual “Mark completed” action
or a new stored status. A confirmed appointment whose `endTime` has passed is
displayed as `Completed`, while the database value remains `confirmed`.

Implementation:

- [x] Add `completed` to the admin status filter and tabs.
- [x] Query completed appointments with `status: "confirmed"` and
  `endTime < now`, without limiting the query to today.
- [x] Order completed appointments newest first.
- [x] Exclude appointments whose end time has passed from the “Upcoming today”
  section.
- [x] Add a distinct completed badge style.
- [x] Render no Confirm or Cancel actions for completed rows on mobile or
  desktop.
- [x] Keep the default tab as Pending and keep All today-focused.

Rules:

- Past pending appointments are not completed.
- Cancelled appointments remain cancelled.
- Do not add a Prisma enum, migration, or new server action.
- Do not change the customer-facing appointment history for this slice.

Acceptance checks:

- [x] A confirmed appointment ending in the past appears in Completed.
- [x] Completed includes appointments from previous dates.
- [x] A past pending appointment does not appear in Completed.
- [x] A cancelled appointment does not appear in Completed.
- [x] A finished appointment no longer appears in Upcoming today.
- [x] Completed rows have no destructive or confirmation controls.

#### 6.2 Appointment detail view

Status: implemented; lint, typecheck, Prisma validation, and production build
pass.

Goal: give the worker the full record — customer contact, service snapshot,
schedule, and booking notes — without changing the data model.

Implementation:

- [x] Add `getAppointmentById(id)` query in `lib/db/appointments.ts`.
- [x] Add guarded `getAdminAppointmentAction(id)` in `app/actions/appointments.ts`
  with `requireAdmin()` and completed-status display logic.
- [x] Add `app/admin/appointments/[id]/page.tsx` route with `notFound()` for
  invalid or missing ids.
- [x] Render `AppointmentDetail` with customer name/phone/email, service
  snapshot (name, duration, price), date/time, notes, and status badge.
- [x] Revalidate `/admin/appointments/[id]` on confirm/cancel so the detail
  screen stays current.
- [x] Link customer names on the admin list (mobile and desktop) to the
  detail view.

Rules:

- Access uses `requireAdmin`, matching the `/admin` dashboard.
- Completed (past confirmed) appointments show no Confirm or Cancel controls.
- No schema change, no new status, no cancellation-cutoff changes here.

Acceptance checks:

- [x] Opening any appointment row from `/admin` shows a full detail screen.
- [x] Detail shows customer contact, service snapshot, schedule, and notes.
- [x] Confirm/cancel from the detail screen updates both list and detail.
- [x] Unknown or non-numeric ids return 404.

#### 6.3 Search by customer name/phone

Status: implemented; lint, typecheck, and production build pass.

Goal: let the worker find any booking when they remember the person, not the
date. Search drops the today-anchor and matches across all dates/statuses,
loaded into the detail view from section 6.2.

Implementation:

- [x] `getAdminAppointments` accepts `search` and filters by customer
  `name` (case-insensitive) or `phone` (Postgres `contains`).
- [x] A search term switches the query off the today-anchor, orders newest
  first, and returns completed appointments too.
- [x] `/admin` reads `?search=`; search form preserves the active status tab
  via a hidden field only when a tab was explicitly chosen.
- [x] Status tabs preserve an active search term in their hrefs.
- [x] Dedicated empty state and result-count caption with a Clear search link.

Rules:

- No search term keeps existing today-anchored behaviour unchanged.
- Search combines with status tabs when one is active; defaults to all
  statuses on the default view.
- No schema change.

Acceptance checks:

- [x] Searching a customer name or partial phone finds matching appointments
  from any date.
- [x] Empty searches return a clear “no match” message with Clear search.
- [x] Tabs keep the active search; clearing keeps the active tab.
- [x] Plain `/admin` (no `?search=`) behaves exactly as before.

#### 6.4 Date selector and filter-aware empty states

Status: implemented; lint, typecheck, and production build pass.

Goal: browse any date or the full ledger, not just today, with empty states
that name the active view instead of a bare “No appointments”.

Implementation:

- [x] `getAdminAppointments` accepts an optional date window (`from`/`to`) and a
  `windowCompleted` flag; active search still overrides the date range.
- [x] `/admin` reads `?date=YYYY-MM-DD` (browse that day) and `?date=all`
  (full ledger, newest first); absent stays today-anchored.
- [x] Date view controls: Today / All dates pill links and a native date picker
  with a “View date” submit; links preserve active status and search.
- [x] Status tabs and search links preserve the active date.
- [x] List shows a scope caption (“Showing confirmed appointments for
  Friday, 12 Sep”) outside the default today view.
- [x] Empty state names the active view (“No pending appointments for all
  dates.”).

Rules:

- Completed tab keeps listing historical records on today/all views; only an
  explicitly picked date narrows it to that day.
- Today-anchored default behaviour with no params is unchanged.
- No schema change.

Acceptance checks:

- [x] Picking a past date shows that day’s appointments with actions intact.
- [x] All dates drops the today-anchor and orders newest first.
- [x] Filters and search survive switching between Today / All dates / tabs.
- [x] Empty views explain what and which date range returned nothing.

#### 6.5 Validated status transitions and reversible cancellation

Status: implemented; lint, typecheck, and production build pass.

Goal: make status changes explicit, safe, and undoable. Every transition is a
guarded `updateMany` (no race between check and write), and a cancelled
upcoming appointment can be restored to confirmed.

Transitions (enforced server-side):

- pending → confirmed (Confirm).
- pending → confirmed-now-past is allowed; a past confirmed appointment is
  displayed as Completed and can no longer be changed.
- Cancel allowed from pending or a confirmed appointment whose end time has
  not yet passed. Completed or cancelled rows are rejected.
- cancelled → confirmed (Restore), only while the appointment is still
  upcoming; past cancelled rows stay cancelled.

Implementation:

- [x] `lib/db/appointments.ts`: `confirmAppointment` guarded to `pending`;
  `adminCancelAppointment` guarded to `pending` or unexpired `confirmed`;
  `restoreAppointment` guarded to upcoming `cancelled`. All return whether
  the transition applied.
- [x] `app/actions/appointments.ts`: admin actions validate the id, call the
  helpers, revalidate list + detail, and return `{ ok, error }` on failure
  (Cancel and Restore). Confirm stays a void form action.
- [x] New `RestoreButton` client control with confirm dialog; shown for
  cancelled upcoming rows on list (mobile + desktop) and detail.
- [x] `CancelButton` surfaces the server error when a transition is rejected.

Rules:

- No manual “mark completed” action and no stored completed status; the
  DisplayStatus rule from 6.1 is unchanged.
- Double clicks / concurrent requests are no-ops, not corruptions.
- No schema change.

Acceptance checks:

- [x] Confirm a pending appointment works; re-submit is a silent no-op.
- [x] Cancel works for pending or upcoming confirmed; rejected for Completed
  and Cancelled.
- [x] Restore an upcoming cancelled appointment brings it back to Confirmed.
- [x] A cancelled appointment whose start time has passed cannot be restored.
- [x] Rejected transitions surface a message instead of silently failing.

### 7. Reliability and launch readiness

- [x] Add tests for authorization, disabled users, ownership, booking
  conflicts, cancellation cutoff, and inactive services.
- [x] Add a manual testing checklist to the README.
- [x] Review production environment values, Clerk redirects, backups, and
  account recovery. Findings: `NEXT_PUBLIC_CLERK_*_FALLBACK_REDIRECT_URL`
  pointed at a non-existent `/studio` route and `/admin`; corrected to
  `/auth/redirect` in `.env` and `.env.production`. `DIRECT_URL` intentionally
  absent from `.env.production` (migrations run locally). Supabase free tier
  auto-pause accepted by the owner.
- [ ] Test the complete flow on a real phone.

### 8. Staff management — last

- [x] Decide whether the owner may manage staff or only the super admin may. Implemented through the owner-admin staff workspace; granting Admin remains super-admin-only.
- [x] Invite/activate staff through Clerk and assign the `staff` role.
- [x] Disable/restore staff without deleting history.
- [x] Prevent creation or modification of super-admin access from the app.

## Explicitly postponed

- Multiple parlours, branches, or tenants.
- Clerk Organizations.
- Payments, subscriptions, advanced reports, AI, and automated reminders.
- Custom permission builders.
