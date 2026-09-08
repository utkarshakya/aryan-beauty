# Active Implementation Plan

This plan covers the first deployment of Unknown Beauty for one family-run
beauty parlour. Keep the product useful for this parlour before considering
multiple businesses, organizations, billing, or complex permissions.

## Current state — 7 September 2026

Completed product work:

- Clerk sign-in and database-backed user/customer records.
- Super-admin, admin, staff, and customer roles.
- Customer booking, appointment history, and eligible self-cancellation.
- Consolidated `/appointments` page; `/book` redirects there.
- Owner appointment dashboard at `/admin`.
- Owner service management: create, edit, activate, and deactivate services.
- Public and booking pages exclude inactive services.

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

Stabilization checks and manual QA in sections 1 and 2 are complete. Next:

1. Implement section **6.1 Completed appointments view** and complete every
   acceptance check in that section.
2. Only after that slice is verified, begin the gradual folder simplification
   in section 3. Move appointments first and keep each move independently
   verifiable.

Do not start business settings, staff management, or a repository-wide folder
move before these steps are complete.

## Working order

### 1. Stabilize the current product

- [x] Run lint, typecheck, Prisma validation, and production build successfully.
- [x] Test the customer flow: sign in → book → refresh → upcoming/history →
  cancel.
- [x] Test owner flow: view appointment → confirm/cancel → manage services.
- [x] Verify disabled account behavior and each role's access.
- [ ] Commit the current verified changes before future structural work.

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

- [ ] Consolidate duplicate UI primitives into `components/ui`.
- [ ] Move appointments from `features/` to `components/appointments`,
  `app/actions/appointments.ts`, and `lib/db/appointments.ts`.
- [ ] Verify and remove the old appointment location.
- [ ] Repeat for services, customers, then auth.
- [ ] Remove unused barrel exports and dead files only after imports are moved.

Do not perform a repository-wide move in one change.

### 4. Improve service data

- [ ] Validate required name, category, price, and duration boundaries.
- [ ] Snapshot service name, price, and duration on an appointment so later
  service edits do not rewrite historical records.
- [ ] Confirm inactive services never appear in booking, while old
  appointments remain readable.

### 5. Business settings

- [ ] Business name, phone, address, and time zone.
- [ ] Opening hours, closed weekdays, closures/holidays, and slot interval.
- [ ] Minimum booking notice and cancellation cutoff.
- [ ] Ensure updated settings affect new availability only, not existing visits.

### 6. Owner appointment workflow

- [ ] Search by customer name/phone.
- [ ] Date selector and filters with clear empty states.
- [ ] Appointment detail view with useful customer contact/notes.
- [ ] Explicit, validated status transitions and reversible cancellation.

#### 6.1 Completed appointments view — next owner-dashboard slice

Status: planned. This is the first owner-dashboard feature to implement after
the stabilization checks above.

Goal: show past work truthfully without adding a manual “Mark completed” action
or a new stored status. A confirmed appointment whose `endTime` has passed is
displayed as `Completed`, while the database value remains `confirmed`.

Implementation:

- [ ] Add `completed` to the admin status filter and tabs.
- [ ] Query completed appointments with `status: "confirmed"` and
  `endTime < now`, without limiting the query to today.
- [ ] Order completed appointments newest first.
- [ ] Exclude appointments whose end time has passed from the “Upcoming today”
  section.
- [ ] Add a distinct completed badge style.
- [ ] Render no Confirm or Cancel actions for completed rows on mobile or
  desktop.
- [ ] Keep the default tab as Pending and keep All today-focused.

Rules:

- Past pending appointments are not completed.
- Cancelled appointments remain cancelled.
- Do not add a Prisma enum, migration, or new server action.
- Do not change the customer-facing appointment history for this slice.

Acceptance checks:

- [ ] A confirmed appointment ending in the past appears in Completed.
- [ ] Completed includes appointments from previous dates.
- [ ] A past pending appointment does not appear in Completed.
- [ ] A cancelled appointment does not appear in Completed.
- [ ] A finished appointment no longer appears in Upcoming today.
- [ ] Completed rows have no destructive or confirmation controls.

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
