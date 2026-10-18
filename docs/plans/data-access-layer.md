# Data access layer — per-request dedup and bounded queries

Status: Ready to implement. Next: Phase 1.
Scope: `lib/db/`, `lib/auth/`, and the three `(site)` pages that inline Prisma. No client-side fetching, no cross-request caching, no new runtime deps.
Decisions (locked): there is **no separate backend** — do **not** route server components through HTTP; the fix is in-process `cache()` dedup plus bounded SQL; only public-safe reads (active services, business settings) are candidates for cross-request caching and that is deferred to a later plan; per-user data must never be shared-cached.

## Findings this plan is based on

**Premise correction.** `docs/architecture.md:5` — *"There is no separate frontend or backend service to run."* This is one Next.js full-stack app deployed as a single Netlify app. A server component calling `prisma` is the server doing its own IO, not a client reaching into the database. Adding `fetch("/api/...")` would insert a network round trip plus serialize/deserialize in front of the *same* Postgres query — strictly slower, and it buys nothing because the route handler has no cache either. The real complaint ("this is slow") is valid; the proposed mechanism is not.

**Nothing is cached anywhere.** No `cache()`, no `unstable_cache`, no `'use cache'`, no `cacheComponents` in `next.config.ts` (which contains only `allowedDevOrigins`). Consequence: every `revalidatePath()` in the five `app/actions/*` files is a **no-op** — all 7 data pages are `force-dynamic`, so there is no full-route cache entry to invalidate. The "refresh after mutation" intent is currently inert. Fixing that needs `cacheComponents: true` + `cacheTag`, which enables Partial Prerendering app-wide and makes all rendering dynamic-by-default — that collides with the zero-Suspense decision at `docs/plans/mobile-first-ui.md:61` and deserves its own plan.

**The same row is read 3× per render.** On `/appointments`: `Navbar`'s `hasAdminAccess` → `getAppUserAccess` (`lib/auth/index.ts:47`), then `requireActiveUser()` → `getAppUserAccess` again, then `prisma.user.findUnique` for the *same* user a third time at `app/(site)/appointments/page.tsx:53`. React `cache()` collapses these to one. The repo never imports `cache` from `react`. `requireOwnerAdmin()` (`lib/auth/index.ts:121-123`) is 2 queries by itself.

**Business settings is read twice per public page.** The page calls `getBusinessSettingsForDisplay()` and `Footer` (rendered from `app/(site)/layout.tsx:13` *and* `app/admin/layout.tsx:15`) calls it again on the same request.

**Convention break.** `docs/architecture.md:56` — *"A server page may read from `lib/db/` directly."* `app/(site)/appointments/page.tsx` imports `prisma` and writes three raw queries inline. The active-services query is byte-identical across three places — `app/(site)/appointments/page.tsx:65-68`, `app/(site)/services/page.tsx:16-19`, `app/(site)/page.tsx:10-14` (the last adds `take: 3`) — despite `getActiveServices()` existing at `lib/db/services.ts:26` with the identical `where`/`orderBy`.

**Unbounded read.** `app/(site)/appointments/page.tsx:59-62` `include`s **every** appointment the customer has ever made, then `.slice(0, 10)` in memory at line 90. The bound belongs in SQL.

**Neither the customer row nor the relation join is needed.** `Appointment` denormalizes `serviceName`/`servicePrice`/`serviceDurationMin` as scalar columns (`prisma/schema.prisma`), and `components/appointments/AppointmentGroup.tsx:17-25` reads only those plus `id`/`startTime`/`endTime`/`status`. So the `include` is pure over-fetch, and the customer lookup at line 57 fetches a row whose only use is `.appointments`. Prisma can filter straight through the relation with `where: { customer: { userId } }`, removing that query entirely.

