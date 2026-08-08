# Migration Plan: to Next.js Monolith (Roadmap-Aligned)

Date: 2026-08-08
Status: Approved (decisions locked)

## Goal

Turn this repo into a proper learning product matching `docs/AI_Beauty_Salon_Roadmap.md`:
Next.js + TypeScript + Tailwind, Prisma + PostgreSQL, Clerk auth, Supabase Storage,
OpenAI integration, Vercel deploy. Backend and frontend live in one folder / one app.
Teaches PG + SQL + real AI later.

## Decisions (locked)

- Target: **Full Next.js rewrite** (Option A) — Express/Vite/mongoose dropped after migration.
- Postgres: **Supabase free cloud** (not Neon) — zero install on laptop, matches existing
  cloud-DB pattern, AND reuses the same Supabase account already chosen for Storage. One
  vendor, one dashboard, one billing, one auth token. Neon = second account + second URL
  + zero benefit at this scale.
- Auth: **Clerk** (free tier) — replaces bcrypt + JWT entirely.
- Data: **Fresh start + seed script** — no data migration from Mongo.
- Redis: **removed** — rate limiting moves to built-in/bundled approach; no daemon dependency.

## Local Requirements (laptop audit done 2026-08-08)

| Tool | Requirement | Status |
|---|---|---|
| Node.js | 18.18+ | v24.16.0 ✓ |
| npm | current | 12.0.2 ✓ |
| Postgres | Supabase free tier (URL-only, no install) | needs account |
| Clerk | free tier account + keys | needs account |
| OpenAI | paid API key | only paid piece |
| Supabase Storage | free tier (images) | creates on demand |
| Vercel | deploy only; `next dev` works without it | optional |

Already installed: Node, npm, WSL2 Ubuntu. Not needed: Docker, local Postgres,
local Mongo, local Redis. Old server hard-exits if cloud Mongo + Redis are down
(`server/config/db.js`); that whole failure mode goes away.

## Target Repo Layout

```
AryanBeautyParlour/            # Next.js lives at repo root once scaffolded
├── app/
│   ├── (public)/              # Home, Services, Gallery (Server Components)
│   ├── (studio)/              # dashboard, appointments, customers (Clerk-protected)
│   ├── api/
│   │   ├── services/route.ts
│   │   ├── appointments/route.ts
│   │   ├── payment/route.ts        # Razorpay
│   │   ├── notification/route.ts   # SMTP nodemailer
│   │   └── ai/recommendation/route.ts  # Phase 2 AI
│   ├── layout.tsx
│   └── middleware.ts               # Clerk auth
├── prisma/
│   ├── schema.prisma           # 6 tables: users, customers, staff, services, appointments, ai_conversations
│   └── seed.ts                 # fresh demo data
├── components/
├── lib/
├── styles/
└── .env                        # POSTGRES_URL, CLERK_*, RAZORPAY, SMTP, OPENAI_KEY, SUPABASE
```

## Phase 1 — Scaffold (~30 min)

1. Create Supabase project → copy `DATABASE_URL`.
2. Create Clerk application → copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`.
3. Run `npx create-next-app@latest .` (Tailwind checked) at repo root into a temporary
   target, then promote to root; or scaffold fresh at root and port code in.

## Phase 2 — Data Layer

4. `prisma init`, write `prisma/schema.prisma` per docs `04-database-design.md`.
5. `npx prisma migrate dev`.
6. Write `prisma/seed.ts` → services, demo staff, sample bookings. Run once.

## Phase 3 — Port UI (reuse current JSX)

7. Port `Navbar / Hero / ServicesPreview / ImageGallery` as Server Components
   from `client/src/components/*.jsx`. Tailwind v4 classes migrate as-is.
8. Home + Services pages in `app/(public)/`. Login page → Clerk `<SignIn>`.
9. Images from Supabase Storage.

## Phase 4 — Port API (Express → Next route handlers + Prisma)

10. `/api/services` → route handler + `prisma.service.findMany`.
11. `/api/appointments` → create/list with user relation.
12. `/api/auth` → **delete**. Clerk owns auth.
13. `/api/payment` → Razorpay order api.
14. `/api/notification` → nodemailer SMTP.

## Phase 5 — AI (roadmap Phase 2)

15. `/api/ai/recommendation` → OpenAI SDK, structured JSON output.
    Inputs: hair type, skin type, occasion, budget, time.
    Outputs: services, est. cost, est. duration, prep tips. This is the learning payoff.

## Phase 6 — Finish

16. `npm run build` green. `npx prisma validate`.
17. Deploy to Vercel (optional but planned).
18. Delete `client/` and `server/` folders once ported.
19. Keep `docs/roadmap.md` and `docs/design.md` true to the built system
    (Mongo/Express references removed; Postgres/Next.js documented). Docs were
    consolidated on 2026-08-08 — see `docs/README.md`.

## Verify Commands

```powershell
npx next build
npx prisma validate
npx prisma db push     # or migrate dev
npx prisma db seed     # if configured
```

## Old Stack Mapping

| Old (Express/Vite) | New (Next.js monolith) |
|---|---|
| `server/routes/authRoutes.js` + JWT/bcrypt | Clerk `middleware.ts` |
| `server/routes/serviceRoutes.js` | `app/api/services/route.ts` + Prisma |
| `server/routes/appointmentRoutes.js` | `app/api/appointments/route.ts` |
| `server/routes/paymentRoutes.js` | `app/api/payment/route.ts` (Razorpay) |
| `server/routes/notificationRoutes.js` | `app/api/notification/route.ts` |
| `client/src/components/*.jsx` | `components/*.tsx` (Server Comps) |
| `client/src/pages/*.jsx` | `app/(public)/*`, `app/(studio)/*` |
| `server/config/env.js` + Redis | `lib/env.ts` + Prisma |
| Cloudinary | Supabase Storage |

## Notes / Risks

- Fresh seed wipes old test bookings — acceptable, nothing committed.
- Open-source keys can blank during dev; only affected route calls fail, boot stays up.
- OpenAI is the only paid dependency.
- Keep commits prefixed per project convention (`feat:`, `refactor:`, `chore:`).