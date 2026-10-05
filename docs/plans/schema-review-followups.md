# Schema review follow-ups

Status: not started
Scope: three schema decisions from the review session, plus two small hardening items and doc re-tracking.

## Decisions (locked)

1. `Appointment.status` → 3-value Prisma enum (`pending`, `confirmed`, `cancelled`). `completed` stays a derived display value, never persisted.
2. `Service.price` Float → Int (whole rupees). `Appointment.servicePrice` is already Int; both stay Int rupees.
3. `Service.category` stays `String` in the DB, but becomes a fixed allowlist with a dropdown + server-side validation.
4. Add `Appointment(customerId)` and `Appointment(serviceId)` indexes. **No** unique constraints on `Customer.phone`/`email` — shared family phones are legitimate.
5. "Test complete flow on a real phone" is re-tracked in `docs/product.md` as a standalone pre-launch item, not gated on the out-of-scope People/permissions feature.

Explicitly out of scope: capability-based permissions (future note in `product.md`), Clerk `prefetchUI` headless redesign (closed), Customer uniqueness constraints.

Open choice to confirm while executing: `docs/product.md:78` claims "duration 15–480 min" validation which the code does not enforce (only integer `> 0`). Default is to correct the doc to match the code unless told otherwise.

## Step 0 — Pre-flight data checks (dev + prod)

Run against the dev database first, then production (README.md env-swap procedure, line 56). Fix or decide on anything unexpected **before** writing migration SQL.

- [ ] `SELECT DISTINCT status FROM "Appointment"` — expect only `pending`/`confirmed`/`cancelled`. If any hand-set `completed` rows exist (e.g. edited via Studio), remap `completed → confirmed` in the migration SQL; the derived display still shows Completed for past ones.
- [ ] `SELECT price FROM "Service" WHERE price <> trunc(price)` — any fractional prices get `round()`ed by the migration. Review the result rows if any exist.
- [ ] `SELECT DISTINCT category FROM "Service"` — build the final allowlist: Hair, Skin, Nails, Makeup, Other, plus any real production values worth keeping. Typo values get `UPDATE`d to `'Other'` in the migration.

## Step 1 — Schema + constants

`prisma/schema.prisma`:

- [ ] `status String @default("pending")` → `status AppointmentStatus @default(pending)`.
- [ ] Add `enum AppointmentStatus { pending confirmed cancelled }` (lowercase values, matching `UserRole`/`UserStatus` style and every existing literal in the codebase).
- [ ] `price Float` → `price Int`.
- [ ] Add `@@index([customerId])` and `@@index([serviceId])` to `Appointment` (alongside the existing `@@index([startTime])`).

New file `lib/constants.ts` (no constants file exists today):

- [ ] Export `SERVICE_CATEGORIES` (`as const`) with the final list from Step 0 and a derived `ServiceCategory` type.

## Step 2 — Migration (create-only, hand-edited, dev-verified)

- [ ] `npm run db:migrate -- --create-only`, then edit the generated SQL. Prisma's raw `ALTER ... TYPE` for text→enum and double→int usually fails on Postgres without a `USING` clause. Keep Prisma's statement order; expected shape:

```sql
CREATE TYPE "AppointmentStatus" AS ENUM ('pending','confirmed','cancelled');
-- + any category/status data fixes from Step 0
ALTER TABLE "Appointment"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "AppointmentStatus" USING "status"::"AppointmentStatus";
ALTER TABLE "Service"
  ALTER COLUMN "price" TYPE INTEGER USING round("price")::INTEGER;
CREATE INDEX "Appointment_customerId_idx" ON "Appointment"("customerId");
CREATE INDEX "Appointment_serviceId_idx" ON "Appointment"("serviceId");
```

- [ ] Apply to dev (`npm run db:migrate`) and fix any SQL errors there — never discover migration problems on production.
- [ ] `npm run db:validate`.

## Step 3 — Code changes

