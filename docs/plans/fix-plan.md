# Fix branch — unified implementation plan

Status: Ready to implement. Next: Phase A.
Branch: `fix` (created from `data-access-dedup`, which merged `ai/ui-polishing` and `develop`). All work happens here; `develop` and `main` stay untouched.
Scope: booking correctness, data-access efficiency, remaining public-site polish, and launch verification — consolidated from `docs/plans/data-access-layer.md` and `docs/plans/booking-correctness-and-data-access-plan.md` (both deleted; git history is the archive).

## Non-negotiable constraints

- Single Next.js full-stack app — **no API routes, no client-side `fetch`** to reach this app's own database.
- **No cross-request caching of per-user data.** Request-scope memoization via React `cache()` only.
- No new runtime dependencies.
- Authorization checks stay in every externally callable Server Action; `cache()` is an optimization, never a replacement for authz.
- Preserve Clerk auth, role/ownership checks, booking rules, server-action contracts, and existing design tokens.
- Behaviour parity is mandatory where noted (upcoming/history split, `?serviceId=` NaN guard, cancellation rules).
- Do not touch `revalidatePath`, `next.config.ts`, or add `cacheComponents` (real route-cache invalidation deserves its own future plan).
- **Measured, not assumed:** never tick a checkbox on a green build alone; record actual command output. Do not silently fix unrelated failures — record them.

## Standing rules (every phase)

- **Definition of done:** `npm run lint` → `npm run typecheck` → `npm run test` → `npm run build` pass, with recorded output.
- `npm run test` **empties the development database** (truncates all tables, no reseed). Confirm `.env`'s `DATABASE_URL` targets dev, never production. Run `npm run db:seed` afterwards for demo data.
- `npm run build` fails while `npm run dev` is running — stop the dev server first.
- `cache()` wraps the raw DB read, not display mappers; it keys on arguments automatically.
- Commit strategy: correctness fixes, data-access changes, and dead-code cleanup land as separate commits so each can be reverted alone.

---

## Already done (verified in code, 2026-10-20)

- **Request-scoped dedup with React `cache()`:** `getAppUserAccess` (`lib/auth/index.ts:84`), `getBusinessSettingsOrCreate` (`lib/db/business.ts:118`), `getActiveServices` (`lib/db/services.ts:39`). All imported from `react`, not `next/cache`. Collapses the Navbar/guard/page triple user read and the page/Footer business-settings read to one query per request.
- **Booking time-zone correctness for slot generation:** `businessLocalDateTimeToInstant` (`lib/db/appointments.ts:37`) interprets opening/closing hours in the configured business zone; `getAvailableSlots` derives weekday from the business-local calendar date. Regression test added (`tests/db/appointments.test.ts`, commits `660b575` + `c1c010a`).
- **UI/mobile-first work** from the merged branches (booking wizard, admin tab bar/filters, toast/confirm layer, skeletons, a11y script) — shipped; only polish leftovers and verification remain.

## Phase A — Close the outstanding DoD gaps from completed phases — DONE 2026-10-20

- [x] `.env` `DATABASE_URL` confirmed as the dev database (Supabase pooler `aws-0-ap-northeast-1.pooler.supabase.com`, Clerk test-mode keys, user-confirmed) before running tests.
- [x] `npm run test`: **91/91 passed** (5 files, 69.3s) against the real dev DB. `npm run db:seed` restored after (6 services).
- [x] Full-repo `npm run lint`: **PASS** — but only after Phase A caught a real defect: the merged time-zone commit (`c1c010a`) left **literal `\n` artifacts inside `lib/db/appointments.ts`** (lines 151/171), breaking both lint and typecheck on the branch as merged. Fixed by restoring real newlines; also removed the 4 now-unused `openHour/openMin/closeHour/closeMin` vars. Verified no other source file contains the artifact.
- [x] `npm run typecheck`: **PASS** (after the fix).
- [x] `npm run build`: **PASS** (dev server confirmed stopped; 13 routes, same dynamic footprint as Phase 1 recorded).
- [x] Query counts measured on `next start` with `DEBUG=prisma:driver-adapter:pg`, one request per server instance (counted `js::query_raw` events):
  - `/` → **2** (`BusinessSettings` ×1 shared page+Footer, `Service` ×1) — dedup confirmed.
  - `/services` → **2** (same pattern).
  - `/appointments` (unauthenticated) → **1** (`BusinessSettings` only; no user-table reads — the session-less path short-circuits before the DB).
  - `/admin` (unauthenticated) → **1** (same).
- [ ] **Deferred, needs an authenticated session:** the `/appointments` **7 → 5** count (Navbar/guard/page user read collapse + the two bounded appointment reads). Unauthenticated requests never reach those reads; measuring the authenticated path requires a signed-in browser session — carry to Phase H's manual pass, or measure on demand when a session is available.

**Exit criteria:** met for every measurable item; the authenticated query count is explicitly recorded as deferred, not ticked.

## Phase B — Bounded appointment queries and pages onto `lib/db/`

