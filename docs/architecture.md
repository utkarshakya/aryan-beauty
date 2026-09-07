# Architecture

## Purpose

Unknown Beauty is a single Next.js application for one beauty parlour. It is a
full-stack application: pages, server-side actions, authentication, and
PostgreSQL access live in the same repository and deploy together. There is no
separate frontend or backend service to run.

## Stack

- Next.js App Router and TypeScript
- Tailwind CSS
- Clerk authentication
- PostgreSQL on Supabase
- Prisma ORM
- Netlify deployment

## Simple repository structure

The target structure is intentionally small:

```text
app/          routes, pages, layouts, server actions, and HTTP route handlers
components/   reusable visual components
lib/          server-side infrastructure, auth, configuration, and database code
prisma/       schema, migrations, and seed data
docs/         product and engineering documentation
```

During the gradual cleanup, existing code may still live under `features/` and
`shared/`. Do not move everything at once. Move one complete domain, verify it,
then remove the old location.

### Placement rules

| Code | Home |
|---|---|
| URL pages and layouts | `app/` |
| Server mutations invoked by forms/buttons | `app/actions/` |
| External HTTP endpoints, such as Clerk webhooks | `app/api/` |
| Reusable forms, cards, lists, navigation, and UI primitives | `components/` |
| Prisma queries and transactions | `lib/db/` |
| Prisma client, authorization, and business configuration | `lib/` |

A server page may read from `lib/db/` directly. A mutation must be a Server
Action and must validate input and authorize the caller itself.

## Request flow

```text
Browser UI → Server Action or Route Handler → lib/db query → Prisma → PostgreSQL
```

For example, the booking form invokes `createAppointment`; the action verifies
the Clerk session, validates the form, runs a Prisma transaction, and refreshes
the appointment page. This is backend work even though it is in the same Next.js
project.

## Authentication and authorization

Clerk authenticates the person. The Prisma `User` record is the authority for
ordinary application roles and account status:

- `super_admin`, `admin`, `staff`, and `customer` are application roles.
- Disabled users are denied through database checks.
- Clerk metadata is synchronized for display/integration purposes, but is not
  used as the authorization source of truth.
- The configured super-admin Clerk ID remains a recovery mechanism.
- Bootstrap admin IDs create an initial admin record only when it is missing;
  after that, the database record controls access.

Every protected page and every Server Action must perform a server-side check.
Showing or hiding a navigation link is a usability feature, not a permission
check.

## Data rules

- `User` stores identity, role, and account status.
- `Customer` stores salon-specific customer data and optionally links to `User`.
- `Service.active` hides a service without deleting historical appointments.
- Appointments are never deleted for normal cancellation; status changes to
  `cancelled`.
- Booking conflicts use interval overlap checks and ignore cancelled rows.

## Testing locally

Use the product itself to test customer and admin flows, then use Prisma Studio
to inspect saved records:

```powershell
npm.cmd run dev
npm.cmd run prisma:studio
```

Postman is only useful for real HTTP route handlers under `app/api/`. Server
Actions are tested through the forms and controls that invoke them.

## Platform notes

- Next.js 16 uses `proxy.ts`, not `middleware.ts`, for Clerk's handshake.
- In this App Router version, page `searchParams` are asynchronous and must be
  awaited.
- `DATABASE_URL` is the application connection string. `DIRECT_URL` is for
  Prisma CLI migrations only.
- Netlify builds with `prisma generate && next build`.