### Status enum fallout (small — string literals remain assignable to the enum)

- [ ] The one real break: `getAdminAppointments(statusFilter: string[] | undefined)` at `app/actions/appointments.ts:299` — `string[]` no longer satisfies Prisma's `in` filter (:346, :350). Fix: type `STATUS_FILTER_MAP` at `app/admin/page.tsx:27` as `Record<StatusFilter, AppointmentStatus[] | undefined>` with `completed: undefined`, pass `completed: statusParam === "completed"` through the action's `opts`, and detect `completedFilter` from that flag instead of `statusFilter[0]` (`app/actions/appointments.ts:311`).
- [ ] Run `npm run typecheck` to catch anything the exploration missed (`lib/db/appointments.ts`, seed, tests, `badgeTone` all use valid literals and should pass unchanged).
- [ ] Optional cleanup: `SeedStatus` union at `prisma/seed.ts:30` → import `AppointmentStatus` from `@prisma/client`.

### Price → Int

- [ ] `app/actions/services.ts:43,88` (create + update): `Number.isFinite(price)` → `Number.isInteger(price)` with message "Price must be a whole number of rupees". Also reject a missing/empty price field — `Number(null)` → `0` currently passes validation and would create a free service.
- [ ] `components/services/ServiceForm.tsx:21` and `components/services/ServiceEditor.tsx:51`: matching integer checks.
- [ ] Optional: drop the now-redundant `Math.round(...)` around prices at the 7 render sites (`ServiceCard.tsx:23`, `ServiceEditor.tsx:23`, `BookingForm.tsx:231`, `AppointmentGroup.tsx:53`, `AppointmentDetail.tsx:149`, `AdminAppointmentsList.tsx:206,308`).

### Category allowlist

- [ ] `app/actions/services.ts:33,78` (create + update): validate `category` against `SERVICE_CATEGORIES`, return `errors.category` otherwise (no silent coercion).
- [ ] `components/services/ServiceForm.tsx:69` and `components/services/ServiceEditor.tsx:117`: replace the free-text `<Input>` with `<Select>` (`components/ui/controls.tsx:50`) listing `SERVICE_CATEGORIES`.
- [ ] Leave `app/components/ServicesFilter.tsx` data-derived — phantom pills become impossible once writes are constrained.

## Step 4 — Docs

- [ ] `docs/product.md:116`: reword to a standalone pre-launch checklist item, independent of the People/permissions feature ("run the full product flow on a real phone before launch").
- [ ] `docs/product.md:77-78`: service management bullets — whole-rupee price, fixed category list; resolve the stale "duration 15–480 min" claim (default: correct the doc to match code).
- [ ] Optional: one-liner in `docs/architecture.md` Data Rules (status is an enum with derived Completed, prices are whole rupees, categories are a fixed set).

## Step 5 — Verification

- [ ] `npm run db:validate`
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test` (truncates + reseeds the dev DB)
- [ ] `npm run build`
- [ ] Manual smoke: decimal price rejected with a clear message, category dropdown works on create + edit, book → confirm → cancel → restore on both admin and customer pages.

## Step 6 — Production rollout (order matters)

Netlify's build only runs `prisma generate && next build` — it does **not** apply migrations.

- [ ] Prod env swap in `.env` (README.md:56) → `npm run db:migrate:deploy`.
- [ ] Push → Netlify deploy. Migrating first is safe: the old deployed code binds text params that Postgres coerces to the enum/int during the window.

## Follow-ups noted, not in this round

- No unique constraint on `Customer.phone`/`email` (intentional — shared phones).
- `Appointment` has no index on `status` alone; revisit if queries slow down.
- `BusinessSettings` singleton not DB-enforced; `getBusinessSettingsOrCreate` handles it correctly.
- Clerk `prefetchUI={false}` mobile perf avenue is closed (SDK race condition) — headless Clerk redesign not justified now.
