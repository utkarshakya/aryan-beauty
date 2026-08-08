# Roadmap

Replaces `docs/01-roadmap.md` and `docs/AI_Beauty_Salon_Roadmap.md` (deleted 2026-08-08).

## Phases

### Phase 1 — Foundation (Month 1)
- Landing page, services, booking
- Customer login and admin dashboard
- Customer + appointment management, reports
- Learn: database design, API design, authentication

### Phase 2 — AI Beauty Consultant (Month 2)
- Inputs: hair type, skin type, occasion, budget, time available
- Outputs: recommended services, estimated cost, estimated duration, preparation tips
- Learn: LLM APIs, prompt engineering, structured JSON output

### Phase 3 — AI Copilot (Month 3)
- Owner asks: who hasn't visited in 90 days, which service earns most,
  which customers deserve offers
- Learn: tool/function calling, querying your own data

### Phase 4 — Automation
- Appointment reminders, daily revenue summary, no-show alerts, birthday messages
- Learn: scheduled jobs, background workers

### Phase 5 — Prediction
- No-shows, returning customers, popular services, busy days
- Learn: basic ML, feature engineering

## Tech stack (target)

Next.js + TypeScript · Tailwind CSS · Prisma + PostgreSQL (Supabase) · Clerk auth ·
Supabase Storage · OpenAI API · Vercel · GitHub

Supersedes current stack (React/Vite + Express + MongoDB) — migration in
`plans/01-nextjs-migration.md`.

## Weekly schedule (~2 h/day)

- 30 min: read docs for one concept
- 90 min: build one feature using it

## Project rules

1. Solve a real salon problem.
2. Ship one feature at a time.
3. Test with real users.
4. Record lessons in `docs/ideas.md`.

## Learning order

Product thinking → prompt engineering → OpenAI API → structured outputs → tool calling → RAG → automation → prediction

## Success

After ~6 months: working salon product, real users, multiple AI features, reusable
patterns for future SaaS products.