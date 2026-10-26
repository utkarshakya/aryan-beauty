# Fix branch — unified implementation plan

Status: Phases A–E done (evidence recorded in-line; C is `8848de4`, D is `6cdbcc3`, neither pushed; E is uncommitted). Next: Phase F — business-local dashboard day. Two deferred items ride along to Phase H: the authenticated `/appointments` query count and the authenticated render pass.
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

### D.0 The overlap rule (documented before any code change)

- **One resource.** The whole `Appointment` table is a single schedule: one stylist/chair at a time. No per-stylist, per-service or per-customer scoping — that is exactly what `getAvailableSlots` (`lib/db/appointments.ts:173`) and the pre-insert check in `createAppointment` (`app/actions/appointments.ts:124`) do today. No staff-specific scheduling exists.
- **Half-open interval.** An appointment occupies `[startTime, endTime)`. Two appointments conflict iff
  `a.startTime < b.endTime AND a.endTime > b.startTime` — touching endpoints (10:00–10:30 and 10:30–11:00) do **not** conflict.
- **Only active rows participate.** `status <> 'cancelled'`. `pending` and `confirmed` both occupy the slot (a booking is born `pending`, and `restoreAppointment` turns a `cancelled` row back into `confirmed`). Cancelled rows are free and rebookable.
- **No past/completed carve-out.** A completed appointment still occupies its interval; bookings only exist in the future, so nothing changes in practice.
- **Restore is a re-entry** into the active set and must satisfy the same rule.

### D.0b Strategy chosen: PostgreSQL exclusion constraint (before implementation)

```sql
ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_no_overlap"
  EXCLUDE USING gist (tsrange("startTime", "endTime", '[)') WITH &&)
  WHERE (status <> 'cancelled');
```

- Chosen over transaction-level/`advisory` app locking because the plan prefers a **DB-level guarantee**; it protects every write path (booking, restore, and anything added later) without relying on each caller taking a lock.
- `tsrange` matches Prisma's `DateTime` → `timestamp(3)`; `[)` encodes the half-open rule; range types have built-in GiST support, so **no extension is required**.
- The existing in-transaction pre-check is kept as the fast path (friendly message, no wasted work); the constraint is the guarantee when the two race.
- Race losers get an error at `INSERT`/`UPDATE` time → mapped to the **existing** friendly conflict response, never a raw DB error.
- `restoreAppointment`'s `updateMany` re-evaluates the predicate on the `cancelled → confirmed` transition, so it inherits the same protection.
- Verified before writing: dev DB has **0** `Appointment` rows and **0** overlapping active pairs, so the constraint applies without a data cleanup pass. `prisma migrate status` → *13 migrations found, Database schema is up to date*.

- [x] Document the exact overlap rule (single stylist/slot model; appointments must not overlap while active; cancelled rows are free). Match current product behaviour — no staff-specific scheduling exists today. — **D.0 above.**
- [x] Reproduce the race: test that fires two conflicting booking requests concurrently against PostgreSQL and shows both currently succeed. — **reproduced 4/4 runs, see Evidence.**
- [x] Choose and document a database-safe strategy **before** implementing: transaction with locking, or a PostgreSQL exclusion/constraint migration, whichever fits the schema and rules. Prefer a DB-level guarantee over advisory app locking. — **D.0b above, written before any code change.**
- [x] Losing request gets the existing friendly conflict response — never a raw DB error.
- [x] Cancellation/restore interact correctly with the guarantee (cancelled appointments free their slot; `restoreAppointment` must hit the same protection).
- [x] Regression tests: concurrent conflict (only one wins), non-overlapping concurrent bookings (both win), cancelled slot rebookable, transaction rollback leaves no partial rows.
- [x] If a migration is required, include it and test against the project's supported PostgreSQL before merge.

### D.1 What changed

- **`prisma/migrations/20261026111500_appointment_no_overlap/migration.sql`** — the partial exclusion constraint from D.0b. Hand-written (the schema has no way to express it) and applied with `prisma migrate deploy`.
- **`lib/errors.ts`** — new `isScheduleConflict(error)`. Matches SQLSTATE `23P01` anywhere in the Prisma/driver-adapter error chain *or* the `Appointment_no_overlap` constraint name, so a unique/FK/check violation still falls through to `GENERIC_FORM_ERROR`.
- **`app/actions/appointments.ts`** — the race loser's error is mapped to the same `SLOT_TAKEN_MESSAGE` the pre-check already used; `restoreAppointmentAction` maps it to a domain message (`"That slot has been booked by someone else…"` → `ok: false`) and does **not** log it as a server error. The in-transaction pre-check was left untouched as the fast path.
- The booking transaction itself is unchanged: same friendly-message contract, same rollback semantics.

