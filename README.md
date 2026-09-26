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

| File | Purpose |
|------|---------|
| [docs/README.md](docs/README.md) | Documentation index and current state summary |
| [docs/product.md](docs/product.md) | Product vision, roadmap, and current capabilities |
| [docs/architecture.md](docs/architecture.md) | Technical structure, stack, auth, and engineering rules |
| [docs/plans/plan.md](docs/plans/plan.md) | Active implementation checklist with progress |
| [docs/plans/ui-plan.md](docs/plans/ui-plan.md) | UI/UX improvement plan |
| [docs/ideas.md](docs/ideas.md) | Future possibilities (not commitments) |

## Verification Commands

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run db:validate
npm.cmd run build
npm.cmd run test
```

### Running the tests

`npm.cmd run test` **truncates all rows** (restart identity) in `Appointment`, `BusinessSettings`, `Customer`, `Service`, and `User` on the database named by `TEST_DIRECT_URL` in `.env`. Point `TEST_DIRECT_URL` at the dev database only.

Safety rails:
- `tests/setup.ts` throws if `TEST_DIRECT_URL` is missing, then points the test process at that URL.
- `tests/helpers/db.ts` re-checks `DATABASE_URL === TEST_DIRECT_URL` immediately before the `TRUNCATE`.
- Tests overwrite `DATABASE_URL` with `TEST_DIRECT_URL` in their own process, so the `.env` values of `DATABASE_URL`/`DIRECT_URL` cannot retarget a test run.

To operate on production: comment the dev `DATABASE_URL`/`DIRECT_URL` lines in `.env` and uncomment the production ones (never touch `TEST_DIRECT_URL`), run your command, then restore. After a test run, re-seed demo data with `npm.cmd run db:seed` if needed.

## Manual Testing

See the [manual testing checklist](docs/plans/plan.md#manual-testing-checklist) in the implementation plan for customer, owner, business settings, staff management, and access/safety verification steps.

Inspect database records with:
```powershell
npm.cmd run db:studio
```