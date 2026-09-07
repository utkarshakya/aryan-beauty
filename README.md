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

## How to test locally

Use the website to test the backend flows:

1. Sign in as a customer and make a booking in `/appointments`.
2. Refresh and confirm it appears under upcoming appointments.
3. Cancel an eligible appointment and confirm it moves to history.
4. Sign in as the owner and confirm the appointment appears in `/admin`.
5. Create/deactivate a service in `/admin/services`; confirm inactive services
   are absent from public booking.

Inspect saved `User`, `Customer`, `Service`, and `Appointment` records with:

```powershell
npm.cmd run prisma:studio
```

Postman is only needed for HTTP Route Handlers under `app/api/`. Booking and
admin mutations are Next.js Server Actions, so test them through the app UI.

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
