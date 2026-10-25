# Backend Hardening & Mobile-API Readiness Plan

Source: `docs/backend-api-audit.md` (read-only audit). This plan turns its findings into ordered phases.
Drop this file into `docs/` and treat it as the source of truth for this work.

---

## 0. How the agent must work (read first)

1. **One phase at a time.** After finishing a phase, STOP. Post the phase report (format below) and wait for the owner's explicit go-ahead before starting the next phase.
2. **Stay in scope.** Only do what the current phase lists. No drive-by refactors, no renaming, no "while I'm here" changes. If you spot something outside scope, add it to a "Noticed but not touched" list in the phase report.
3. **Explain the why.** The owner is learning. For every change, give 2-3 sentences on why it was needed and why this approach was chosen over the obvious alternatives. Keep it practical, not theoretical.
4. **Follow the existing architecture.** Clerk = identity; local `User` table = source of truth for roles; guards in `lib/auth/index.ts`; Prisma in `lib/db/*`; server actions in `app/actions/*`. Do not replace these patterns.
5. **Secrets.** Never print, read, or ask for secret values. Name the env vars needed and say where to set them locally.
6. **Database.** Dev/pilot DBs currently hold test data, so reset/reseed is acceptable. Still: use proper Prisma migrations (no manual schema edits), and before applying any new constraint to the pilot DB, run a check query for existing violating rows.
7. **Verify, don't assume.** Run the build, lint, type-check and tests after each phase. If a check fails, report it honestly rather than working around it.
8. **Branching.** Do each phase on its own git branch (`hardening/phase-N-name`) so it can be reviewed and reverted independently.

### Phase report format (post this at the end of every phase)

- Files changed (path + one line each)
- Why each change was made
- How the owner can verify manually (exact steps)
- Test/build results
- Anything unsure or risky
- Noticed but not touched

---

## 1. Priority register (everything from the audit, low to high)

Severity is from the audit, adjusted where noted. "Phase" says when it gets handled.

