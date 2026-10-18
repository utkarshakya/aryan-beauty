# Aryan Beauty --- Repository-Aware UI Polish Plan

**Repository:** `utkarshakya/aryan-beauty`\
**Base branch:** `develop`\
**Purpose:** Finish the remaining UI polish using the architecture and
current implementation plan already documented in the repository.\
**Plan type:** Continuation of `docs/plans/mobile-first-ui.md`, not a
fresh rewrite of the application.

## 1. Architecture understood

Aryan Beauty is a **single full-stack Next.js application for one real
beauty parlour**. There is no separate frontend/backend service.

-   **Framework:** Next.js 16 App Router, React, TypeScript
-   **Styling:** Tailwind CSS v4; tokens in `app/globals.css`
-   **Authentication:** Clerk
-   **Data:** Supabase PostgreSQL through Prisma and
    `@prisma/adapter-pg`
-   **Deployment:** Netlify
-   **Tests:** Vitest
-   **Request flow:** Browser UI → Server Action or Route Handler →
    `lib/db/` → Prisma → PostgreSQL

### Main code boundaries

-   `app/(site)/` --- public homepage, services catalogue, customer
    appointments, and site layout
-   `app/admin/` --- protected owner/staff dashboard and management
    pages
-   `app/actions/` --- validated server mutations grouped by domain
-   `app/api/webhooks/clerk/` --- Clerk webhook
-   `components/ui/` --- shared UI primitives
-   `components/appointments/` --- appointment UI and the multi-step
    booking wizard
-   `components/appointments/booking/` --- booking wizard steps
-   `components/admin/`, `components/services/`,
    `components/customers/`, `components/staff/`, `components/business/`
    --- domain UI
-   `lib/auth/` --- server-side authorization and redirects
-   `lib/db/` --- Prisma queries and transactions
-   `prisma/` --- schema, migrations, and seed data
-   `docs/plans/mobile-first-ui.md` --- active phased UI plan

### Existing design system --- preserve it

The design foundation is already implemented. Do not create a competing
design system.

-   Pink-toned palette and light/dark themes are token-driven from
    `app/globals.css`.
-   Fraunces is applied to `h1`--`h3`; `font-display` and `text-display`
    are available.
-   Existing tokens include `background`, `foreground`, `muted`,
    `border`, `primary`, status tones, `surface`, `rounded-card`,
    `rounded-control`, and `shadow-card`.
-   Use `focus-ring` for interactive controls.
-   Reuse shared primitives in `components/ui/`, including `Button`,
    `ButtonLink`, `Container`, `Card`, `Badge`, `PageHeader`,
    `EmptyState`, `SectionHeading`, `SummaryCard`, `Field`, form
    controls, `Skeleton`, `Toast`, `ConfirmDialog`, and `ChoiceCard`.
-   Keep the established z-index tiers, safe-area handling, and
    reduced-motion behavior.

### Existing UI work that must not be redone

According to `docs/plans/mobile-first-ui.md`, Phases 0--4 are marked
complete. They already cover foundational mobile fixes, loading/error
handling, toast/dialog feedback, the multi-step booking wizard, and
admin navigation/dashboard responsiveness. The plan reports automated
checks passing for those phases, while manual verification is still
pending.

The next planned work is **Phase 5: public-site visual polish**,
followed by **Phase 6: verification**.

## 2. Product and UI scope

The product serves one real parlour. Its main user journeys are:

1.  A customer visits the public homepage.
2.  The customer browses active services.
3.  The customer signs in if needed and books an available slot.
4.  The customer views or cancels an eligible appointment.
5.  The owner/staff manages appointments, services, settings, and staff
    in the protected admin area.

The highest-value visual work is therefore the **public brand
presentation and service discovery**. The booking wizard and admin
interface already have purposeful structures; make targeted consistency
fixes there rather than rebuilding them.

## 3. Phase 5 --- Public-site visual polish

### 5.1 Homepage: make the first impression feel intentional

**Primary files** - `app/(site)/page.tsx` - `app/components/Hero.tsx` -
`app/components/ServicesPreview.tsx` - `app/components/Navbar.tsx` -
`app/components/NavbarClient.tsx` - `components/Footer.tsx`

**Tasks** - Improve the homepage's visual hierarchy so the brand, value
proposition, and booking action are immediately clear. - Rework the hero
composition using the existing business description, contact/location
data, opening information, and booking/service links. - Evaluate whether
approved existing salon imagery is available. Use it only if present and
suitable; do not invent image assets, testimonials, ratings, awards, or
business claims. - Create more deliberate section rhythm and content
width using existing spacing conventions and `Container`. - Make the
primary booking action visually dominant and keep service browsing as a
clear secondary action. - Review header and footer spacing, typography,
link grouping, and responsive layout. - Keep all business information
data-driven. Do not hardcode details that already come from
`BusinessSettings`.

