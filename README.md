# Aryan Beauty — Parlor Booking System

Booking and management system for a real beauty parlor: customers book
appointments online without an account, and the owner manages them from a
protected studio dashboard.

Built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma, Supabase
PostgreSQL, and Clerk authentication. Deployed on Netlify.

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Required `.env` variables (see `.env.example` for placeholders):

- `DATABASE_URL` — used by the app (Supabase transaction pooler)
- `DIRECT_URL` — used by Prisma CLI commands only (`migrate deploy`)
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`

## Documentation

See [docs/README.md](docs/README.md) for the product vision, roadmap,
architecture, and active implementation plans.
