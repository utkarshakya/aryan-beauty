# Booking Correctness, Data Access, and UI Polish Plan

**Repository:** `utkarshakya/aryan-beauty`  
**Working branch:** `ai/ui-polishing`  
**Reference branch:** `develop` (read-only; do not commit to it)  
**Protected branch:** `main` (do not inspect for implementation or modify)  
**Status:** Proposed sequence — implementation has not started

## Goal

Improve the reliability and responsiveness of the live salon application without rewriting its architecture. Resolve confirmed booking correctness/data-integrity issues first, reduce unnecessary database work second, and then complete the public-site visual polish already planned in `docs/plans/mobile-first-ui.md`.

This plan extends—not replaces—these existing plans:

- `docs/plans/data-access-layer.md` — request-level query deduplication and bounded reads.
- `docs/plans/mobile-first-ui.md` — Phases 0–4 are marked complete; Phase 5 public-site polish and Phase 6 verification remain.
- `docs/plans/aryan-beauty-repository-aware-ui-plan.md` — preserve the existing design system and make targeted UI changes.

## Non-negotiable constraints

- All implementation commits and edits must stay on `ai/ui-polishing`.
- Never modify `main` or `develop`; `develop` is reference-only.
- Preserve the single Next.js full-stack architecture, Clerk authentication, role/ownership checks, current booking rules, existing server-action contracts, and current design tokens.
- Do not add API routes or client-side fetches to access this same app's database.
- Do not introduce cross-request caching for user-specific data.
- No new runtime dependencies unless a later, separately reviewed need is demonstrated.
- Do not mark a phase complete until its automated checks pass. Distinguish code-inspection hypotheses from verified defects.

## Phase 0 — Establish a reproducible baseline

- [ ] Confirm the current branch is `ai/ui-polishing` and record its starting commit before implementation.
- [ ] Run the existing scripts: `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`; record failures that already exist.
- [ ] Read the existing booking slot generation, appointment mutation/transaction, business-settings validation, and current tests before choosing implementation details.
- [ ] Add deterministic tests for the current booking contract before changing behavior:
  - opening and closing boundaries;
  - slot interval and minimum booking notice;
  - configured business time zone differing from the server's time zone;
  - appointment overlap and cancelled appointments;
  - ownership, role restrictions, and cancellation cutoff.
- [ ] Capture the existing behavior of cancelled future appointments in the customer history/upcoming split.
- [ ] Do not fix unrelated failures silently; record them and keep scope controlled.

**Exit criteria:** baseline results are recorded, the existing business rules are explicit, and new tests reproduce any confirmed time-zone or concurrency defect.

## Phase 1 — Booking time-zone correctness

**Why first:** incorrectly interpreted opening hours or dates can expose the wrong slots or reject valid bookings.

- [ ] Trace how business-local dates/opening hours become instants in `lib/db/appointments.ts`, and how the action validates a submitted slot in `app/actions/appointments.ts`.
- [ ] Define one explicit rule: opening hours, closed weekdays, closure dates, booking dates, and dashboard “today” are interpreted in the configured business time zone; persisted appointment timestamps remain instants.
- [ ] Use a time-zone-aware conversion approach compatible with the current dependencies/runtime. Do not rely on the server process's local time zone.
- [ ] Ensure the slot value passed from the client remains the existing opaque UTC/ISO value and that server-side availability is still authoritative.
- [ ] Cover daylight-saving transitions for supported time zones where applicable; at minimum test a business zone that differs from the test runner's zone.
- [ ] Update dashboard date filtering to use the business-local calendar day if the baseline confirms it currently uses the server-local date.
- [ ] Keep the current slot interval, notice, closure, overlap, and cancellation rules unchanged unless a test reveals an existing inconsistency that requires an explicit decision.

**Exit criteria:** deterministic tests pass under a server time zone different from the configured business time zone; displayed slots and server-side validation agree.

## Phase 2 — Prevent double booking under concurrency

**Why second:** a preflight availability check alone is not sufficient protection against simultaneous booking requests.

- [ ] Document the exact overlap rule and whether appointments can overlap for different services/staff. Match the existing product behavior; do not assume staff-specific scheduling exists.
- [ ] Reproduce the race with a test that attempts two conflicting bookings concurrently against PostgreSQL (or the closest reliable integration test available).
- [ ] Choose and document a database-safe strategy before implementing it. Evaluate a transaction/locking strategy and, if compatible with the current schema and business rules, a PostgreSQL constraint or exclusion constraint backed by a migration.
- [ ] Keep a friendly, stable conflict response for the losing request; do not expose raw database errors.
- [ ] Ensure cancellation and other status changes interact correctly with the chosen protection, particularly cancelled appointments.
- [ ] Add regression tests for concurrent conflicts, non-overlapping bookings, cancelled appointments, and transaction rollback.
- [ ] If the chosen guarantee requires a schema migration, include the migration and test it against the project's supported PostgreSQL setup before deployment.

