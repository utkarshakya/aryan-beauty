# Architecture

This document records the stable technical direction and important engineering principles. It should describe the system as it is intended to be built, not temporary implementation details.

## Target Stack

- **Application:** Next.js + TypeScript
- **UI:** Tailwind CSS
- **Backend:** Next.js server-side code and Route Handlers in the same application
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Database hosting:** Supabase
- **Authentication:** Clerk
- **File storage:** Supabase Storage
- **Payments:** Razorpay when payments are introduced
- **Email:** SMTP when notifications are introduced
- **AI:** OpenAI API when AI features are introduced
- **Deployment:** Netlify

## Application Architecture

Use a Next.js monolith. The active application lives at the repository root. The customer-facing UI, owner-facing UI, server-side application logic, and API routes live in one application.

Keep boundaries clear inside the monolith rather than introducing separate frontend and backend applications unless a real requirement appears.

The current application is intentionally starting from a clean Next.js foundation rather than migrating the old client/server architecture directly.

## Repository Structure

```text
unknown/
├── app/          # Active Next.js application
├── public/       # Static assets
├── docs/         # Product and engineering documentation
└── ...           # Next.js configuration and project files
```

The active code is at the repository root.

## Data

PostgreSQL is the primary application database. Prisma is used to model and access application data.

The database should evolve with the product. Do not create a large schema for hypothetical future features before they are needed.

## Authentication and Access

Clerk handles authentication.

Clerk handles authentication. Application roles are stored in the Prisma `User` model and linked to Clerk through `clerkUserId`. The product creator's super-admin Clerk ID is kept in protected environment configuration. Bootstrap admin IDs may be used to create initial admin records, after which ordinary admin and staff access is read from the database.

Admin functionality must be protected. Public customer pages should remain simple and accessible without unnecessary authentication. Every protected page and server action must check the current user's role and active status on the server. Client-side navigation visibility is only a usability feature and is not an authorization boundary.

## Storage

Supabase Storage is used for application-managed images and other files when file storage is needed.

## Engineering Principles

- Keep the user experience simple, especially for the non-technical salon owner.
- Prefer the simplest architecture that solves the current problem.
- Avoid premature abstractions and infrastructure.
- Keep product concerns and infrastructure concerns understandable.
- Build around real salon workflows.
- Keep AI capabilities modular so they can evolve independently.
- Update this document when a significant architectural decision changes.

## Platform Notes

- **Next.js 16 middleware:** the middleware file is `proxy.ts` at the repo root (not `middleware.ts`, not inside `app/`). It must not set a `runtime` config — Next 16 throws on it.
- **Auth enforcement:** `createRouteMatcher` is deprecated in this Clerk/Next setup. Auth is enforced per-resource: every protected page/server action calls `await auth.protect()` or checks `await auth()` itself. `proxy.ts` holds no auth logic — it only exists so Clerk's handshake works.
- **`searchParams`:** in Next 16 App Router pages, `searchParams` is a `Promise` and must be awaited before use.
- **Prisma 7.9.1 + `prisma.config.ts`:** the datasource block only supports a `url` property. Do NOT add `directUrl` to it — this Prisma version does not support that property on the datasource config object.
- **Connection strings:** `DATABASE_URL` (Supabase transaction pooler) is used by the running app at all times. `DIRECT_URL` (Supabase direct connection) is used only for CLI commands (`prisma migrate deploy`, etc.), never referenced in application code or `prisma.config.ts`.
- **`Appointment.status`:** intentionally a plain `String`, not a Prisma enum, so new status values don't require a migration. Do not convert it to an enum without an explicit request.
- **`Service.active`:** services are soft-hidden with an `active` boolean instead of being deleted. Public service and booking queries must include only active services; historical appointments continue to reference inactive services.
- **Appointment overlap check:** a slot is unavailable if `existing.startTime < newEnd && existing.endTime > newStart`, ignoring rows where `status === "cancelled"`. This runs inside a Prisma interactive transaction alongside the customer upsert and appointment create.
- **Customer lookup:** signed-in customers use `customer.upsert` keyed on the unique `clerkUserId` field. Phone is optional contact data and is not an identity key.
- **Auth model:** Clerk handles authentication. The Prisma `User` model stores `super_admin`, `admin`, `staff`, and `customer` roles plus account status. The super admin is identified by protected Clerk user ID configuration; bootstrap admin IDs are only for initial setup. Normal signed-in users can book but cannot access admin routes unless they have an active authorized role.
- **Netlify build command:** `prisma generate && next build`.
- **Netlify env vars** — secret: `DATABASE_URL`, `CLERK_SECRET_KEY`. Public (`NEXT_PUBLIC_*`): the Clerk publishable key and sign-in/up/redirect URLs.
