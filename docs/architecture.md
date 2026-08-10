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
- **Deployment:** Vercel

## Application Architecture

Use a Next.js monolith. The customer-facing UI, owner-facing UI, server-side application logic, and API routes live in one application.

Keep boundaries clear inside the monolith rather than introducing separate frontend and backend applications unless a real requirement appears.

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

## Current Migration Context

The original application was built with React/Vite, Express, MongoDB/Mongoose, Cloudinary, Redis, and related services.

The project is moving to the target Next.js/PostgreSQL architecture. The old implementation is transitional and should not define the long-term architecture.