**Dead and duplicated `lib/db` code.** `getRecentHistory` (`lib/db/appointments.ts:53`) re-queries twice per call and has no callers; `getUpcomingAppointmentsByCustomer` (`:43`) is called only by `getRecentHistory`; `getCustomerWithAppointments` is duplicated at `lib/db/appointments.ts:74` and `lib/db/customers.ts:78` (only the latter is imported, by `app/actions/customers.ts:118`); `getCustomerById` (`customers.ts:31`) and `getBusinessSettings` (`business.ts:46`) have no callers; read actions `getMyProfile`, `getCustomerDetailAction` and `getActiveServicesAction` are defined but never imported.

---

## Standing rules (apply to every phase)

- **Definition of done per phase:** `npm run lint` → `typecheck` → `test` → `build` pass before a phase is checked off.
- **No new runtime deps.** `cache()` comes from `react`, already installed.
- **`cache()` wraps the raw DB read, not the display mapper.** Memoize the query; let callers build their own view of the result. This keeps a shared, possibly writable row from being aliased across callers.
- **`cache()` keys on arguments** — a memoized function with an optional `take`/`limit` correctly produces separate entries per value. No manual key management.
- **Behaviour parity is mandatory.** The upcoming/history split must classify exactly as today, including the cancelled-future-booking case (see Phase 2).
- **Do not touch `revalidatePath`, `next.config.ts`, or add `cacheComponents`** in this plan.
- **Do not add API routes or `fetch` calls** in this plan.

## Phase 1 — Per-request dedup with React `cache()`

- [ ] Wrap `getAppUserAccess` (`lib/auth/index.ts:47`) in `cache()`. Biggest single win: collapses the Navbar/guard/page triple lookup to one on every page, and drops `requireOwnerAdmin` to a single query. Key is the `userId` string, so the `null` early-return in `hasAdminAccess` (`lib/auth/index.ts:76`) still short-circuits before the memoized function is reached.
- [ ] Wrap `getBusinessSettingsOrCreate` (`lib/db/business.ts:50`) in `cache()`. Page + `Footer` share one read. It writes on first call, but it is already idempotent — the `P2002` retry at `lib/db/business.ts:85-96` handles the race, so collapsing to one call per request is correct. Leave `getBusinessSettingsForDisplay`/`getBusinessSettingsForAvailability` uncached so each builds its own object from the shared row.
- [ ] Wrap `getActiveServices` (`lib/db/services.ts:26`) in `cache()`.
- [ ] Confirm `cache()` is imported from `react` (not `next/cache`) — this is request-scope memoization, not the cache directive.

**Phase 1 DoD:** `lint` ✓ `typecheck` ✓ `test` ✓ `build` ✓ + manual query-count check on `/` and `/admin` via the Postgres query log.

## Phase 2 — Bounded appointment queries

- [ ] Replace `getRecentHistory` and `getUpcomingAppointmentsByCustomer` (`lib/db/appointments.ts:43,53`) with two helpers keyed on the app-user id, filtering through the relation so no customer lookup is needed:
  - `getUpcomingAppointmentsForUser(userId, now?)` — `where: { customer: { userId }, startTime: { gte: now }, status: { not: "cancelled" } }`, `orderBy: { startTime: "desc" }`, `take: MAX_UPCOMING`.
  - `getRecentHistoryForUser(userId, now?, limit = 10)` — `where: { customer: { userId }, OR: [{ startTime: { lt: now } }, { status: "cancelled" }] }`, `orderBy: { startTime: "desc" }`, `take: limit`.
- [ ] The `OR` branch is the behaviour-preserving subtlety: today a **cancelled future booking is not upcoming** and therefore falls into history. Dropping the `status: "cancelled"` arm silently loses those rows from the page.
- [ ] `now` defaults to `new Date()` and is a parameter so tests can pin it. Keep `MAX_UPCOMING` generous enough not to truncate a real customer's bookings.
- [ ] Drop the vestigial `a && a.startTime` guards from the current inline split — `startTime` is non-nullable on `Appointment`.
- [ ] Return `Appointment` rows unjoined (no `include: { service }` / `{ customer }`), since the denormalized columns already carry what `AppointmentGroup` renders.

**Phase 2 DoD:** `lint` ✓ `typecheck` ✓ `test` ✓ `build` ✓ + new `tests/db/appointments.test.ts` cases (cancelled-future → history; history capped at `limit`; upcoming excludes cancelled).