| # | Item | Severity | Phase | When |
|---|------|----------|-------|------|
| 1 | `getServicesAction` returns full catalog + counts, no pagination | Low | 6 | Future (tiny catalog) |
| 2 | Staff listing returns Clerk IDs/emails/names to admin UI | Low | 6 | Future (admin-only, authorized) |
| 3 | `getBusinessSettingsAction` returns internal `id` | Low | 6 | Future (with DTOs) |
| 4 | `getWalkInCustomersAction` unbounded, no field projection | Low | 6 | Future |
| 5 | `confirmAppointment` silently returns on invalid input, inconsistent with siblings | Low | 4 | Now (cleanup) |
| 6 | `getAdminAppointmentCounts` / `getUpcomingAppointments` dates not validated | Low | 4 | Now (cleanup) |
| 7 | `getAdminAppointments` filters/dates trusted as typed values | Low | 4 | Now (cleanup) |
| 8 | `createServiceAction` / `updateServiceAction` description length unbounded, runtime arg types unchecked | Low | 4 | Now (cleanup) |
| 9 | `toggleServiceAction` `active` trusted at runtime | Low | 4 | Now (cleanup) |
| 10 | `updateMyProfile` email format not validated | Low | 4 | Now (cleanup) |
| 11 | `getCustomerDetailAction` customer ID not validated | Low | 4 | Now (cleanup) |
| 12 | `getAvailableSlotsAction` date shape checked, not calendar validity | Low | 4 | Now (cleanup) |
| 13 | `disableUserAction` / `restoreUserAction` Clerk ID only typed, not validated | Low | 4 | Now (cleanup) |
| 14 | `getAdminAppointments` unbounded result, full customer relation | Medium | 6 | Future (when data grows) |
| 15 | `getCustomerDetailAction` returns all appointments unpaginated | Medium | 6 | Future (when data grows) |
| 16 | Inconsistent action return shapes (`void`, `{ok}`, `{error}`, `{errors}`, redirects, throws) | Medium | 5 | Future (before API) |
| 17 | `linkWalkInCustomerAction` doesn't verify target is an unlinked walk-in | Medium | 3 | Now |
| 18 | `updateBusinessSettingsAction` JSON + timezone not structurally validated | Medium | 3 | Now |
| 19 | `lib/auth/sync.ts` has `"use server"`, exposing unauthenticated helpers as server actions | **High** (raised from audit's implicit "ok") | 2 | Now |
| 20 | `createAppointment` can double-book under concurrency | **High** | 1 | Now |
| 21 | Business logic partly inline in actions; not reusable by an API | Medium | 5 | Future |
| 22 | No JSON route handlers for a mobile client; Bearer auth unproven end to end | Medium | 7 | Future (when mobile starts) |
| 23 | No concurrency test, no overlap constraint in DB | High | 1 | Now |

---

## 2. Summary: what to do now vs later

**NOW (do these in order):**
- Phase 0: Facts and baseline (read-only)
- Phase 1: Double-booking protection (highest value)
- Phase 2: Remove accidental server-action exposure in `lib/auth/sync.ts`
- Phase 3: Validation fixes that can break the live app (business settings, walk-in linking)
- Phase 4: Low-risk cleanup batch (optional but cheap; do it in one sitting)

**FUTURE (do not start until the trigger condition is met):**
- Phase 5: Extract shared logic + one consistent result type (trigger: you decide to build the mobile app or any external API)
- Phase 6: Pagination, field projection, DTOs (trigger: real data growth or an admin page feels slow)
- Phase 7: JSON route handlers with Bearer auth (trigger: Phase 5 done and mobile work is starting)
- Phase 8: Mobile client decision, reminders, rate limiting (trigger: real customers asking for it)

---

## PHASE 0: Facts and baseline (read-only) [NOW]

**Goal:** Answer the questions that decide how Phase 1 is built, and capture a clean baseline.

Tasks:
- [ ] Confirm `git status` is clean and create the branch for Phase 1.
- [ ] Run build, lint, type-check, and existing tests. Record results as the baseline.
- [ ] Answer from the code:
  - (a) Can two non-cancelled appointments overlap in time if they involve different staff/resources, or is it strictly one booking at a time for the whole parlour?
  - (b) Does the `Appointment` model store a start AND end time (or start + duration)? Where is duration derived (service duration?)
  - (c) Which statuses count as "active" (block a slot)?
  - (d) Are bookings fixed slots (e.g. every 30 min) or free start times?
  - (e) Is there any existing overlap logic besides the pre-check in `createAppointment` (~`appointments.ts:101-124`) and slot calculation in `lib/db/appointments.ts`?
- [ ] List every file that imports from `lib/auth/sync.ts`, and mark which are client components (if any).

**Done when:** a short written answer to a-e and the import list are posted. No code changes.

---

## PHASE 1: Double-booking protection [NOW, HIGH]

**Why:** Today the code checks whether a slot is free and then inserts. Two requests at nearly the same moment can both pass the check and both insert. Only the database can guarantee this never happens, and it must hold for every future code path (including the mobile API).

**Chosen approach: Postgres exclusion constraint** on a time range, applied only to active appointments.

Alternatives considered:
- Serializable transaction / advisory lock: correct only if every write path remembers to use it; needs retry handling.
- Unique key on a fixed slot: only works if bookings snap to fixed slots.
Pick an alternative only if Phase 0 shows the exclusion constraint cannot fit the data model, and explain why in the report.

Tasks:
- [ ] If there is no stored end time, add one (`endAt`, computed at insert from the service duration) via a Prisma migration. Backfill existing rows.
- [ ] Create the migration with `prisma migrate dev --create-only`, then add raw SQL:
  - `EXCLUDE USING gist (tstzrange("startAt", "endAt", '[)') WITH &&) WHERE (status IN (<active statuses>))`
  - If Phase 0(a) says parallel bookings are allowed per staff/resource, scope it: `EXCLUDE USING gist ("staffId" WITH =, tstzrange(...) WITH &&)`. This form needs `CREATE EXTENSION IF NOT EXISTS btree_gist;` (Supabase supports it). A plain range-only constraint does not need btree_gist.
  - Adapt column names to the real Prisma-generated names (quoted camelCase).
  - Half-open range `[)` so an appointment ending at 11:00 does not conflict with one starting at 11:00.
- [ ] Before applying to any non-test DB, run a query to detect existing overlapping active rows. Resolve them first or the migration will fail.
- [ ] Confirm the next `prisma migrate dev` does not try to drop or alter the constraint (Prisma does not model it). Document the result in the report.
- [ ] In `createAppointment`: keep the pre-check (friendly UX), and catch the exclusion-violation error (Postgres code `23P01`, surfaced via Prisma) and return the normal "that slot was just taken, pick another" error in the existing `{ errors }` shape.
- [ ] Make sure cancelled/restored transitions interact correctly: restoring a cancelled appointment into an already re-booked slot must fail cleanly (handle `23P01` in the restore path too).
- [ ] Add a concurrency test: fire two simultaneous `createAppointment` calls for the same slot; exactly one succeeds and the other returns the friendly error.
- [ ] Add a test that two back-to-back appointments (end == next start) are both allowed.
- [ ] Add a short note to `docs/` explaining the constraint and why it lives in raw SQL.

**Done when:** concurrency test passes reliably (run it several times), build/lint/tests green, migration applies cleanly on a fresh dev DB.

---

## PHASE 2: Remove accidental server-action exposure [NOW, HIGH]

**Why:** In Next.js every function exported from a `"use server"` file is a server action, i.e. a network-callable endpoint. `lib/auth/sync.ts` exports `upsertUserFromClerk`, `syncPublicMetadata`, `softDeleteUser`, `getOrCreateUser` (no auth checks) plus role helpers. They are internal helpers, not public endpoints. Their safety should not depend on "nobody calls them".

Tasks:
- [ ] Using the import list from Phase 0, confirm which files import from `lib/auth/sync.ts`.
- [ ] Remove `"use server"` from `lib/auth/sync.ts` and add `import "server-only";` at the top (install the `server-only` package if missing).
- [ ] If any *client* component imports from it, stop and report; do not work around it.
- [ ] Verify the Clerk webhook route (`app/api/webhooks/clerk/route.ts`) and all existing guards/role actions still work. Verify the production build passes.
- [ ] Check other files for `"use server"` at file top where exports are not meant to be actions; list findings, fix only `sync.ts` unless the owner approves more.
- [ ] Verify (read-only) that functions which do enforce their own auth (`setUserRole`, `disableUser`, `restoreUser`, `updateUserRole`) still do after the change.

**Done when:** build passes, login/signup, role changes, staff invite, and the webhook flow all work in a manual check.

---

## PHASE 3: Validation fixes that can break the app [NOW, MEDIUM]

**Why:** Bad data in business settings can silently break availability for every customer, and an unchecked walk-in link can reassign existing relationships.

Tasks:
- [ ] `updateBusinessSettingsAction`: add a zod schema (install `zod` if missing) validating:
  - timezone is a valid IANA timezone (e.g. check with `Intl.supportedValuesOf("timeZone")` or try `new Intl.DateTimeFormat(undefined, { timeZone })`)
  - opening-hours JSON has the expected shape (days, open < close, valid time format), and any holiday/exception JSON fields are validated the same way
  - Reject invalid input in the existing `{ errors }` shape with clear field messages
- [ ] Put the schema in a shared file (e.g. `lib/validation/business.ts`) so a future API can reuse it.
- [ ] `linkWalkInCustomerAction`: before linking, verify the target customer exists, is a walk-in, and is currently unlinked; also verify the target Clerk/app user exists and is not already linked to another customer. Reject otherwise.
- [ ] Add tests: invalid timezone, malformed hours JSON, open >= close, linking an already-linked customer, linking a non-existent customer.

**Done when:** tests pass; a deliberately bad settings submission is rejected with a readable error in the UI.

---

## PHASE 4: Low-risk cleanup batch [NOW, OPTIONAL BUT CHEAP]

**Why:** These are small boundary-validation gaps. Individually minor, but together they stop Prisma errors from leaking as 500s and make the later API layer cleaner. Do all of them in one sitting; each is a few lines.

Tasks (create a small shared helper file for common validators, e.g. `lib/validation/common.ts`):
- [ ] `confirmAppointment`: make error handling consistent with neighbouring actions (return a result instead of silent return; do not throw raw DB errors to the UI).
- [ ] `getAdminAppointmentCounts`, `getUpcomingAppointments`: validate date arguments at the action boundary.
- [ ] `getAdminAppointments`: validate status filter against the allowed enum, dates, and options; return a controlled error instead of letting Prisma throw.
- [ ] `getAvailableSlotsAction`: validate calendar validity of the date (e.g. reject `2026-02-31`), not just its shape.
- [ ] `createServiceAction` / `updateServiceAction`: bound description length and validate runtime types (name length, price >= 0, duration > 0 and sane max).
- [ ] `toggleServiceAction`: validate `active` is a real boolean.
- [ ] `updateMyProfile`: validate email format.
- [ ] `getCustomerDetailAction`: validate customer ID format.
- [ ] `disableUserAction` / `restoreUserAction`: validate Clerk ID format before use.
- [ ] Add a few tests for the most important ones (dates, enum filters).

**Done when:** malformed inputs return controlled errors instead of Prisma exceptions; build and tests green.

---

## PHASE 5: Shared logic + consistent result type [FUTURE]

**Trigger:** you decide to build a mobile app or any external client. Not needed for the web app alone.

**Why:** Mobile cannot call server actions (no stable URL, not a public contract). The mobile API will be route handlers that call the *same* plain functions as the web actions, so rules live in one place.

Tasks:
- [ ] Define one result type used by all domain functions, e.g. `{ ok: true, data } | { ok: false, code, message, fieldErrors? }`, with a small set of error codes (`VALIDATION`, `NOT_FOUND`, `FORBIDDEN`, `CONFLICT`, `UNAUTHENTICATED`, `INTERNAL`).
- [ ] For every action that has validation/orchestration inline, extract it into a plain function under `lib/services/*` (no `FormData`, no `redirect`, no `revalidatePath`, no `cookies()`/`headers()`). Start with: `createAppointment`, `cancelMyAppointment`, `updateBusinessSettings`, `createService`/`updateService`, `inviteStaff`, `updateMyProfile`, `linkWalkInCustomer`, `getAdminAppointments`.
- [ ] Server actions become thin wrappers: authenticate with guard, parse `FormData`, call the service, map the result to the existing UI shape, then `revalidatePath`/`redirect`. Existing UI behaviour must not change.
- [ ] Move zod schemas to `lib/validation/*` so services and routes share them.
- [ ] Do this one action group at a time (appointments, then services, then business, then customers, then staff), with a report after each group.

**Done when:** all actions are thin wrappers; no behaviour change in the web UI; tests green.

---

## PHASE 6: Pagination, projection, DTOs [FUTURE]

**Trigger:** appointment count in the thousands, an admin page feels slow, or you start Phase 7 (API contracts need DTOs anyway).

Tasks:
- [ ] Add cursor- or page-based pagination (with a hard max page size) to: `getAdminAppointments`, `getCustomerDetailAction` (appointments), `getWalkInCustomersAction`, `getServicesAction`, staff listing.
- [ ] Add DB indexes that match the real query patterns (e.g. appointments by status + start time, by customer). Confirm with `EXPLAIN` on realistic seeded data (seed a few thousand rows to test).
- [ ] Introduce DTOs (explicit `select` fields) so queries return only what the UI/API needs. Remove internal IDs where not needed (e.g. business settings `id`), and stop returning full customer relations when only a name/phone is used.
- [ ] Update the UI to handle paged data (load more / page controls).

**Done when:** list endpoints have bounded responses; `EXPLAIN` shows indexes used; admin pages still behave.

---

## PHASE 7: JSON route handlers with Bearer auth [FUTURE]

**Trigger:** Phase 5 complete and mobile work is about to start.

Tasks:
- [ ] Create `app/api/v1/...` route handlers that call the Phase 5 services and return JSON via `Response.json(...)` with correct HTTP status codes mapped from the error codes (400/401/403/404/409/500).
- [ ] Auth: each handler authenticates using the existing guards (or a thin API variant) and must work with `Authorization: Bearer <Clerk session token>`. Confirm Clerk middleware config matches this request path (the matcher must include `/api` routes and not redirect unauthenticated API calls to a sign-in page; return 401 JSON instead).
- [ ] **Prove Bearer auth end to end** with a real token before building more: a test route returning the current user's id/role, called from a REST client with a token from a Clerk session. Document the exact steps.
- [ ] Endpoints, in order: `GET /me`, `GET /services` (public, active only), `GET /availability`, `POST /appointments`, `GET /appointments` (own), `POST /appointments/:id/cancel`. Admin endpoints come later and only if the mobile app needs them.
- [ ] Ownership and role checks must be enforced server-side in every handler (never trust IDs from the client).
- [ ] Add an API contract doc (`docs/api.md`) listing routes, request/response shapes, and error codes.
- [ ] Confirm CORS/headers needs for Expo (native apps generally don't need CORS, but a PWA/web client does).
- [ ] Remember serverless constraints: no in-memory state, DB via pooler (`DATABASE_URL`, port 6543), keep handlers short.

**Done when:** a REST client can complete: sign in token -> list services -> check availability -> book -> list own bookings -> cancel, with correct errors for each failure case.

---

## PHASE 8: Mobile client decision, reminders, hardening [FUTURE]

**Trigger:** real customers asking for an app or reminders.

Decisions to make (owner decides; agent should lay out trade-offs when asked):
- [ ] **PWA vs native (Expo).** PWA: cheapest, no store review, weaker native features, limited iOS push. Expo: native feel, store presence, needs Phase 7 API and ongoing maintenance.
- [ ] **Reminders / background jobs.** Serverless handlers cannot run timers. Needs a scheduler (e.g. Supabase cron / scheduled function / Netlify scheduled function) plus an SMS/WhatsApp/email/push provider.
- [ ] **Rate limiting** on public/auth-adjacent API routes (e.g. Upstash or similar) once the API is public.
- [ ] **Monitoring/error tracking** (e.g. Sentry) and basic uptime checks before real customers rely on it.
- [ ] **Backups** policy for the production database before real customer data exists.
- [ ] **Clerk limits and cost** check (MAU limits, custom domain tier) before launch.
- [ ] Re-check Supabase connection limits and consider moving to a higher tier when traffic grows.

---

## Appendix: quick reference

- Env vars: `DATABASE_URL` (pooler, port 6543, runtime), `DIRECT_URL` (direct, port 5432, Prisma CLI migrations). Never print values.
- Guards: `requireActiveUser`, `requireAdmin`, `requireOwnerAdmin`, `requireSuperAdmin` in `lib/auth/index.ts`.
- Audit source: `docs/backend-api-audit.md`.
- Constraint note: the exclusion constraint lives in raw SQL in a migration because Prisma's schema language cannot express it. Do not "fix" it away.
