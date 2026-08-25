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
AryanBeautyParlour/
├── app/          # Active Next.js application
├── public/       # Static assets
├── docs/         # Product and engineering documentation
├── legacy/       # Legacy Express/MongoDB backend (frontend already removed)
└── ...           # Next.js configuration and project files
```

The active code is at the repository root. `legacy/` is reference-only and should not be extended as part of new development.

## Data

PostgreSQL is the primary application database. Prisma is used to model and access application data.

The database should evolve with the product. Do not create a large schema for hypothetical future features before they are needed.

## Authentication and Access

Clerk handles authentication.

Owner/studio functionality must be protected. Public customer pages should remain simple and accessible without unnecessary authentication.

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

## Legacy Application

The original application is preserved under `legacy/`:

- `legacy/server/` — Express API with MongoDB/Mongoose and related services (the original React/Vite frontend has been fully replaced and removed)

The legacy application is retained for reference only. It can be inspected to recover useful product behavior, UI ideas, business rules, or assets, but its architecture should not be carried into the new application unless a specific decision is made to do so.

### Retirement policy

- When a feature or page is rebuilt in the active app, remove the corresponding legacy files that implemented it.
- Do not run lint or type checks on `legacy/`. It is excluded from ESLint and is not part of the build; it is dead reference code.
- Legacy code is not extended or maintained. The goal is for `legacy/` to be deleted entirely once every feature it contains has been replaced.
