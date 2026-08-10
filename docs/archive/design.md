# Design

Live record of the product surface and stacks. Replaces the `02`–`05` and `09` stubs
(deleted 2026-08-08). Keep this true to the built system as the stack changes.

## Product surface

- **Customer**: Home, Services, Gallery, Booking, Login
- **Owner (studio)**: Dashboard, Customers, Appointments, Payments, Reports

## Stack

### Current (as built)
- Frontend: React 19 + Vite, Tailwind (`client/`)
- Backend: ES-module Express, REST routes + controllers (`server/`)
- Data: MongoDB + Mongoose; Redis rate limiting; Cloudinary images; Razorpay payments; SMTP mail

### Target (migration in `plans/01-nextjs-migration.md`)
- Next.js monolith (TypeScript + Tailwind)
- Prisma + PostgreSQL (Supabase cloud), 6 tables: `users`, `customers`, `staff`,
  `services`, `appointments`, `ai_conversations`
- Clerk auth (replaces bcrypt + JWT); Supabase Storage (replaces Cloudinary)
- Deploy: Vercel

## API surface

Core routes (final shape subject to migration plan):

- `POST /api/appointments` — create booking
- `POST /api/ai/recommendation` — consultant output: services, cost, duration, prep tips
- `POST /api/ai/copilot` — owner business questions
- Plus: `/api/services`, `/api/payment` (Razorpay), `/api/notification` (SMTP)

## AI architecture

```
Intent → Retrieve data → Tool call → Response (OpenAI)
```