**Acceptance criteria** - The hero communicates the salon offering and
exposes a clear booking action. - The page feels composed rather than
like a stack of generic sections. - Existing routes and business
settings still drive the content. - Light and dark themes remain legible
and intentional. - Mobile layout has no horizontal overflow.

### 5.2 Service preview and service catalogue

**Primary files** - `app/components/ServicesPreview.tsx` -
`app/components/ServicesFilter.tsx` - `app/components/serviceGrid.ts` -
The existing service-card component used by both surfaces -
`components/ui/` primitives where a shared style is appropriate

**Tasks** - Give service cards a stronger and more consistent hierarchy
for service name, description (if currently available), price, duration,
and booking action. - Tune card padding, alignment, density, borders,
and hover/active states without inventing unnecessary decoration. - Keep
the shared `serviceGridClasses`; do not reintroduce separate
inconsistent grid definitions. - Improve category-filter spacing and
active-state clarity. - Keep the result count readable and appropriately
secondary. - Make the empty-services state helpful and consistent with
`EmptyState` patterns where compatible with the current component. -
Preserve the current behavior that only active services are offered for
booking.

**Acceptance criteria** - The home preview and full catalogue look like
the same product. - Price and duration are easy to scan. - Category
filtering still works and exposes its active state accessibly. - Cards
and controls work with keyboard, touch, and reduced-motion settings. -
Existing service and booking links continue to work.

### 5.3 Visual consistency pass

**Primary files** - `app/globals.css` - Relevant public-site
components - Existing shared UI primitives only when a reusable fix is
needed

**Tasks** - Apply the defined typography scale consistently; avoid
one-off arbitrary text sizes unless justified by an existing documented
exception. - Standardize spacing between public sections, headings,
cards, and actions. - Use existing tokens instead of hardcoded hex/RGB
values or ad hoc shadows/radii. - Ensure each visual group has one clear
primary action. - Check hover, active, focus, disabled, and loading
states. - Keep animation restrained and respect the existing
reduced-motion rules. - Use existing `EmptyState`, `Skeleton`,
`FormBanner`, and toast patterns rather than inventing competing
variants. - Document a genuinely new reusable pattern in
`docs/architecture.md` only if it is needed beyond a single page.

**Acceptance criteria** - No duplicate design tokens or parallel
component patterns are introduced. - Public pages share consistent type,
spacing, card, and action styles. - All interactive controls retain
visible focus styling. - No unrelated backend, database, or
authorization files change.

### 5.4 Targeted consistency checks on booking and admin

This is a **regression/consistency check**, not a second redesign of
completed phases.

**Booking** - `components/appointments/BookingWizard.tsx` -
`components/appointments/booking/` -
`components/appointments/BookingSummary.tsx` and related existing
components

Check that the public visual polish remains consistent with the wizard's
existing stepper, service choice cards, slot chips, booking summary,
sticky action bar, toast offset, and success state. Preserve the current
`createAppointment`/`useActionState` contract and opaque UTC slot
values.

**Customer appointments** - Check upcoming/history presentation,
statuses, and permitted cancellation actions for consistency with the
public styles. - Preserve ownership checks and cancellation cutoff
behavior.

**Admin** - Check shared primitives, page headers, status badges, and
responsive navigation for visual regressions. - Do not rebuild the
existing admin tab bar or duplicate navigation already provided by it. -
Preserve role checks and server-side authorization.

**Acceptance criteria** - Existing booking, customer appointment, and
admin flows still behave as before. - No change to booking rules, auth
behavior, database schema, or Server Action contracts. - Any issue
discovered outside the visual scope is documented separately rather than
silently bundled into the redesign.

## 4. Phase 6 --- Verification and launch readiness

Follow the existing plan's verification sequence:

``` bash
npm run db:validate
npm run typecheck
npm run lint
npm run test
npm run build
```

**Important database safety note:** `npm run test` truncates the tables
`Appointment`, `BusinessSettings`, `Customer`, `Service`, and `User` in
the database configured by `.env`. Run it only against the development
database, never against production.

### Manual verification matrix

Check at **320 px, 390 px, and 768 px**, in both light and dark themes:

-   Homepage hero and booking call to action
-   Service preview and catalogue cards
-   Category filters and zero-results/empty states
-   Header, mobile menu, footer, and theme toggle
-   Booking wizard happy path and Back-state preservation
-   Slot-loading error and Retry behavior
-   Booking success state and sticky action bar
-   Customer appointment history and cancellation eligibility
-   Admin tab active states, filters, and narrow-screen behavior
-   Keyboard-only navigation and visible focus
-   Input usability, accessible names, contrast, and touch targets
-   No horizontal overflow, dark-mode flash, or toast covering the
    wizard action bar