### D.2 Evidence (2026-10-26, dev DB + Clerk test keys re-confirmed: `pk_test_`/`sk_test_`, `aws-0-ap-northeast-1`)

**Pre-fix (race reproduced).** New `tests/actions/booking-race.test.ts` fires two `createAppointment` calls for the *same* slot through `Promise.all`, released together by a gate so both clear the availability re-validation before either opens its transaction:

- Runs 1–4: **`expected [ { success: … }, …(1) ] to have a length of 1 but got 2`** — both conflicting bookings succeeded, every time. Reproduction is stable, not a coin flip.
- The non-overlapping control case passed both before and after (both bookings win) — so the harness is not simply serialising the requests.

**Migration.** `npx prisma migrate deploy` → *14 migrations found… All migrations have been successfully applied*. `npx prisma migrate status` → *14 migrations found, Database schema is up to date*. Applied against the project's supported PostgreSQL (Supabase direct connection, `db.vkfdxqskccuqthidywyb.supabase.co:5432`). Dev DB had 0 appointments / 0 overlapping pairs beforehand, so no data cleanup was needed.

**Constraint behaviour, probed directly against the database** before wiring the action (temporary script, since deleted):

- overlapping `INSERT` → `PrismaClientKnownRequestError`, `code: P2039`, `meta.driverAdapterError.cause.code: 23P01`, `originalMessage: conflicting key value violates exclusion constraint "Appointment_no_overlap"`
- overlapping `UPDATE` (`cancelled → confirmed`, i.e. restore) → same error
- overlapping `INSERT` with `status = 'cancelled'` → **allowed** (predicate correct)

**Post-fix:** `tests/actions/booking-race.test.ts` → 4/4 runs green.

**DoD commands (recorded output):**

- `npm run lint` → **exit 0**
- `npm run typecheck` → **exit 0**
- `npm run test` → **112/112 passed** (7 files, 127.53s) against the real dev DB. `npm run db:seed` after → **6 services**.
  - 96 baseline + 16 new: 2 concurrency (`tests/actions/booking-race.test.ts`), 6 DB-level overlap (`tests/db/appointments.test.ts`), 8 `isScheduleConflict` (`tests/errors.test.ts`).
- `npm run build` → **exit 0** (dev server confirmed stopped — no listener on 3000/3001): **13 routes + middleware proxy**, identical footprint to Phases A/B/C.

**Exit criteria:** met — conflicting simultaneous requests can no longer both create active overlapping appointments (enforced by the database, not by app-level locking); the non-booking flows are untouched and every pre-existing test still passes unchanged.

**Committed as a single correctness commit on `fix` (not pushed)** — migration + `lib/errors.ts` + `app/actions/appointments.ts` + 3 test files + this plan update — so it reverts alone.

## Phase E — Business-settings validation and authorization review — DONE 2026-10-26

Scope decisions taken before any code change (owner-approved, 2026-10-26):

- **No zod.** The non-negotiable "no new runtime dependencies" beats `docs/plans/backend-hardening-plan.md`'s "install zod if missing". Validators are hand-rolled in `lib/validation/business.ts` (the shared location that plan asks for); its doc line needs an owner refresh (same treatment as the Phase C doc drift).
- **Fix the silently dropped marketing fields** (`phoneDisplay`, `phoneHref`, `addressLine2`, `tagline`, `description` are submitted by the form but never read by the action, so those edits are lost on every save).
- **Fix the `closedWeekdays` weekday-convention bug** found while specifying "weekday values" validation — see E.2.
- **Remove `"use server"` from `lib/auth/sync.ts`** (hardening-plan item 19, High) here, justified by the review; leave the `users.ts` guard placement alone (guards exist one call deep — evidence in E.6).
- **Include walk-in link target validation** (hardening-plan item 17) — it is a customer-ownership check at an action boundary.

### E.0 Findings of the authorization review (recorded before code changes)

Every `"use server"` export in the repo, guard at the action boundary (`app/actions/*.ts` = 5 files, 19 exports; plus `lib/auth/sync.ts` = 8 exports that should never have been exports):

