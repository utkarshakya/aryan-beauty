# Active Implementation Plan

This plan covers the first deployment of Unknown Beauty for one family-run
beauty parlour. Keep the product useful for this parlour before considering
multiple businesses, organizations, billing, or complex permissions.

## Current state — 10 September 2026

Completed product work:

- Clerk sign-in and database-backed user/customer records.
- Super-admin, admin, staff, and customer roles.
- Customer booking, appointment history, and eligible self-cancellation.
- Consolidated `/appointments` page; `/book` redirects there.
- Owner appointment dashboard at `/admin`.
- Owner service management: create, edit, activate, and deactivate services.
- Public and booking pages exclude inactive services.
- Business settings fully wired: `BusinessSettings` schema, migration, `lib/db/business.ts`, `app/actions/business.ts`, `/admin/settings` form. Booking availability reads per-weekday `openingHours`, `closedWeekdays`, `closures`, `slotIntervalMin`, `minBookingNoticeMin`, `timeZone` from DB. Cancellation cutoff uses `cancellationCutoffMin`. Marketing pages (Hero, Footer, EmptyServices, not-found, BookingForm) read from DB. `lib/business.ts` and `shared/` deleted.

Completed safety corrections:

- Clerk profile webhooks preserve existing roles and disabled status.
- Ordinary authorization reads role and status from Prisma, not stale session
  metadata.
- The bootstrap-admin environment value creates an initial record only when
  missing; subsequent database status controls access.

Current repository note: the webhook parsing fix and service active-state fix
are verified but still uncommitted. Keep them separate from future structural
work.

## Next session starting point

Sections 1–5 complete. All features migrated from `features/` to target
structure. Dead files removed. Business settings fully implemented, wired into
booking/cancellation logic, and all marketing pages. `lib/business.ts` and
`shared/` deleted.

Next:

1. Section 4 (improve service data) — validation, snapshotting, inactive service handling.

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

- [ ] Validate required name, category, price, and duration boundaries.
- [ ] Snapshot service name, price, and duration on an appointment so later
  service edits do not rewrite historical records.
- [ ] Confirm inactive services never appear in booking, while old
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

- [ ] Search by customer name/phone.
- [ ] Date selector and filters with clear empty states.
- [ ] Appointment detail view with useful customer contact/notes.
- [ ] Explicit, validated status transitions and reversible cancellation.

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

### 7. Reliability and launch readiness

- [ ] Add tests for authorization, disabled users, ownership, booking
  conflicts, cancellation cutoff, and inactive services.
- [ ] Add a manual testing checklist to the README.
- [ ] Review production environment values, Clerk redirects, backups, and
  account recovery.
- [ ] Test the complete flow on a real phone.

### 8. Staff management — last

- [ ] Decide whether the owner may manage staff or only the super admin may.
- [ ] Invite/activate staff through Clerk and assign the `staff` role.
- [ ] Disable/restore staff without deleting history.
- [ ] Prevent creation or modification of super-admin access from the app.

## Explicitly postponed

- Multiple parlours, branches, or tenants.
- Clerk Organizations.
- Payments, subscriptions, advanced reports, AI, and automated reminders.
- Custom permission builders.
