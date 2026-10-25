# Fix branch — unified implementation plan

Status: Phases A–C done (evidence recorded in-line; C is its own commit). Next: Phase D — concurrent double-booking protection, the correctness-critical one. Two deferred items ride along to Phase H: the authenticated `/appointments` query count and the authenticated render pass.
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

## Phase B — Bounded appointment queries and pages onto `lib/db/` — DONE 2026-10-25

- [x] Two helpers keyed on the **app-user id**, filtering through the relation — no customer lookup, no in-memory filtering:
  - `getUpcomingAppointmentsForUser(userId, now?)` (`lib/db/appointments.ts`) — `where: { customer: { userId }, startTime: { gte: now }, status: { not: "cancelled" } }`, `orderBy: { startTime: "desc" }`, `take: MAX_UPCOMING`.
  - `getRecentHistoryForUser(userId, now?, limit = MAX_HISTORY)` — `where: { customer: { userId }, OR: [{ startTime: { lt: now } }, { status: "cancelled" }] }`, `orderBy: { startTime: "desc" }`, `take: limit`.
  - Both return unjoined `Appointment` rows; `now` defaults to `new Date()` and is a parameter; `MAX_UPCOMING = 50` (generous); `MAX_HISTORY = 10` moved out of the page into `lib/db/appointments.ts`.
