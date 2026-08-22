# Plan: Step 6 — Real Pilot Launch

## Goal
Put the app in real, limited use at the aunt’s beauty parlor for a few months so we can learn from actual customers and improve the product before paying for a formal public launch. This is a controlled pilot, not the final production launch.

## Decisions
- **Platform**: Netlify Free (supports this Next.js App Router application, including SSR, Server Actions, and middleware). Chosen over Vercel Free specifically because Vercel's Hobby plan ToS restricts use to non-commercial projects — this is a real business pilot, so Netlify Free is the correct free option, not just a preference.
- **Database**: Supabase Free Postgres (sufficient for a small pilot; accept the inactivity pause and lack of automatic backups)
- **Auth**: Clerk development instance and development keys during the pilot; move to Clerk production only for the formal launch
- **Domain**: Use the free Netlify subdomain during the pilot; buy a custom domain later when the product is ready for public launch
- **Audience**: Aunt, staff, and selected customers only; do not advertise the pilot as a finished public product
- **Cost target**: $0/month; no paid hosting, domain, email, SMS, payments, AI, or storage during the pilot
- **Data scope**: Store only the minimum booking information needed for the pilot, and treat customer names and phone numbers as private data

## Prerequisites
- All Phase 1 features complete (Steps 1-5)
- `npm run lint` and `npm run build` pass locally
- Supabase Free project created for pilot data
- Clerk development instance and development keys available
- Aunt agrees to a limited pilot and understands that the product is still being improved
- A simple feedback log is ready for recording problems and requests

## Tasks

### T1 — Prepare the free pilot
- [ ] Create a Supabase Free project and copy its appropriate pooler connection string into `DATABASE_URL`
- [ ] Add the Clerk development variables from `.env.example` to the Netlify pilot environment
- [ ] Keep Clerk development keys isolated from any future production environment; do not expose `CLERK_SECRET_KEY` to the client
- [ ] In the Clerk dashboard, add the future Netlify pilot URL to the dev instance's allowed origins / redirect URLs (sign-in will fail or redirect incorrectly on a non-localhost URL otherwise)
- [ ] Run `npx prisma generate`, `npm run lint`, and `npm run build` locally
- [ ] Verify `@prisma/client` is generated on a clean install (delete `node_modules`, run `npm install`, confirm no manual `prisma generate` was needed) — this is the most common cause of a build that works locally but fails on Netlify
- [ ] Run `npx prisma migrate deploy` against the empty pilot database as a separate setup step
- [ ] Run `npm run prisma:seed` exactly once against the empty pilot database; the current seed script uses `create`, not `upsert`
- [ ] Export or back up pilot data before future schema changes; Supabase Free does not provide the same backup protection as a paid production plan
- [ ] Decide how to handle Supabase Free's inactivity pause (accept the occasional cold-start delay, or set up a free scheduled ping e.g. via GitHub Actions) and note the decision here

### T2 — Deploy the pilot to Netlify
- [ ] Connect the GitHub repository to Netlify
- [ ] Let Netlify auto-detect the Next.js application via its Next.js Runtime (it wraps the app in its own functions rather than just serving `.next` as static output); only set `npm run build` / `.next` manually if Netlify explicitly asks
- [ ] Add the pilot environment variables in Netlify; never commit `.env` files or secrets
- [ ] Do not run database migrations inside the build command; run them once as a separate setup step
- [ ] Create a Netlify deploy preview and run the smoke test
- [ ] Publish the verified commit to the free Netlify pilot URL
- [ ] Note Netlify's rollback option (re-publish a previous deploy from the dashboard) as the safety net if a published change breaks the live pilot

### T3 — Verify the pilot
- [ ] Pilot URL loads the homepage and `/services`
- [ ] `/book` creates an appointment in the Supabase pilot database
- [ ] `/studio` requires sign-in and shows appointments
- [ ] Confirm/Cancel actions work in `/studio`
- [ ] Clerk development sign-in/up works on the pilot URL
- [ ] Test the booking flow on a phone
- [ ] Browser console and Netlify function logs show no unexpected errors
- [ ] Confirm that no pilot environment variable contains production credentials


### T4 — Start the real pilot
- [ ] Share the Netlify pilot URL with the aunt and selected customers
- [ ] Owner creates the first account via Clerk
- [ ] Owner tests booking as a customer
- [ ] Owner confirms/cancels appointments in `/studio`
- [ ] Keep a simple weekly record of booking problems, missed opportunities, and requested improvements
- [ ] Measure a small baseline: booking calls/messages, successful online bookings, scheduling mistakes, and confirmation time
- [ ] Review feedback weekly and choose improvements based on observed problems

## Files to create or modify
| File | Action |
|---|---|
| `.env` / `.env.local` | never commit; keep pilot secrets local or in Netlify environment settings |
| `netlify.toml` | no change expected; create only if Netlify needs an explicit build configuration |
| Production deployment files | none during the pilot |

## Edge cases and failure handling
- Supabase Free may pause after a period of inactivity; the first request after a pause may be delayed, and the project should be resumed from the Supabase dashboard if needed
- Supabase Free does not provide the same automatic backup protection as a paid production plan; export pilot data regularly
- Netlify Free has usage limits; monitor the account dashboard and avoid enabling automatic paid overages
- Clerk development data is pilot data; plan a deliberate migration or fresh production account setup before the formal launch
- Do not use the pilot database for irreversible production records or sensitive information beyond basic booking needs
- Seed script: run once only against an empty pilot database because the current script uses `create`, not `upsert`
- Schema changes: export the database first, test migrations against a copy or disposable database, then run `prisma migrate deploy` separately

## Done When
- App is accessible from a free Netlify pilot URL
- Aunt can sign in, view bookings, and confirm/cancel them
- Selected customers can complete bookings that appear in `/studio`
- Seeded services are visible
- Mobile booking works
- Feedback and baseline usage measurements are being recorded
- No unexpected browser or server errors appear during pilot use

## Next Step
Phase 2 — Learn From Real Usage. Improve the UI, booking experience, and owner workflow based on observed problems before paying for a formal launch.