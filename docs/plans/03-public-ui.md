# Plan: Step 3 — Public UI (Home + Services)

## Goal
Port the legacy public-facing pages (Home, Services) into the Next.js `app/` structure, rebuilt with Tailwind, with the Services page reading real data from the `Service` table instead of mock/hardcoded data.

## Decisions
- Rebuild UI with Tailwind CSS (matches current stack), not a straight copy-paste of legacy CSS.
  - Note: legacy components already use Tailwind utility classes, so "rebuild" mostly means re-typing them as TSX inside `app/`, dropping animation/icon libraries not yet installed, and swapping data sources — not writing styles from scratch.
- Legacy `Services.jsx` uses `framer-motion` and `@heroicons/react` for animation/icons. Decide per-component whether to install these or use plain CSS transitions — default to skipping them for this step (keep dependencies minimal) unless a specific component needs them. Can revisit later.
- Services page fetches from the DB via a Server Component (`prisma.service.findMany()`), not client-side `fetch` + `useState` like the legacy mock. This matches Next.js App Router conventions — no loading spinner needed since data is ready before render.
- No image storage yet. `Service` model has no `imageUrl` field and Supabase Storage isn't wired up (per `architecture.md`, that's a later step). Skip service images this step, or use a static placeholder — do not add a DB column for this now.
- `ServicesPreview` (Home page teaser) can keep hardcoded "popular services" copy for now, OR pull top N from DB — decide during T3 once the full Services page is working, to avoid duplicating fetch logic prematurely.
- Legacy `Navbar` has a services dropdown, mobile menu, and a "Login" link. Keep the same structure, but point "Login" at `/sign-in` (from Step 2) instead of the legacy `/login` route.
- No booking logic yet — "Book Now" buttons are placeholders (this step is display only, matching `plan.md`'s phase breakdown: booking comes after this step).

## Prerequisites
- Step 2 (auth) complete — `/sign-in` exists for the Navbar's Login link to point to.
- `Service` table seeded (`npm run prisma:seed` or equivalent) so the Services page has real data to render.
- No new Clerk or env changes required.

## Tasks

### T1 — Build `Navbar` component
- [ ] Create `app/components/Navbar.tsx` (Server or Client Component — decide based on whether interactivity, e.g. mobile menu toggle, is needed → likely Client Component for `useState`)
- [ ] Port nav items: Services (dropdown), About, Contact, Login
- [ ] Point "Login" to `/sign-in`
- [ ] Use Next.js `<Link>` from `next/link` instead of `react-router`'s `<Link>`
- [ ] Decide: install `@heroicons/react` for icons, or use simple text/SVG

### T2 — Build `Hero` component
- [ ] Create `app/components/Hero.tsx`
- [ ] Port headline, subtext, "Book Appointment" CTA (placeholder for now)
- [ ] Decide: install `framer-motion` for entrance animation, or use CSS transitions / skip animation

### T3 — Build `ServicesPreview` component
- [ ] Create `app/components/ServicesPreview.tsx`
- [ ] Decide data source: hardcoded teaser copy vs. top N services from DB
- [ ] If DB-backed: Server Component, `prisma.service.findMany({ take: 3 })`

### T4 — Assemble Home page
- [ ] Update `app/page.tsx` to render `Navbar`, `Hero`, `ServicesPreview` in place of the current default Next.js starter content
- [ ] Confirm `/` still loads signed-out (public, per Step 2 verification)

### T5 — Build Services page
- [ ] Create `app/services/page.tsx` as a Server Component
- [ ] Fetch all services: `const services = await prisma.service.findMany()`
- [ ] Group/filter by `category` field (Hair, Skin, Makeup, Spa, Nails — matches seed data)
- [ ] Render category filter buttons (client-side interactivity needed here → likely a small Client Component for the filter state, receiving `services` as a prop from the Server Component parent)
- [ ] Render service cards: name, description, price, duration — no image, or static placeholder
- [ ] "Book Now" button — placeholder only (no handler yet)

### T6 — Verify
- [ ] Run `npm run lint`
- [ ] Run `npm run build`
- [ ] Run `npm run dev`
- [ ] Visit `/` — Navbar, Hero, ServicesPreview render correctly, signed out
- [ ] Visit `/services` — real seeded services appear, grouped/filterable by category
- [ ] Navbar "Login" → lands on `/sign-in`
- [ ] Confirm `/studio` is still protected (Step 2 untouched)

## Files to create or modify
| File | Action |
|---|---|
| `app/components/Navbar.tsx` | create |
| `app/components/Hero.tsx` | create |
| `app/components/ServicesPreview.tsx` | create |
| `app/page.tsx` | modify — replace starter content |
| `app/services/page.tsx` | create |
| `package.json` | modify only if `framer-motion` / `@heroicons/react` are added |

## Edge cases and failure handling
- Server Components can call Prisma directly; Client Components cannot import `@prisma/client` — keep the DB fetch in a Server Component and pass data down as props to any interactive Client Component (e.g. the category filter).
- `Service.price` is a `Float` in the schema (rupees, per seed data) — format for display (e.g. `₹300`), don't assume USD like the legacy mock data.
- If category filter state needs to live in a Client Component, only that piece should have `"use client"` — keep the page itself a Server Component for the initial data fetch.
- Do not add `framer-motion` / `@heroicons/react` reflexively just because legacy used them — each is a dependency + bundle size decision, confirm before installing.

## Done When
- `/` renders Navbar, Hero, and a services teaser, matching Tailwind-based design intent
- `/services` renders real DB-backed services grouped by category, no mock data
- Build is green; both pages work signed out (public)
- Step 2's protected `/studio` behavior is unaffected

## Next Step
After public UI: **Customer booking** — build the booking form (name + phone, no account) against the `Appointment` and `Customer` models, per `plan.md` Phase 1.