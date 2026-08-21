# Plan: Step 4 — Customer Booking

## Goal
Let a customer book an appointment from the public site without creating an account — just name + phone — writing real rows to the `Appointment` and `Customer` tables via a Server Action. Owner-facing appointment management (list/confirm/cancel) is the NEXT step; this step is customer-facing creation only.

## Decisions
- Booking form: name + phone (no account), matching `plan.md` ("customers book without accounts") and the Step 2 decision. Owner identity via Clerk is not used for customer bookings.
- Entry points: "Book Now" on `/services` cards and the Hero CTA both go to a dedicated `/book` page. Preselect the service when arriving with `?serviceId=` (e.g. `/book?serviceId=3`).
- Server Action (`use server`) creates the appointment — no Route Handler needed. Per Next.js 16 conventions, the action lives in a dedicated `app/actions.ts` and is imported by a Client Component form. Use `useActionState` for validation errors + pending state.
- Validation: manual, server-side (no new dependency — zod can be added later if forms grow). Rules recovered from legacy `appointmentValidator.js`: serviceId required + must exist, startTime required + must be in the future, notes optional ≤ 100 chars; plus name required and phone required (Indian 10-digit).
- Time slot availability: reject overlapping appointments. `endTime = startTime + service.durationMin`. Conflict rule (from legacy controller): a booked slot is unavailable if `existing.startTime < newEnd && existing.endTime > newStart`. Ignore `status = "cancelled"` when checking. Do the check + insert inside a Prisma interactive `$transaction` so two simultaneous bookings can't both win.
- Customer find-or-create: `customer.upsert` on phone so repeat customers get one row. Requires adding `@unique` to `Customer.phone` (schema change + migration).
- Timezone: form collects local date + time; convert to UTC before storing. Store everything in UTC, treat parlor-local as the single timezone for now. Do not build multi-timezone logic this step.
- Status: new appointments default to `"pending"` (schema already has this). No status changes from the customer this step.
- Success experience: on success, `useActionState` returns a success state and the form swaps to a confirmation card (service, date/time, name, phone). No confirmation email/SMS — notifications are a later phase.
- Keep `legacy/server` appointment files (controller/routes/validators/model) for now — the owner-management step still ports `getAppointments` / `updateAppointment` from them. Delete after Step 5.

## Prerequisites
- Steps 1–3 complete: `Service` table seeded, `/services` and `/` public and working.
- `DATABASE_URL` configured (already the case).

## Tasks

### T1 — Schema: unique phone on Customer
- [x] Add `@unique` to `Customer.phone` in `prisma/schema.prisma`
- [x] Fix `package.json` `prisma:migrate` — it hardcodes `--name init`; subsequent migrations need a real name (e.g. use `prisma migrate dev` and answer the prompt, or make the script name-parameterized)
- [x] Check `prisma.config.ts` — `migrations.path` is `"prisma/migratoins"` (typo); fix to `"prisma/migrations"` and confirm existing migration still resolves
- [x] Run migration + `npm run prisma:generate`

### T2 — Server Action: `createAppointment`
- [x] Create `app/actions.ts` with `"use server"`
- [x] `createAppointment(prevState, formData)` returning `{ success?: {...} } | { errors?: Record<string, string> }`
- [x] Validate: name, phone (10-digit Indian), serviceId exists, startTime future, notes length
- [x] Look up service → compute `endTime`
- [x] Availability check + create inside `prisma.$transaction(async (tx) => ...)`: find conflicting appointments, `customer.upsert` on phone, `appointment.create`
- [x] Return minimal confirmation data only (never raw DB records)

### T3 — `/book` page (Server Component)
- [x] Create `app/book/page.tsx`, `export const dynamic = "force-dynamic"`
- [x] Fetch services via `prisma.service.findMany()` for the dropdown
- [x] Read `searchParams.serviceId` (note: in Next 16 `searchParams` is a Promise — `await` it) for preselection
- [x] Render `Navbar` + `BookingForm` client component

### T4 — `BookingForm` (Client Component)
- [x] Create `app/components/BookingForm.tsx`, `"use client"`
- [x] `useActionState(createAppointment, initialState)` — fields: service select, name, phone, date, time, notes
- [x] Convert date + time → UTC ISO string before submit; pass as hidden field or in submit handler
- [x] Pending state on submit button; field-level error display; success state swaps form for a confirmation card

### T5 — Wire entry points
- [x] `app/components/ServicesFilter.tsx`: change "Book Now" `<button>` → `<Link href={`/book?serviceId=${service.id}`}>`
- [x] `app/components/Hero.tsx`: "Book Appointment" `<button>` → `<Link href="/book">`

### T6 — Verify
- [x] `npm run lint`
- [x] `npm run build`
- [x] `npm run dev`
- [x] `/services` → Book Now → `/book?serviceId=...` with service preselected
- [x] Submit valid booking → confirmation card; `Appointment` + `Customer` rows created (check `prisma:studio` or SQL)
- [x] Booking a slot overlapping an existing non-cancelled appointment → error shown
- [x] Past date rejected; invalid phone rejected
- [x] `/`, `/services`, `/sign-in`, `/studio` still behave as before (studio still protected)

## Files to create or modify
| File | Action |
|---|---|
| `prisma/schema.prisma` | modify — `@unique` on `Customer.phone` |
| `prisma/migrations/*` | new migration |
| `package.json` | modify — fix `prisma:migrate` script |
| `prisma.config.ts` | modify — fix `migrations.path` typo |
| `app/actions.ts` | create — `createAppointment` server action |
| `app/book/page.tsx` | create — Server Component |
| `app/components/BookingForm.tsx` | create — Client Component |
| `app/components/ServicesFilter.tsx` | modify — Book Now → link |
| `app/components/Hero.tsx` | modify — CTA → link |

## Edge cases and failure handling
- Server Action auth: no auth needed for public booking — do NOT add Clerk auth here. But validate everything server-side; never trust the client form.
- Race condition on the same slot: interactive `$transaction` — if two requests overlap, the second transaction's conflict query sees the first commit and fails.
- `Customer.phone` unique migration will fail on `create` only if dupes already exist — current DB has no customers, so safe.
- Timezone pitfalls: store UTC. The date input gives local wall-clock time; construct the Date accordingly (e.g. `new Date(dateStr + "T" + timeStr)`) and rely on ISO round-tripping. Avoid manual `toISOString()` on already-ISO strings.
- `searchParams` in Next 16 pages is a `Promise` — `await searchParams` before reading.
- Server Components own the DB; `BookingForm` must not import `@prisma/client` — it only imports the action and receives `services` as a prop.
- Don't build double-booking hardening beyond the transaction (no slots UI / capacity config this step — that's owner-management territory).

## Done When
- [x] Customer books from `/services` with name + phone; real `Appointment`/`Customer` rows appear
- [x] Booking still works signed out (public)
- [x] Overlap, past-time, and invalid-phone submissions are rejected with clear messages
- [x] Build green; `/`, `/services`, `/studio` unaffected

## Next Step
**Owner appointment management** — `/studio` lists appointments and lets the owner confirm/cancel (port `getAppointments` / `updateAppointment` from legacy, using `auth.protect()`). After that, delete the ported `legacy/server` appointment files per the retirement policy.
