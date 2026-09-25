# Architecture

## Purpose

Unknown Beauty is a single Next.js application for one beauty parlour. It is a full-stack application: pages, server-side actions, authentication, and PostgreSQL access live in the same repository and deploy together. There is no separate frontend or backend service to run.

## Stack

- Next.js 16 App Router and TypeScript
- Tailwind CSS v4
- Clerk authentication
- PostgreSQL on Supabase
- Prisma ORM with `@prisma/adapter-pg`
- Netlify deployment
- Vitest for unit/integration tests

## Repository Structure

```
app/              routes, pages, layouts, server actions, and HTTP route handlers
  (site)/         public marketing and customer pages
  admin/          owner/staff admin pages
  api/            HTTP route handlers (Clerk webhooks)
  actions/        Server Actions grouped by domain
  components/     page-specific components
components/       reusable visual components
  ui/             shared primitives (Button, Container)
  appointments/   appointment-specific components
  services/       service management components
  customers/      customer-related components
  staff/          staff management components
  business/       business settings components
  auth/           auth-related components
lib/              server-side infrastructure, auth, configuration, and database code
  auth/           authorization guards, metadata sync
  db/             Prisma queries and transactions by domain
  prisma.ts       Prisma client with pg adapter
prisma/           schema, migrations, and seed data
docs/             product and engineering documentation
tests/            Vitest tests with helpers
```

### Placement Rules

| Code | Home |
|---|---|
| URL pages and layouts | `app/` |
| Server mutations invoked by forms/buttons | `app/actions/` |
| External HTTP endpoints (Clerk webhooks) | `app/api/` |
| Reusable forms, cards, lists, navigation, UI primitives | `components/` |
| Prisma queries and transactions | `lib/db/` |
| Prisma client, authorization, business configuration | `lib/` |

A server page may read from `lib/db/` directly. A mutation must be a Server Action and must validate input and authorize the caller itself.

## Design Language

Design tokens live in `app/globals.css` under `@theme`; dark-mode overrides are re-declared under `html.dark`, so `dark:*` utilities pick them up automatically. Components must never hardcode hex/RGB values — if a shade is missing, add a token.

- **Colour**: `background`, `foreground`, `muted`, `border`, `primary`/`success`/`warning`/`danger`/`neutral` each with a `-soft` companion, and `surface`/`surface-strong` for raised surfaces (cards, panels, dark-mode buttons).
- **Typography**: body text uses the system stack (`font-sans`). Headings `h1`–`h3` use Fraunces automatically via a base rule in `globals.css`; the font is loaded in `app/fonts.ts` with `next/font` (build-time, self-hosted — no runtime CDN). For display text outside headings, use the `font-display` utility. Hero-scale copy uses `text-display`.
- **Shape**: `rounded-card` (`--radius-card`) for cards/panels, `rounded-control` (`--radius-control`) for inputs and selects, `rounded-full` for buttons and pills. Elevation uses `shadow-card`.
- **Focus**: use the `focus-ring` utility for every interactive element. Never hand-roll `ring-*`/`outline-*` focus classes; the utility is defined once in `globals.css` and renders a 2px primary outline with a 2px offset so the gap shows the real background in both themes.
- **Primitives**: reach for `components/ui/` (`Button`, `Container`) before writing class strings by hand; further shared primitives are added there as patterns repeat.

Unused tokens are pruned from the built CSS until a component uses them — that is expected.

## Request Flow

```
Browser UI → Server Action or Route Handler → lib/db query → Prisma → PostgreSQL
```

For example, the booking form invokes `createAppointment`; the action verifies the Clerk session, validates the form, runs a Prisma transaction, and refreshes the appointment page. This is backend work even though it is in the same Next.js project.

## Authentication and Authorization

Clerk authenticates the person. The Prisma `User` record is the authority for ordinary application roles and account status:

- `super_admin`, `admin`, `staff`, and `customer` are application roles.
- Disabled users are denied through database checks.
- Clerk metadata is synchronized for display/integration purposes, but is not used as the authorization source of truth.
- The configured super-admin Clerk ID remains a recovery mechanism.
- Bootstrap admin IDs create an initial admin record only when it is missing; after that, the database record controls access.

Every protected page and every Server Action must perform a server-side check. Showing or hiding a navigation link is a usability feature, not a permission check.

### Auth Guards (in `lib/auth/index.ts`)

- `requireActiveUser()` — any signed-in active user
- `requireAdmin()` — active super_admin, admin, or staff
- `requireOwnerAdmin()` — active super_admin or admin only
- `requireSuperAdmin()` — configured super-admin Clerk ID only

## Data Rules

- `User` stores identity, role, and account status.
- `Customer` stores salon-specific customer data and optionally links to `User`.
- `Service.active` hides a service without deleting historical appointments.
- Appointments are never deleted for normal cancellation; status changes to `cancelled`.
- Booking conflicts use interval overlap checks and ignore cancelled rows.
- Appointment snapshots (`serviceName`, `servicePrice`, `serviceDurationMin`) captured at booking time preserve historical accuracy.
- `BusinessSettings` is a singleton (one row) controlling scheduling rules and marketing content.

## Testing Locally

Use the product itself to test customer and admin flows, then use Prisma Studio to inspect saved records:

```powershell
npm.cmd run dev
npm.cmd run prisma:studio
```

Run the test suite:

```powershell
npm.cmd run test
```

Postman is only useful for real HTTP route handlers under `app/api/`. Server Actions are tested through the forms and controls that invoke them.

## Platform Notes

- Next.js 16 uses `proxy.ts`, not `middleware.ts`, for Clerk's handshake.
- In this App Router version, page `searchParams` are asynchronous and must be awaited.
- `DATABASE_URL` is the application connection string. `DIRECT_URL` is for Prisma CLI migrations only.
- Netlify builds with `prisma generate && next build`.
- Tailwind CSS v4 uses `@theme` in `app/globals.css` for design tokens.
- Server Actions are the primary mutation mechanism; Route Handlers only for webhooks.