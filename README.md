# Unknown Beauty — Parlour Booking System

Booking and management system for a real beauty parlour. Customers sign in to book appointments, and the owner manages appointments and services from a protected admin dashboard.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Prisma, Supabase PostgreSQL, and Clerk authentication. Deploys as one full-stack Next.js app on Netlify.

## Quick Start

```powershell
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:3000`.

Required `.env` variables (see `.env.example`):

- `DATABASE_URL` — application connection to Supabase PostgreSQL
- `DIRECT_URL` — Prisma CLI connection for migrations only
- `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`
- `SUPER_ADMIN_CLERK_USER_IDS`, `BOOTSTRAP_ADMIN_CLERK_USER_IDS`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + Clerk redirect URLs

Use `npm.cmd` in PowerShell if the Windows execution policy blocks `npm.ps1`.

## Documentation

| File                                           | Purpose                                                 |
| ---------------------------------------------- | ------------------------------------------------------- |
| [docs/README.md](docs/README.md)               | Documentation index and current state summary           |
| [docs/product.md](docs/product.md)             | Product vision, roadmap, and current capabilities       |
| [docs/architecture.md](docs/architecture.md)   | Technical structure, stack, auth, and engineering rules |
| [docs/scripts.md](docs/scripts.md)             | npm scripts: local vs DB connections and URLs used      |
| [docs/ideas.md](docs/ideas.md)                 | Future possibilities (not commitments)                  |

## Verification Commands

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run db:validate
npm.cmd run build
npm.cmd run test
```

### Running the tests

`npm.cmd run test` **truncates all rows** (restart identity) in `Appointment`, `BusinessSettings`, `Customer`, `Service`, and `User` on the database named by `DATABASE_URL` in `.env`. Point it at the dev database only.

Safety rails:

- `tests/setup.ts` throws if `DATABASE_URL` is missing from `.env`, then loads that value into the test process.
- `tests/helpers/db.ts` re-checks `DATABASE_URL` is set immediately before the `TRUNCATE`.
- Tests always take `DATABASE_URL` from `.env` in their own process, so shell-level `DATABASE_URL`/`DIRECT_URL` overrides cannot retarget a test run.

To operate on production: comment the dev `DATABASE_URL`/`DIRECT_URL` lines in `.env` and uncomment the production ones, run your command, then restore.

`npm.cmd run test` never reseeds — the database is left truncated after every run (pass or fail). Seed manually with `npm.cmd run db:seed` when you want demo data back.

### Demo data

`npm.cmd run db:seed` creates:

- **9 services** — 8 active plus one inactive (Keratin Treatment) for testing the active/inactive toggle
- **6 demo customers** (`…@example.com`) with searchable names and phone numbers
- **~32 appointments** spread over the last 3 weeks and next 2 weeks — past confirmed (shown as Completed), past and future cancelled, today, and future pending/confirmed — all placed inside business hours without overlaps

The seed only owns its own rows: it replaces the `@example.com` customers and their appointments, and never touches `User`, `BusinessSettings`, or bookings you made yourself. Safe to run repeatedly.

To populate your own history on the customer "My appointments" page: sign in once (so your `User` row has your email — tests wipe it), then run `npm.cmd run db:seed`. It links 3 appointments to your account, skipped if you already have bookings.

Inspect database records with:

```powershell
npm.cmd run db:studio
```