| File | Guard at the boundary | Verdict |
|---|---|---|
| `app/actions/users.ts` (5) | `getStaffUsersAction`, `inviteStaffAction`: `requireOwnerAdmin` first statement. `updateRoleAction`/`disableUserAction`/`restoreUserAction`: **no statement-level guard** — `setUserRole`/`disableUser`/`restoreUser` run `requireOwnerAdmin` one call deep, *outside* their `try`. | Keep as-is (E.6 has the no-session evidence). Finding F1 below. |
| `app/actions/services.ts` (4) | `requireOwnerAdmin` first statement on all four | OK |
| `app/actions/customers.ts` (3) | `updateMyProfile` → `requireActiveUser` + self-scoped by `appUser.id`; `getWalkInCustomersAction`/`linkWalkInCustomerAction` → `requireAdmin` | Guard OK; **link target unchecked** → E.4 |
| `app/actions/business.ts` (2) | `requireOwnerAdmin` first statement on both | Guard OK; **input unchecked** → E.1 |
| `app/actions/appointments.ts` (10) | `requireActiveUser` (customer-scoped: `cancelMyAppointment` filters by own `customer.id`) / `requireAdmin` (admin paths) on all ten | OK |
| `lib/auth/sync.ts` (8) | 4 fully unguarded (`upsertUserFromClerk`, `syncPublicMetadata`, `softDeleteUser`, `getOrCreateUser`) + 4 guarded, **but the whole file is a network endpoint** | **Fix in E.5** |

Findings recorded, **not** fixed here:

