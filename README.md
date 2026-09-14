# Unknown Beauty — Parlour Booking System

Booking and management system for a real beauty parlour. Customers sign in to
book appointments, and the owner manages appointments and services from a
protected admin dashboard.

Built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma, Supabase
PostgreSQL, and Clerk authentication. It deploys as one full-stack Next.js app
on Netlify.

## Running locally

```powershell
npm.cmd install
npm.cmd run dev
```

Then open `http://localhost:3000`.

Required `.env` variables (see `.env.example` for placeholders):

- `DATABASE_URL` — application connection to Supabase PostgreSQL
- `DIRECT_URL` — Prisma CLI connection for migrations only
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET` — required for Clerk user-sync webhooks
- `SUPER_ADMIN_CLERK_USER_IDS`
- `BOOTSTRAP_ADMIN_CLERK_USER_IDS`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Clerk sign-in/sign-up and fallback redirect URLs

Use `npm.cmd` in PowerShell if the Windows execution policy blocks `npm.ps1`.

## Manual testing checklist

Run through before each release and after a fresh environment. Booking and admin
mutations are Next.js Server Actions, so test them through the app UI — Postman
is only needed for HTTP Route Handlers under `app/api/`.

### Customer

- [ ] Sign in and sign up through Clerk both work.
- [ ] Book: pick a service and a valid future slot → success message with the
      chosen time.
- [ ] Invalid phone number → inline error.
- [ ] A time in the past, or a slot for a closed day/date, is not offered.
- [ ] Refresh: the booking appears under upcoming appointments.
- [ ] Cancel an upcoming appointment (beyond the cutoff) → it moves to history.
- [ ] Cancelling inside the cutoff window is rejected with the cutoff message.
- [ ] No way to see or cancel another customer's appointment.

### Owner

- [ ] `/admin` loads today's appointments; Pending is the default tab.
- [ ] Confirm a pending appointment → moves to confirmed; re-submitting is a
      silent no-op.
- [ ] Cancel an upcoming appointment → cancelled; Restore brings it back to
      confirmed.
- [ ] A confirmed appointment whose end time passed shows as Completed with no
      Confirm/Cancel/Restore actions.
- [ ] Picking a past date shows that day's appointments; All dates drops the
      today-anchor and orders newest first.
- [ ] Search by customer name or partial phone finds appointments from any date;
      empty results show a clear "no match" state with a Clear search link.
- [ ] The active tab and search term survive switching between Today / All
      dates / status tabs.
- [ ] `/admin/appointments/[id]` shows customer contact, service snapshot (name,
      price, duration), date/time, notes, and status; an invalid id returns 404.
- [ ] Service management in `/admin/services`: create, edit, activate, and
      deactivate; deactivated services disappear from booking and public pages.

### Business settings

- [ ] `/admin/settings` saves opening hours, closed weekdays, closures, slot
      interval, minimum booking notice, and cancellation cutoff.
- [ ] A saved change affects new availability only — existing appointments are
      untouched.
- [ ] Marketing fields (tagline, description, phone, address) appear on the
      public pages.

### Access and safety

- [ ] A customer cannot reach `/admin` (redirected).
- [ ] Staff reaches `/admin` but not owner-only settings.
- [ ] A disabled account loses access on the next request (role/status are read
      from the database, not the session).
- [ ] A webhook-driven profile update does not change a user's role or disabled
      status.

### Devices and accessibility

- [ ] Customer and owner flows work on phone, tablet, and desktop.
- [ ] Keyboard navigation works: every input and button reachable with Tab, focus
      is visible, inputs are labelled.
- [ ] Text has sufficient contrast and pages do not overflow horizontally on a
      phone.

Inspect saved `User`, `Customer`, `Service`, and `Appointment` records with:

```powershell
npm.cmd run prisma:studio
```

## Verification commands

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run prisma:validate
npm.cmd run build
```

## Documentation

See [docs/README.md](docs/README.md) for the product vision, architecture, and
active implementation plan.