- [ ] Replace `getUpcomingAppointmentsByCustomer` and `getRecentHistory` (`lib/db/appointments.ts:93,103`) — both currently fetch every appointment and filter in memory — with two helpers keyed on the **app-user id**, filtering through the relation so no customer lookup is needed:
  - `getUpcomingAppointmentsForUser(userId, now?)` — `where: { customer: { userId }, startTime: { gte: now }, status: { not: "cancelled" } }`, `orderBy: { startTime: "desc" }`, `take: MAX_UPCOMING`.
  - `getRecentHistoryForUser(userId, now?, limit = 10)` — `where: { customer: { userId }, OR: [{ startTime: { lt: now } }, { status: "cancelled" }] }`, `orderBy: { startTime: "desc" }`, `take: limit`.
- [ ] The `OR` arm is load-bearing: a **cancelled future booking is not upcoming** and must still appear in history.
- [ ] `now` defaults to `new Date()` and is a parameter so tests can pin it. Keep `MAX_UPCOMING` generous.
- [ ] Drop the vestigial `a && a.startTime` guards (`startTime`/`endTime` are non-nullable).
- [ ] Return `Appointment` rows **unjoined** — `AppointmentGroup` renders only denormalized columns (`serviceName`/`servicePrice`/`serviceDurationMin`, `startTime`/`endTime`/`status`).
- [ ] `app/(site)/appointments/page.tsx` becomes a single `Promise.all` over the four helpers (settings, services, upcoming, history); move `MAX_HISTORY` and the split into `lib/db`; delete the `prisma` import. **Leave the `Number("abc")` → `NaN` guard on `?serviceId=` alone** — it is load-bearing.
- [ ] `app/(site)/services/page.tsx` → `getActiveServices()`; `app/(site)/page.tsx` → `getActiveServices(3)` via an optional `take` param (no-arg callers in `app/actions/services.ts` and tests are unaffected).
- [ ] Re-grep `prisma` imports under `app/` afterwards — `not-found.tsx` and `Footer.tsx` still legitimately use it.

**Exit criteria:** DoD commands pass; new `tests/db/appointments.test.ts` cases (cancelled-future → history; history capped at `limit`; upcoming excludes cancelled) pass against the real DB via `tests/helpers/db.ts`; `/`, `/services`, `/appointments` render identically (split, `?serviceId=` preselect, empty-services state); query log shows `/appointments` at **5** reads (was 7).

## Phase C — Dead-code cleanup (separate commit)

- [ ] Re-confirm zero importers immediately before deleting; re-run the grep after.
- [ ] Delete: `getUpcomingAppointmentsByCustomer`, `getRecentHistory`, `getAppointmentsByCustomerId`, `getCustomerWithAppointments` (`lib/db/appointments.ts`), `getCustomerById` (`lib/db/customers.ts`), `getBusinessSettings` (`lib/db/business.ts`), unused read actions `getMyProfile`, `getCustomerDetailAction` (`app/actions/customers.ts`), `getActiveServicesAction` (`app/actions/services.ts`).
- [ ] **Keep** `getCustomerWithAppointments` in `customers.ts` (used by `app/actions/customers.ts:118`) and **keep** `getActiveServices` in `services.ts` — both are stubbed in `tests/actions/error-shape.test.ts`, which mocks by module export name. Delete only the `appointments.ts` duplicate.
- [ ] Note: deleting `getActiveServicesAction` (the one read action with no `require*()` guard) removes an inconsistency rather than fixing it.

**Exit criteria:** DoD commands pass; committed separately from Phases B/D so it reverts alone.

## Phase D — Concurrent double-booking protection

- [ ] Document the exact overlap rule (single stylist/slot model; appointments must not overlap while active; cancelled rows are free). Match current product behaviour — no staff-specific scheduling exists today.
- [ ] Reproduce the race: test that fires two conflicting booking requests concurrently against PostgreSQL and shows both currently succeed.
- [ ] Choose and document a database-safe strategy **before** implementing: transaction with locking, or a PostgreSQL exclusion/constraint migration, whichever fits the schema and rules. Prefer a DB-level guarantee over advisory app locking.
- [ ] Losing request gets the existing friendly conflict response — never a raw DB error.
- [ ] Cancellation/restore interact correctly with the guarantee (cancelled appointments free their slot; `restoreAppointment` must hit the same protection).
- [ ] Regression tests: concurrent conflict (only one wins), non-overlapping concurrent bookings (both win), cancelled slot rebookable, transaction rollback leaves no partial rows.
- [ ] If a migration is required, include it and test against the project's supported PostgreSQL before merge.

**Exit criteria:** DoD commands pass; conflicting simultaneous requests cannot both create active overlapping appointments; normal booking and cancellation flows unchanged.

## Phase E — Business-settings validation and authorization review