Use matching before/after screenshots where possible. Inspect the actual
rendered application; code inspection alone cannot establish that the
design looks good.

### Performance and accessibility

-   Keep the existing target of Lighthouse mobile score ≥90 on `/` and
    `/services`, measured rather than assumed.
-   Use the already approved single dev-only accessibility tool only if
    it is still needed by Phase 6; no runtime dependencies should be
    added for this redesign.
-   Complete the real-phone pass listed in `docs/product.md` before
    launch.

## 5. Implementation rules for OpenCode

1.  Read `AGENTS.md`, `docs/architecture.md`, `docs/product.md`, and
    `docs/plans/mobile-first-ui.md` before editing.
2.  Treat Phases 0--4 as completed work. Do not re-audit or reimplement
    them unless a specific regression is found.
3.  Work from `develop` in a dedicated UI branch. Check whether the
    branch already exists before creating it; leave `main` untouched.
4.  Implement Phase 5 in small reviewable changes. Keep each change set
    focused on the public site.
5.  Do not introduce runtime dependencies, replace the styling system,
    or rewrite shared components without a concrete need.
6.  Do not modify Prisma schema, database queries, auth guards, role
    checks, booking rules, or Server Action contracts for visual-only
    work.
7.  Run relevant checks after each meaningful change and record actual
    outcomes.
8.  If a check fails, distinguish a pre-existing failure from one caused
    by the changes. Never disable checks to obtain a green result.
9.  Update the existing plan's checkboxes only when its stated criteria
    have been verified. Do not mark manual checks complete based solely
    on a successful build.
10. Report changed files, screenshots/viewport checks performed,
    commands executed, results, and unresolved issues.

## 6. OpenCode implementation prompt

``` text
Implement Phase 5 (Public-site visual polish) from
docs/plans/mobile-first-ui.md for Aryan Beauty.

The repository architecture and prior implementation are already documented.
Do not start with a generic audit and do not recreate completed Phases 0–4.
First read AGENTS.md, docs/architecture.md, docs/product.md, and the complete
Phase 5 section plus standing rules in docs/plans/mobile-first-ui.md.

Architecture:
- Next.js 16 App Router, React, TypeScript, Tailwind CSS v4
- Clerk auth, Prisma + Supabase PostgreSQL, deployed as one app on Netlify
- Public routes in app/(site); admin routes in app/admin
- Server Actions in app/actions; DB access in lib/db
- Existing design tokens in app/globals.css
- Existing reusable primitives in components/ui
- Existing booking wizard in components/appointments
- Existing mobile-first UI plan says Phases 0–4 are complete; Phase 5 is next.

Scope:
- Polish the public homepage, hero, service preview, service catalogue,
  service cards, navigation, and footer.
- Improve visual hierarchy, section rhythm, typography, card design,
  and interaction-state consistency using the existing design system.
- Reuse the existing service grid and shared primitives.
- Inspect whether suitable approved salon imagery already exists; do not
  invent business details, testimonials, ratings, awards, or assets.
- Make only targeted regression/consistency checks in booking/customer/admin UI.

Constraints:
- Start from develop and use a dedicated branch after checking whether it exists.
- Leave main untouched.
- No new runtime dependencies.
- No parallel design system, arbitrary hardcoded color values, or unnecessary
  animation.
- Do not change auth, authorization, database schema, booking rules,
  server-action contracts, or backend behavior.
- Do not reimplement completed Phases 0–4.
- Respect focus-ring, reduced motion, safe-area, existing z-index tiers,
  and the shared component conventions documented in docs/architecture.md.

After implementation:
- Run db:validate, typecheck, lint, tests, and build when safe and practical.
- IMPORTANT: npm run test truncates the configured database tables; confirm
  .env points to the development database before running it.
- Inspect actual pages at 320, 390, and 768 px in light and dark themes.
- Measure Lighthouse mobile scores on / and /services; don't guess results.
- Update plan checkboxes only for verified work.
- Report changed files, screenshots/viewport checks, exact commands and
  outcomes, and remaining issues. Do not claim checks passed unless run.
```

## 7. Definition of done

-   [ ] Public homepage has a deliberate, polished visual hierarchy.
-   [ ] Service preview and catalogue feel cohesive and make
    prices/durations easy to scan.
-   [ ] Existing design tokens and shared components are reused.
-   [ ] Customer booking and admin flows have no visual or functional
    regressions.
-   [ ] Mobile and dark-mode checks are completed at the listed viewport
    sizes.
-   [ ] Accessibility and performance checks have measured results.
-   [ ] `docs/plans/mobile-first-ui.md` reflects only verified
    completion.
-   [ ] Any remaining launch blockers are explicitly listed.

**Scope principle:** Finish the existing product before adding
architecture or features. The goal is a professional public-facing salon
experience without destabilizing the working booking system.
