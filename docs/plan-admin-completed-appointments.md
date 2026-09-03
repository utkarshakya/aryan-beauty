# Mini-plan — Admin view of completed appointments (auto-complete by time)

Status: **planned, not started** (parked at the user's request — pick this up in a later session).

## Goal

Give the admin a truthful view of past/completed appointments **without adding any manual status work** (no "Mark completed" button, no schema change, no new stored status).

## Decision

A confirmed appointment whose **end time has passed is treated as "Completed"** — derived at query/display time, never written to the database. The stored status stays `confirmed`.

- A past appointment that was never confirmed (`pending` from days ago) is noise and does **not** show as completed.
- Cancelled appointments are untouched and still live under the Cancelled tab (today-focused, as today).
- The customer side (`/appointments` → "Recent history") already handles past appointments — **no changes there**.

## Changes

### 1. `app/admin/page.tsx`

- Extend `StatusFilter` and `STATUS_FILTER_MAP` with `completed`.
- `completed` tab query: `where: { status: "confirmed", endTime: { lt: new Date() } }` — **no** `startTime >= today` filter (history spans dates), `orderBy: { startTime: "desc" }` (most recent first).
- "Upcoming today" section: exclude finished slots by adding `endTime: { gte: new Date() }` so a confirmed appointment that already ended this morning stops showing as upcoming.
- Status badge/empty-state handling flows through `AppointmentsList` as today.

### 2. `app/components/AppointmentsList.tsx`

- Add `completed` to the `currentStatus` union and to the `statusTabs` list (All / Pending / Confirmed / Completed / Cancelled).
- Add a `completed` entry to `STATUS_BADGE_CLASSES` (pick a distinct muted style, e.g. `bg-primary-soft text-primary-strong` or `bg-neutral-soft text-neutral` — confirm visually).
- Completed rows get **no action buttons** (no Confirm/Cancel for past work).
- Default tab stays `pending`; `All` stays today-focused.

### Not changing

- `prisma/schema.prisma` — status stays a free-form string, no enum, no new value.
- `app/admin/actions.ts` — no new server action.
- Customer-facing files (`app/(site)/appointments/*`, `app/components/NavbarClient.tsx`, etc.).

## Acceptance criteria

- [ ] Admin sees a "Completed" tab in `/admin` next to All / Pending / Confirmed / Cancelled.
- [ ] A confirmed appointment whose end time has passed appears there with a "Completed" badge and no actions.
- [ ] The tab includes completed appointments from previous days, not just today.
- [ ] Past confirmed appointments no longer appear in the "Upcoming today" section.
- [ ] Pending-in-the-past and cancelled appointments do not appear as Completed.
- [ ] No schema migration and no new admin action are required.