- [ ] Validate settings server-side before writing: JSON shape, opening/closing format and ordering, weekday values, closure dates, IANA time-zone identifier, numeric bounds (`slotIntervalMin`, `minBookingNoticeMin`, `cancellationCutoffMin`).
- [ ] Reject malformed input with a clear field/form error — never silently coerce malformed JSON to empty defaults and save.
- [ ] Tests: valid settings, malformed JSON, invalid times, invalid weekdays/dates/zones, numeric boundaries.
- [ ] Review each Server Action's authorization at the action boundary (active user, owner/admin, staff, customer ownership, role changes). Keep webhook signature verification and role-assignment trust boundaries intact.
- [ ] No broad auth refactors — only changes justified by a failing test or a clearly duplicated request-scoped read.

**Exit criteria:** DoD commands pass; invalid settings cannot be persisted; authorization regression tests pass.

## Phase F — Business-local dashboard day (time-zone leftover)

- [ ] Verify how the admin date-filter window (`from`/`to` in `getAdminAppointments`, `app/actions/appointments.ts:352`) computes its calendar-day boundaries; if they use the server process's local day, convert to the business-local calendar day using the existing `businessLocalDateTimeToInstant` approach.
- [ ] Test with a business zone differing from the test runner's zone; cover a DST-transition date where applicable.

**Exit criteria:** DoD commands pass; a pinned-zone test proves the window boundaries track the business zone, or recorded evidence that they already did.

## Phase G — Public-site visual polish

The original polish references (`docs/plans/mobile-first-ui.md`, `docs/plans/aryan-beauty-repository-aware-ui-plan.md`) were deleted with the plan consolidation; their completed phases are already shipped. Remaining scope:

- [ ] Homepage hero hierarchy, value proposition, and primary booking action using real business settings and existing content only — **no invented testimonials, ratings, awards, or claims**.
- [ ] Service card hierarchy and spacing via the shared service grid and existing UI primitives.
- [ ] Targeted typography/spacing/theme consistency with existing tokens — no competing design system.
- [ ] Responsive header/footer; no horizontal overflow on mobile.
- [ ] Regression-check booking wizard, customer appointment views, and admin screens without rebuilding completed structures.
- [ ] Preserve accessible focus states, 44px standalone control targets (remember the px-literal rule — `min-h-11` is 39.6px at 320px), safe-area behaviour, reduced-motion handling.

**Exit criteria:** routes and interactions work; light/dark coherent on mobile and desktop; no booking/admin regression.

## Phase H — Final verification

Automated:

- [ ] `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`; focused booking integration tests including time-zone and concurrent-booking cases.
- [ ] Query count evidence on `/`, `/services`, `/appointments`, `/admin`.

Manual (record results; report anything that cannot be performed rather than marking it done):

- [ ] Journeys: browse services, sign in, book a slot, attempt a conflicting booking, view history, cancel an eligible appointment; admin appointment/settings/service/staff workflows.
- [ ] Viewport matrix at 320 / 390 / 768 px, light and dark: no focus-zoom, ≥44px tap targets, keyboard-only pass (skip link, focus order, visible focus, heading hierarchy, contrast spot-check), wizard happy path + Back state + slot-error Retry, admin tab bar at 320px, Filters disclosure (<640px collapsible, ≥640px open), no dark-mode flash, toasts never cover the wizard's sticky bar, `ConfirmDialog` focus trap/Escape/backdrop.
- [ ] Re-measure Lighthouse mobile on `/` and `/services` (baselines to beat: **80** and **79**; gap is LCP 3.9s/3.7s + main-thread JS — the dedup and parallel awaits should move server time). Target ≥90; if third-party Clerk JS accounts for a miss, report numbers rather than claiming success. No headless-Clerk redesign is in scope.
- [ ] Re-run the installed `@axe-core/cli` (`npm run a11y`) on `/` and `/services`; zero new violations. Do not install another a11y dependency.
- [ ] Real-phone pass is **not** in this plan — it stays a pre-launch item in `docs/product.md`.

---

## Implementation order

1. Phase A — close DoD gaps (evidence first).
2. Phase B — bounded queries + pages onto `lib/db/`.
3. Phase C — dead-code cleanup (separate commit).
4. Phase D — concurrent double-booking protection (correctness-critical).
5. Phase E — settings validation + authz review.
6. Phase F — dashboard business-local day.
7. Phase G — public-site polish.
8. Phase H — final verification.

Phases B/C are efficiency with mandatory parity; D/E are correctness-first. If a hypothesized defect (e.g. dashboard zone, double-booking race) is disproven by a failing-to-reproduce test, record the evidence and skip the fix rather than changing code on risk alone.

## Out of scope (recorded, not fixed here)

- **Real cross-request cache invalidation:** all `revalidatePath()` calls are no-ops under `force-dynamic`; fixing needs `cacheComponents: true` + `'use cache'` + `cacheTag`/`cacheLife` + `updateTag`, colliding with the no-`<Suspense>` loading convention. Own plan, later.
- **Cross-request caching of public reads** (active services, business settings) — deferred; per-user data is never share-cached.
- **Headless Clerk / `prefetchUI` redesign** — closed.
- **Real-device testing** — pre-launch item in `docs/product.md`.