- [x] The `OR` arm is covered by a test: a cancelled future booking lands in history and never in upcoming.
- [x] The vestigial `a && a.startTime` guards went away with the page's in-memory filter; `getAvailableSlots`' own guards were left alone (out of this phase's scope).
- [x] `app/(site)/appointments/page.tsx` is a single `Promise.all` over the four helpers (settings, services, upcoming, history) and the `prisma` import is deleted. The `Number("abc")` → `NaN` guard on `?serviceId=` is untouched.
  - Supporting change: `fetchAppUserAccess` now also selects `id`, and a new cached `getAppUserId(clerkUserId)` (`lib/auth/index.ts`) exposes it — so the Navbar check, `requireActiveUser()` and the page share **one** `User` read instead of the page adding its own. The page falls back to id `-1` (matches no customer) in the impossible case, mirroring the old code.
- [x] `app/(site)/services/page.tsx` → `getActiveServices()`; `app/(site)/page.tsx` → `getActiveServices(3)` via the new optional `take` param (no-arg callers in `app/actions/services.ts` and tests unaffected; `take` is part of the `cache()` key).
- [x] Re-grep `prisma` imports under `app/`: **zero** remaining in any page/component. The only `app/` importers left are `app/actions/appointments.ts` and `app/actions/customers.ts`, which legitimately use `prisma` for transactions/upserts. **Recorded discrepancy:** the expectation that `not-found.tsx` and `Footer.tsx` still import `@/lib/prisma` is stale — `Footer` reads through `getBusinessSettingsForDisplay()` and neither `not-found.tsx` file imports prisma at all. Nothing to fix, the note was simply wrong.

**Evidence (2026-10-25, dev DB + Clerk test keys re-confirmed before running):**

- `npm run lint` → **exit 0**. `npm run typecheck` → **exit 0**.
- `npm run test` → **97/97 passed** (5 files, 91.70s; re-run after the final touch: 97/97 in 83.90s) against the real dev DB — 91 baseline + 6 new cases (cancelled-future → history; upcoming excludes cancelled; history capped at `limit`; history defaults to `MAX_HISTORY`; unjoined rows; no cross-user leakage). `npm run db:seed` after → **6 services**.
- `npm run build` → **exit 0** (dev server confirmed stopped — only the two MCP node processes were running): 13 routes + middleware proxy, same footprint as Phase A.
- Query log on `next start` with `DEBUG=prisma:driver-adapter:pg` (events land on **stderr**, one request per instance):
  - `/` → **2** (`BusinessSettings` ×1 shared page+Footer, `Service` ×1 with `LIMIT 3` — proves the `take` param).
  - `/services` → **2** (same pattern).
  - `/appointments` (unauthenticated) → **1** (`BusinessSettings` only; the response is the Clerk sign-in shell, the page itself does not render).
  - `/admin` (unauthenticated) → **1**.
  - All four match Phase A's recorded baselines exactly — moving the pages onto `lib/db/` changed no public-route query count.
- **Not measured — authenticated `/appointments` 7 → 5.** Still blocked on a signed-in browser session, exactly as Phase A recorded. Composition by inspection: 1 user read (Navbar + guard + page share one cached `fetchAppUserAccess`) + `BusinessSettings` + `Service` + upcoming + history = **5**. The checkbox stays unticked until Phase H's manual pass can measure it.
- Render parity: `/` (3 service cards) and `/services` (6 services) fetched as HTML from `next start`, both 200 with real content; `/appointments` unauthenticated still returns the Clerk sign-in shell — no behaviour change. Authenticated parity (upcoming/history split, `?serviceId=` preselect, empty-services state) needs a session → Phase H.

**Exit criteria:** DoD commands pass with recorded output; new tests pass against the real DB; public routes byte-count identical to Phase A. The authenticated query count and authenticated render parity are explicitly deferred, not ticked.

## Phase C — Dead-code cleanup (separate commit) — DONE 2026-10-25

- [x] Zero importers re-confirmed immediately before deleting (grep across `lib/`, `app/`, `components/`, `tests/`), and re-run after — **no matches remain** for any deleted name outside this plan.
- [x] Deleted: `getUpcomingAppointmentsByCustomer`, `getRecentHistory`, `getAppointmentsByCustomerId`, `getCustomerWithAppointments` (duplicate in `lib/db/appointments.ts`), `getCustomerById` (`lib/db/customers.ts`), `getBusinessSettings` (`lib/db/business.ts`), `getMyProfile` and `getCustomerDetailAction` (`app/actions/customers.ts`), `getActiveServicesAction` (`app/actions/services.ts`). Unused imports (`prisma`/`getCustomerByUserId`/`CustomerProfile` in customers actions, `getActiveServices` in services actions) dropped with them.
- [x] **Kept** `getCustomerWithAppointments` in `customers.ts` and `getActiveServices` in `services.ts`; `tests/actions/error-shape.test.ts` mocks by export name and was left untouched. Only the `appointments.ts` duplicate went.
- [x] Note stands: deleting `getActiveServicesAction` (the one read action with no `require*()` guard) removes an inconsistency rather than fixing it — and it also removes an unguarded, remotely-callable `"use server"` export, which shrinks the attack surface.

**Consequences recorded (not silently absorbed):**

- Deleting `getCustomerDetailAction` — the only caller — leaves `getCustomerWithAppointments` (`lib/db/customers.ts:59`) with **zero callers**. It is kept because the plan says keep it; a follow-up should either use it or drop it.
- Deleting `getMyProfile` likewise leaves `getCustomerByUserId` (`lib/db/customers.ts:12`) with zero callers. It is **not** on the delete list, so it was left alone — same follow-up.
- `tests/db/appointments.test.ts` lost one case, *"returns only the requesting customer's appointments"*, because it exercised `getAppointmentsByCustomerId`. The same property is covered by *"never returns another user's appointments"* in the new `user-keyed appointment lists` suite. Test count 97 → **96**.
- The freshly committed `docs/backend-api-audit.md` (rows for `getMyProfile`, `getCustomerDetailAction`, `getActiveServicesAction`) and `docs/plans/backend-hardening-plan.md` (items 11 and 15) now describe actions that no longer exist — deletion resolves those items outright. **Those docs were not edited** (separate plan, out of scope here); they need a refresh by their owner.

**Evidence (2026-10-25):** `npm run lint` **exit 0**; `npm run typecheck` **exit 0**; `npm run test` → **96/96 passed** (5 files, 82.60s) against the real dev DB, `npm run db:seed` after → **6 services**; `npm run build` → **exit 0** with the dev server confirmed stopped, 13 routes — same footprint as Phases A/B.

**Exit criteria:** met — DoD commands pass with recorded output; ready to commit on its own so it reverts alone.

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