**Exit criteria:** conflicting simultaneous requests cannot both create active overlapping appointments under the documented rule; normal bookings and cancellations still work.

## Phase 3 — Data-access deduplication and bounded reads

Build on `docs/plans/data-access-layer.md`; do not duplicate its work.

- [ ] Use React `cache()` for request-scoped deduplication of the raw `getAppUserAccess`, `getBusinessSettingsOrCreate`, and `getActiveServices` reads where the existing plan specifies.
- [ ] Keep authorization checks in every externally callable Server Action. Request-level memoization is an optimization, not a replacement for authorization.
- [ ] Replace unbounded customer appointment loading with database-filtered, bounded upcoming/history helpers keyed by app-user ID.
- [ ] Preserve the behavior that a cancelled future appointment appears in history and does not appear as upcoming.
- [ ] Remove unnecessary relation includes where denormalized appointment fields already supply the UI.
- [ ] Move inline Prisma reads from `app/(site)/appointments/page.tsx` into `lib/db/`; reuse the active-services helper on homepage and services page.
- [ ] Keep the existing invalid `serviceId`/NaN guard and all current ownership/eligibility rules.
- [ ] Remove unused helpers/actions only after searching the entire repository for callers and confirming no route, test, or external action depends on them.
- [ ] Do not add cross-request caching, API routes, or client-side fetches as part of this phase.

**Exit criteria:** behavior-parity tests pass; reads are bounded; lint, typecheck, tests, and build pass; query logs or equivalent evidence confirm duplicate reads have decreased.

## Phase 4 — Business-settings validation and authorization review

- [ ] Validate settings server-side before writing: JSON shape, opening/closing time format and ordering, weekday values, closure dates, time-zone identifier, and existing numeric bounds.
- [ ] Reject malformed or invalid settings with a clear field/form error; do not silently convert malformed JSON to empty defaults and save it.
- [ ] Add tests for valid settings, malformed JSON, invalid times, invalid weekdays/dates/time zones, and numeric boundaries.
- [ ] Review each Server Action's authorization at the action boundary. Retain checks for active users, owners/admins, staff, customer ownership, and role changes as appropriate.
- [ ] Keep webhook signature verification and role-assignment trust boundaries intact.
- [ ] Avoid broad auth refactoring; make only changes justified by a failing test or a clearly duplicated request-scoped read.

**Exit criteria:** invalid settings cannot be persisted, valid settings continue to work, and authorization regression tests pass.

## Phase 5 — Public-site visual polish

Continue the existing Phase 5 of `docs/plans/mobile-first-ui.md` and `docs/plans/aryan-beauty-repository-aware-ui-plan.md` only after the correctness work is stable.

- [ ] Polish homepage hero hierarchy, value proposition, and primary booking action using real business settings and existing content.
- [ ] Improve service card hierarchy and spacing while reusing the shared service grid and UI primitives.
- [ ] Make targeted typography, spacing, and theme consistency fixes using existing tokens; avoid a competing design system.
- [ ] Check responsive header/footer and avoid horizontal overflow on mobile.
- [ ] Regression-check the booking wizard, customer appointment views, and admin screens without rebuilding completed structures.
- [ ] Do not invent testimonials, ratings, awards, business claims, or imagery that is not already approved and available.
- [ ] Preserve accessible focus states, 44px standalone control targets, safe-area behavior, and reduced-motion handling.

**Exit criteria:** existing routes and interactions work; mobile and desktop layouts are coherent in light/dark themes; no booking/admin regression is introduced.

## Phase 6 — Final verification

- [ ] Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.
- [ ] Run focused booking integration tests, including time-zone and concurrent-booking cases.
- [ ] Manually test: browse services, sign in, book a slot, attempt a conflicting booking, view appointment history, cancel an eligible appointment, and verify admin appointment/settings/service/staff workflows.
- [ ] Check mobile viewport widths for horizontal overflow and confirm light/dark theme and error/loading states.
- [ ] Review the final diff for unrelated changes, secrets, generated artifacts, and accidental changes outside scope.
- [ ] Report any manual checks that could not be performed rather than marking them complete.

**Final definition of done:** automated checks pass; all confirmed correctness issues have regression coverage; key customer/admin journeys pass; and all edits remain exclusively on `ai/ui-polishing`.

## Implementation order

1. Phase 0 baseline and tests.
2. Phase 1 time-zone correctness.
3. Phase 2 concurrent-booking integrity.
4. Phase 3 bounded queries and request-level deduplication.
5. Phase 4 settings validation and authorization regression review.
6. Phase 5 public-site visual polish.
7. Phase 6 final verification.

Phases 1 and 2 are correctness-first priorities. If baseline tests show the suspected defects are not present, record the evidence and avoid unnecessary changes; do not implement a fix solely because a risk was hypothesized during code review.