- **F1 — swallowed redirect.** `updateRoleAction`/`disableUserAction`/`restoreUserAction` catch every error, so the `NEXT_REDIRECT` thrown by the guard is converted into `{ ok: false, error: <digest> }` instead of navigating. The write is still blocked (guard runs before any DB touch — tested in E.6); only the denial UX/`digest` text differs from every other action. Restructuring the try/catch is a UX change outside this phase.
- **F2** — `getBusinessSettingsAction` returns the internal `id` (hardening #3, Future Phase 6 with DTOs).
- **F3** — `inviteStaffAction` trusts Clerk invitation errors only after `requireOwnerAdmin`; fine. Webhook signature verification (`svix`, `app/api/webhooks/clerk/route.ts:23-27`) and the role-assignment trust boundary (`roleFromPublicMetadata`, super-admin env allow-list) are intact and must not change.
- **F4** — `docs/backend-api-audit.md` / `docs/plans/backend-hardening-plan.md` rows for items 17/18/19 become stale once this phase lands; **not edited here** (separate plan, its owner refreshes them).

### E.1 Server-side settings validation

- [x] `lib/validation/business.ts` — one pure function `parseBusinessSettingsForm(formData)` returning `{ ok: true, data } | { ok: false, errors }`. `data` is `Partial<BusinessSettingsFormData>` (`updateBusinessSettings` already takes Partial). No `"use server"`, no prisma, `import type` only from `lib/db/business`.
- [x] **Never coerce.** Raw JSON fields must be present and parseable — parse failure returns a field error; the `{}`/`[]` silent fallbacks in `app/actions/business.ts:29,39,46` are deleted. Missing required field → field error, never a default. Numeric fields parse from the raw string with `/^\d+$/` (today `Number("")` → `0` passes the `>= 0` checks for `minBookingNoticeMin`/`cancellationCutoffMin`).
- [x] **Rules** (error keys are the field names, messages in the existing "Enter a valid …" style):
  - `name`: required, ≤100 (unchanged). `phone`, `address`: present-or-empty, ≤30 / ≤200 (caps are new).
  - Marketing fields (`phoneDisplay` ≤50, `phoneHref` ≤100, `addressLine2` ≤200, `tagline` ≤150, `description` ≤1000): **absent → key omitted from `data`** (preserves the stored value); present → trimmed and length-checked. No format rules invented (see E.0 — a `tel:`/`https:` prefix rule could invalidate existing rows).
  - `timeZone`: non-empty and accepted by `new Intl.DateTimeFormat("en-US", { timeZone })` in a try/catch — that is IANA ids **including aliases and fixed offsets like `+05:30`** (V8 accepts offsets — measured, not assumed — and `businessLocalDateTimeToInstant` honours them at runtime, so rejecting them would be inventing a rule); rejects `""`, `Mars/Olympus`, bare `Kolkata`.
  - `openingHours`: plain object (not array/null/string), keys ⊆ the 7 weekday names, each value `{ open, close }` strings matching `^([01]\d|2[0-3]):[0-5]\d$`, and `open < close` (lexicographic compare is exact for `HH:MM`). `{}` allowed (means "every day closed-by-hours", which `getAvailableSlots` already treats as no slots). **No overnight hours** — `close > open` stays the rule; the product has no overnight scheduling. A literal `null` JSON body is rejected too (`parseJsonField` distinguishes "missing"/"null" from a valid parse — the first draft did not, and that gap is why `INVALID` exists).
  - `closedWeekdays`: JSON array of integers 0–6, **0 = Monday … 6 = Sunday (ISO)** after E.2.
  - `closures`: JSON array; each entry an object with `date` matching `YYYY-MM-DD` **and** round-tripping `new Date(date).toISOString().slice(0, 10)` (calendar-valid, so `2026-02-31` is rejected), `reason` non-empty after trim and ≤200.
  - `slotIntervalMin` 5–120 (unchanged), `minBookingNoticeMin` 0–10080, `cancellationCutoffMin` 0–10080 — the 7-day upper bounds are **new**; defaults (30/60/120) unaffected.
- [x] `app/actions/business.ts` calls the parser after `requireOwnerAdmin()`; on `{ ok: false }` return `{ errors }` **before** `updateBusinessSettings` (test asserts the db function is never called). On success pass `data` through; `revalidatePath` calls and the success string unchanged.
- [x] `components/business/BusinessSettingsForm.tsx` displays every new error key: `error={errors.timeZone}` and `error` props on the marketing/`phone`/`address` `Field`s, plus a `FormBanner tone="danger"` for `errors.openingHours` in the Opening-hours section and `errors.closures` in the Closures section (otherwise the server rejects and the user sees nothing). Client `validate()` stays as-is — the server is authoritative and its errors are now visible; mirroring would just drift again.

### E.2 Weekday convention bug (`closedWeekdays`) — proof first, then fix

- [x] **Reproduce before touching code** (`tests/db/closed-weekdays.test.ts`, dates computed at least a week ahead so the booking-notice filter can't fake a result; the test also asserts its own `futureWeek()` really returns a Monday/Tuesday/Sunday):
  - **Pre-fix** (stash of `lib/constants.ts` + `lib/db/appointments.ts`, so both old files run together): `Tests 2 failed | 2 passed` — exactly the two convention tests, each failing with `expected [ …(18 slots) ] to deeply equal []`; the helper-sanity and empty-list tests passed, so the harness was sound.
  - **Post-fix:** `4 passed`.
  - **Honest detour:** the first reproduction run was invalid — the test's "next Monday" formula added a day when the base date *was* a Monday, so both runs failed for the helper's own reason and looked identical. The helper was fixed and the sanity test added before the evidence above was accepted.
- [x] **Fix (ISO end-to-end, one convention repo-wide):**
  - `lib/constants.ts` — reorder `WEEKDAY_NAMES` to monday-first and comment that it is the ISO order shared with the settings form (`0 = Monday`).
  - `lib/db/appointments.ts:153` — derive the ISO weekday once: `const dayOfWeek = (new Date(date + "T00:00:00Z").getUTCDay() + 6) % 7`, used for both `WEEKDAY_NAMES[dayOfWeek]` and `closedWeekdays.includes(dayOfWeek)`, with a comment naming the convention. Single reader, single expression; verified the only consumer of `WEEKDAY_NAMES` order is `appointments.ts:154` and the `WeekdayName` type has no other user.
  - The form is unchanged (already ISO), validation documents ISO (E.1).
- [x] Data check before merge: dev DB has **one** `BusinessSettings` row — `{"id":1,"name":"Aryan Beauty","closedWeekdays":[]}`. No row's meaning changes; no migration or backfill needed.

### E.3 Persist the dropped marketing fields

- [x] The five fields flow form → action → `updateBusinessSettings` (regression test asserts they arrive in the full 15-key `data` payload; a second test asserts that **omitting** them leaves them out of the payload rather than writing `""`).

### E.4 Walk-in link target validation (`linkWalkInCustomerAction`)

- [x] After the existing id/format checks and `requireAdmin()`, validate against the DB before linking:
  - customer exists → else `{ errors: { form: "Customer not found" } }`;
  - customer is an unlinked walk-in (`userId === null`) → else `"This customer is already linked to a user"`;
  - target `appUser` exists (already there) → else existing `"Clerk user not found in database"`;
  - no `Customer` row already has `userId = appUser.id` → else `"This user is already linked to another customer"`.
  - Domain errors return **before** `linkWalkInCustomer`, unchanged `{ errors: { form } }` contract, never `GENERIC_FORM_ERROR`.
- [x] Tests: happy path links; each of the four rejections leaves both rows untouched (`tests/actions/walk-in-link.test.ts`, 6 cases incl. a no-session denial).
- [x] **Recorded test change, made as planned:** `tests/actions/error-shape.test.ts` now seeds a real unlinked customer (and uses its id) so the domain checks pass and the mocked `linkWalkInCustomer` rejection is still what's under test.

### E.5 Remove the accidental server-action surface in `lib/auth/sync.ts`

- [x] `"use server"` deleted from `lib/auth/sync.ts:1` (replaced with a comment explaining why it must not come back). The file's importers are all server code: `app/api/webhooks/clerk/route.ts` (route handler), `app/auth/redirect/page.tsx` (server component), `app/actions/users.ts` ("use server" action file). Client components touch `@/lib/auth` only via `import type` (`StaffTable.tsx:21`, `AuthStatusBadge.tsx:3`); `Navbar.tsx` is a server component. `npm run build` passing (13 routes) is the proof that nothing client-side broke.
- [x] **No `server-only` package** — that would be a new runtime dependency; the build result plus the E.6 source-scan test carry the guarantee instead.
- [x] Consequence verified: `setUserRole`/`disableUser`/`restoreUser`/`updateUserRole` keep their `requireOwnerAdmin`/`requireSuperAdmin` guards for server callers — `tests/auth/staff-management.test.ts` (15 cases) and `tests/auth/authorization.test.ts` (12) green **unchanged**; `upsertUserFromClerk`/`softDeleteUser` reachable from the svix-verified webhook only (route untouched, F3).
- [x] **Not doing:** hoisting guards to the top of the three `users.ts` actions (E.0 F1 — protection already holds; that's a UX change, not an authz fix).

### E.6 Authorization regression tests

- [x] New `tests/auth/server-action-surface.test.ts` (5 cases):
  - **Source scan:** exactly the five `app/actions/*.ts` files declare `"use server"`; `lib/auth/sync.ts` does not (regression guard for E.5 — no runtime way exists to assert "not a network endpoint").
  - **No session → no write:** `updateRoleAction(target, "staff")`, `disableUserAction(target)`, `restoreUserAction(target)` with `auth()` returning null → `{ ok: false }`, target's `role`/`status` unchanged in the DB, and `clerkClient` never called (evidence for the E.0 verdict on `users.ts`, and it also pins F1's observed shape); `updateBusinessSettingsAction` with no session → rejects `NEXT_REDIRECT` and no `BusinessSettings` row is read or written.
  - Reused the `@clerk/nextjs/server` + `next/navigation` mocking style of `tests/auth/authorization.test.ts`; the role-tier matrix stays in that file.
- [x] Authorization behaviour that must stay green **unchanged**: `tests/auth/authorization.test.ts`, `tests/auth/staff-management.test.ts`, webhook signature handling (review only — no route change).

### E.7 Evidence (2026-10-26)

- [x] `.env` `DATABASE_URL` re-confirmed before testing (Supabase pooler `aws-0-ap-northeast-1`, dev), and no listener on 3000/3001 before `npm run build`.
- [x] `npm run lint` → **exit 0**.
- [x] `npm run typecheck` → first run **failed**: `lib/validation/business.ts(148,45): error TS2769` — `Object.entries` on `object | null` after the `typeof` narrow. Fixed with an explicit `parsed === null` branch; second run → **exit 0**.
- [x] `npm run test` → **187/187 passed** (11 files, 158.06s) against the real dev DB. Phase D baseline 112 + **75 new**: 60 settings-validation (`tests/actions/business-settings-validation.test.ts`), 6 walk-in, 5 action-surface, 4 weekday. `npm run db:seed` after → **6 services**.
- [x] `npm run build` → **exit 0**: **13 routes + middleware proxy**, identical footprint to Phases A–D.
- [x] Weekday reproduction output and dev-DB `closedWeekdays` query: recorded in E.2.
- **Self-corrections during the phase (recorded, not hidden):** the walk-in test's "user already linked" case first passed `otherUser` instead of the taken user (would have missed the check — caught by the red run and fixed); the source-scan test needed its expected list sorted the same way as the scan; the weekday date helper bug in E.2.

**Exit criteria:** met — DoD commands pass with recorded output; invalid settings cannot be persisted (every rejection case asserts `updateBusinessSettings` was never called); the weekday convention has a proof test with a pre-fix failure on record; the walk-in link target is validated at the action boundary; `lib/auth/sync.ts` is no longer a server-action surface (build + source scan); authorization regression tests pass.

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
