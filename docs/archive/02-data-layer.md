# Plan: Step 1 — Data Layer

## Goal
Set up PostgreSQL with Supabase, configure Prisma 7, create the initial database schema, seed basic services, and verify everything works.

## Decisions
- Database: Supabase PostgreSQL (free tier)
- ORM: Prisma 7
- Initial tables: `Service`, `Customer`, `Appointment`
- No auth, staff, payments, AI, storage, or deployment in this step

## Tasks

### T1 — Create Supabase project
- [x] Create Supabase project
- [x] Get Session Pooler → URI connection string

### T2 — Install Prisma
- [x] Install `prisma`
- [x] Install `@prisma/client`
- [x] Approve required Prisma install scripts
- [x] Verify with `npx prisma --version`

### T3 — Configure environment
- [x] Create `.env`
- [x] Add `DATABASE_URL`
- [x] Keep `.env` gitignored

### T4 — Create Prisma schema
- [x] Create `prisma/schema.prisma`
- [x] Add `Service`, `Customer`, and `Appointment` models
- [x] Add required relationships and `startTime` index
- [x] Create `prisma.config.ts` for Prisma 7
- [x] Run `npx prisma validate`

### T5 — Create database migration
- [x] Run `npx prisma migrate dev --name init`
- [x] Confirm database is in sync with schema
- [x] Confirm `prisma/migrations/` was created

### T6 — Generate Prisma Client
- [x] Run `npx prisma generate`

### T7 — Seed initial services
- [x] Install `tsx`
- [x] Create `prisma/seed.ts`
- [x] Add initial services: Haircut, Hair Color, Facial, Manicure, Pedicure, Bridal Makeup
- [x] Configure Prisma seed command
- [x] Run `npx prisma db seed`

### T8 — Verify
- [x] Run `npx prisma validate`
- [x] Run `npx prisma studio`
- [x] Confirm 6 services exist
- [x] Confirm Customer and Appointment tables are empty

## Done When
- Prisma 7 is configured and working
- Supabase PostgreSQL is connected
- `Service`, `Customer`, and `Appointment` tables exist
- Prisma Client is generated
- Six initial services are seeded
- Database is verified with Prisma Studio

## Next Step
After this data-layer plan is complete: **Auth (Clerk)**.