## Phase 3 — Move the pages onto `lib/db/`

- [ ] `app/(site)/appointments/page.tsx:53-90` becomes a single `Promise.all` over the four helpers so the two appointment queries run concurrently with services and business settings. Move `MAX_HISTORY` and the split into `lib/db`. Delete the `prisma` import.
- [ ] Leave `page.tsx:77-81` alone: the `Number("abc")` → `NaN` guard on `?serviceId=` is load-bearing (`NaN` is truthy and would open the wizard on a nonexistent service).
- [ ] `app/(site)/services/page.tsx:16-19` → `getActiveServices()`.
- [ ] `app/(site)/page.tsx:10-14` → `getActiveServices(3)`: add an optional `take` to `getActiveServices`. Existing no-arg callers (`app/actions/services.ts:24`, `tests/db/appointments.test.ts:78`) are unaffected.
- [ ] Re-grep for `prisma` imports under `app/` — `not-found.tsx` and `Footer.tsx` still legitimately reach for it.

**Phase 3 DoD:** `lint` ✓ `typecheck` ✓ `test` ✓ `build` ✓ + `/`, `/services`, `/appointments` render identically (upcoming/history split, `?serviceId=` preselect, empty-services state).

## Phase 4 — Dead-code cleanup (separate commit)

- [ ] Re-confirm zero importers for each before deleting; re-run the grep after.
- [ ] Delete: `getRecentHistory`, `getUpcomingAppointmentsByCustomer`, `getCustomerWithAppointments` (`lib/db/appointments.ts:43,53,74`), `getCustomerById` (`lib/db/customers.ts:31`), `getBusinessSettings` (`lib/db/business.ts:46`), and the unused read actions `getMyProfile`, `getCustomerDetailAction` (`app/actions/customers.ts:19,116`), `getActiveServicesAction` (`app/actions/services.ts:23`).
- [ ] **Keep** `getCustomerWithAppointments` in `customers.ts` (used by `app/actions/customers.ts:118`) and **keep** `getActiveServices` in `services.ts` — both are stubbed in `tests/actions/error-shape.test.ts:26,45`, which mocks by module export name.
- [ ] Note `getActiveServicesAction` is the one read action with no `require*()` guard; deleting it removes that inconsistency rather than fixing it.

**Phase 4 DoD:** `lint` ✓ `typecheck` ✓ `test` ✓ `build` ✓, committed separately from Phases 1–3 so it can be reverted alone.

## Phase 5 — Verification

- [ ] `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
- [ ] Query count on `/appointments`: expect **7 → 5** (Navbar user read, guard user read, page user read, customer+appointments, services, page business read, footer business read → one shared user read, two bounded appointment reads, one services read, one shared business read).
- [ ] Confirm `npm test` still passes at or above the current count, and that `tests/db/appointments.test.ts` covers the new helpers against the real DB via `tests/helpers/db.ts`.

## Out of scope (recorded, not fixed here)

- **All `revalidatePath()` calls are currently no-ops** under `force-dynamic`. Real cross-request caching needs `cacheComponents: true` + `'use cache'` + `cacheTag`/`cacheLife`, with `revalidatePath` swapped for `updateTag`. Blast radius: all 8 pages, every segment `loading.tsx`, and the PPR/streaming decision from `docs/plans/mobile-first-ui.md:61`. Worth its own plan.
- **`getBusinessSettingsForDisplay` stays uncached across requests** — page and `Footer` each build their own display object from the shared row. Cheap, and it avoids handing the same mutable object to unrelated callers.
- **Per-user data (`customer`, appointments) is never shared-cached.** It is bounded now, which is what this plan set out to fix; further caching is a privacy and correctness problem, not a performance one.
- **`getBusinessSettingsForDisplay` is still called twice per public request.** Phase 1 collapses the *query*; collapsing the *render* would mean lifting business settings into the site layout and passing it down, which is a component-graph change with no meaningful win at this scale.