# Plan: Step 5 — Owner Appointment Management

## Goal
Let the parlor owner (signed in via Clerk) see and manage bookings at `/studio`: view upcoming appointments, filter by status, confirm a pending one, or cancel one. This is the staff-facing half of booking — Step 4 got appointments *into* the database; this step lets a human actually act on them.

## Decisions
- **Default view**: upcoming appointments (`startTime >= start of today`), sorted soonest-first. Default filter excludes cancelled (shows Pending + Confirmed); status tabs let the owner switch to All / Pending / Confirmed / Cancelled via `?status=...`.
- **Cancel = soft delete**: cancelling sets `status = "cancelled"`, never deletes the row. Preserves history, is reversible, and matches the conflict-check logic in `app/actions.ts` (`status: { not: "cancelled" }`).
- **Actions**: two owner actions only — Confirm (`pending` → `confirmed`) and Cancel (non-cancelled → `cancelled`). No edit-in-place, no "completed" status this step — `status` is a plain string field, so adding more values later needs no migration if it comes up.
- **Auth**: page keeps `auth.protect()` (existing, redirects if signed out). Server Actions use `auth()` + manual check that throws an `Error` instead — `auth.protect()`'s redirect doesn't make sense mid-mutation; `useActionState` needs a catchable error to show instead.
- **Cancel confirmation**: native `confirm()` dialog before submitting a cancel — cheap protection against an accidental tap.
- **No timezone library, no pagination, no toasts**: single-timezone parlor, small appointment volume expected, and inline success/error messaging (same pattern as `BookingForm`) covers feedback without new dependencies. Revisit only if real usage shows a need.
- **Server Actions, not a Route Handler**: new file `app/studio/actions.ts`, separate from the public `app/actions.ts` — keeps "public, no auth" and "owner, auth required" clearly separated by file.
- **Revalidation**: after confirm/cancel, `revalidatePath("/studio")` refreshes the list.
- **No role system**: anyone signed in via Clerk = owner/staff. Fine for a single-owner parlor.

## Prerequisites
- Step 4 complete: real `Appointment`/`Customer` rows exist via the booking flow.
- Step 2 complete: `/studio` already protected by `auth.protect()`.

## Tasks

### T1 — Fetch appointments in `/studio`
- [ ] Update `app/studio/page.tsx`: read `searchParams.status` (default: `["pending", "confirmed"]`; `"all"` means no status filter)
- [ ] `prisma.appointment.findMany({ where: { startTime: { gte: startOfToday }, status: statusFilter }, include: { customer: true, service: true }, orderBy: { startTime: "asc" } })`
- [ ] Pass appointments + current status filter as props to `AppointmentsList`

### T2 — Owner Server Actions
- [ ] Create `app/studio/actions.ts` with `"use server"`
- [ ] Helper: `async function requireOwner() { const { userId } = await auth(); if (!userId) throw new Error("Unauthorized"); return userId; }`
- [ ] `confirmAppointment(id: number)`: `requireOwner()`, `prisma.appointment.update({ where: { id }, data: { status: "confirmed" } })`, `revalidatePath("/studio")`
- [ ] `cancelAppointment(id: number)`: same shape, sets `status: "cancelled"`

### T3 — `AppointmentsList` component
- [ ] Create `app/components/AppointmentsList.tsx` — table/list: customer name + phone, service name, date/time, status badge
- [ ] Status badge colors: Pending (yellow), Confirmed (green), Cancelled (gray)
- [ ] Confirm button: only when `status === "pending"`, bound via `.bind(null, appointment.id)`
- [ ] Cancel button: when `status !== "cancelled"`, wrapped with a `confirm()` prompt before submitting
- [ ] Status filter tabs: All / Pending / Confirmed / Cancelled as links with `?status=...`
- [ ] Empty state: "No appointments" message
- [ ] Decide Server vs Client Component: plain `<form action={...}>` buttons need no client state — likely stays a Server Component; only the `confirm()` cancel-guard needs a small Client Component wrapper around the Cancel button specifically

### T4 — Verify
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm run dev`
- [ ] Book a test appointment (Step 4 flow), confirm it shows in `/studio`
- [ ] Confirm it → status updates to Confirmed, Confirm button disappears
- [ ] Cancel it → confirm() prompt appears, then status updates to Cancelled, row stays visible
- [ ] Sign out → `/studio` redirects to sign-in (auth still enforced)
- [ ] Cancelled appointment's old time slot becomes bookable again (conflict check already ignores cancelled)
- [ ] Status filter tabs work: default view excludes cancelled; "All" shows everything

### T5 — Legacy cleanup
- [ ] Grep `legacy/server` for references to appointment files before deleting
- [ ] Delete `legacy/server/controllers/appointmentController.js`
- [ ] Delete `legacy/server/routes/appointmentRoutes.js`
- [ ] Delete `legacy/server/validators/appointmentValidator.js`
- [ ] Delete `legacy/server/models/appointmentModel.js`
- [ ] Remove any now-broken imports in `legacy/server` that referenced these files
- [ ] Confirm nothing else in `legacy/server` still references them

## Files to create or modify
| File | Action |
|---|---|
| `app/studio/page.tsx` | modify — fetch appointments with status filter |
| `app/studio/actions.ts` | create — `confirmAppointment`, `cancelAppointment` with auth check |
| `app/components/AppointmentsList.tsx` | create — list, status badges, filter tabs, confirm/cancel actions |
| `legacy/server/**` (appointment files) | delete, after T4 passes and grep confirms it's safe |

## Edge cases and failure handling
- Double-confirm or confirm-after-cancel: guarded in UI (button hidden) but also idempotent in DB — no crash either way.
- Server Action auth: `auth()` + throw, not `auth.protect()` — actions need a catchable error, not a redirect, since they're invoked via form submission rather than page navigation.
- Cancelling frees the slot automatically — no separate "release" logic needed, since `app/actions.ts`'s conflict check already filters `status: { not: "cancelled" }`.
- Cancel confirmation only needs to wrap the Cancel button in a tiny Client Component (`"use client"`) that calls `confirm()` before calling the bound action — the rest of the list can stay server-rendered.

## Done When
- Owner sees a filterable appointment list at `/studio`, defaulting to Pending + Confirmed, upcoming-first
- Confirm / Cancel actions work; Cancel requires an "are you sure" prompt
- Cancelled appointments are kept (not deleted) and free up their time slot for new bookings
- `/studio` still requires sign-in; Server Actions also enforce auth independently
- Legacy appointment files removed from `legacy/server`
- Build green; `/`, `/services`, `/book`, `/studio` all work

## Next Step
Deploy (per `plan.md` Phase 1's last unchecked item) — or revisit notifications/timezone/multi-slot handling if real usage surfaces gaps first.
