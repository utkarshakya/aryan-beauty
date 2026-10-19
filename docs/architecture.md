# Architecture

## Purpose

Unknown Beauty is a single Next.js application for one beauty parlour. It is a full-stack application: pages, server-side actions, authentication, and PostgreSQL access live in the same repository and deploy together. There is no separate frontend or backend service to run.

## Stack

- Next.js 16 App Router and TypeScript
- Tailwind CSS v4
- Clerk authentication
- PostgreSQL on Supabase
- Prisma ORM with `@prisma/adapter-pg`
- Netlify deployment
- Vitest for unit/integration tests

## Repository Structure

```
app/              routes, pages, layouts, server actions, and HTTP route handlers
  (site)/         public marketing and customer pages
  admin/          owner/staff admin pages
  api/            HTTP route handlers (Clerk webhooks)
  actions/        Server Actions grouped by domain
  components/     page-specific components
components/       reusable visual components
  ui/             shared primitives (Button, Container, Card, Badge, PageHeader, EmptyState, SectionHeading, SummaryCard, ActionButton, FormBanner, Toast, Dialog, Skeleton, ErrorState, FilterPill, form controls)
  appointments/   appointment-specific components
    booking/      booking-wizard shell and its per-step components
  admin/          admin-area components (tab bar, filter disclosure)
  services/       service management components
  customers/      customer-related components
  staff/          staff management components
  business/       business settings components
  auth/           auth-related components
lib/              server-side infrastructure, auth, configuration, and database code
  auth/           authorization guards, metadata sync
  db/             Prisma queries and transactions by domain
  prisma.ts       Prisma client with pg adapter
prisma/           schema, migrations, and seed data
docs/             product and engineering documentation
tests/            Vitest tests with helpers
```

### Placement Rules

| Code | Home |
|---|---|
| URL pages and layouts | `app/` |
| Server mutations invoked by forms/buttons | `app/actions/` |
| External HTTP endpoints (Clerk webhooks) | `app/api/` |
| Reusable forms, cards, lists, navigation, UI primitives | `components/` |
| Prisma queries and transactions | `lib/db/` |
| Prisma client, authorization, business configuration | `lib/` |

A server page may read from `lib/db/` directly. A mutation must be a Server Action and must validate input and authorize the caller itself.

## Design Language

Design tokens live in `app/globals.css` under `@theme`; dark-mode overrides are re-declared under `html.dark`, so `dark:*` utilities pick them up automatically. Components must never hardcode hex/RGB values — if a shade is missing, add a token.

- **Colour**: `background`, `foreground`, `muted`, `border`, `primary`/`success`/`warning`/`danger`/`neutral` each with a `-soft` companion, and `surface`/`surface-strong` for raised surfaces (cards, panels, dark-mode buttons).
- **Typography**: body text uses the system stack (`font-sans`). Headings `h1`–`h3` use Fraunces automatically via a base rule in `globals.css`; the font is loaded in `app/fonts.ts` with `next/font` (build-time, self-hosted — no runtime CDN). For display text outside headings, use the `font-display` utility. Hero-scale copy uses `text-display`.
- **Shape**: `rounded-card` (`--radius-card`) for cards/panels, `rounded-control` (`--radius-control`) for inputs and selects, `rounded-full` for buttons and pills. Elevation uses `shadow-card`.
- **Focus**: use the `focus-ring` utility for every interactive element. Never hand-roll `ring-*`/`outline-*` focus classes; the utility is defined once in `globals.css` and renders a 2px primary outline with a 2px offset so the gap shows the real background in both themes. When the focusable element is visually hidden inside a wrapper (see `ChoiceCard`), use `focus-within-ring` on the wrapper instead — same ring, but drawn around the whole card.
- **Primitives**: reach for `components/ui/` (`Button`, `Container` (`size="default"` = `max-w-6xl`, `"wide"` = `max-w-4xl`, `"narrow"` = `max-w-xl`), `Card`, `Badge`, and the form controls `Field` with `Input`/`Textarea`/`Select`) before writing class strings by hand; further shared primitives are added there as patterns repeat. Wrap a labelled control in `Field` — it owns the label, hint, and error text and wires the control's `id`, `aria-invalid`, and error styling. `Card` renders the standard card shell (`rounded-card` + `shadow-card`); pass padding via `className`, or use the `cardClassName()` helper when the root element must stay a `section`/`article`; `cardLabelHeadingClass` is the uppercase card-label heading style. `Badge` takes a `tone` (`pending`/`confirmed`/`completed`/`cancelled`/`neutral`) — use `badgeTone(status)` to coerce a raw status string with a neutral fallback. `PageHeader` is the standard page title block (optional `eyebrow`, `backHref`/`backLabel`, `subtitle`, and an `actions` slot) — use it instead of hand-rolling an `h1` plus description. `EmptyState` is the standard empty-list placeholder (`title` plus optional `icon`/`body`/`actions`) — never hand-roll a dashed box. `SectionHeading` is the standard section `h2` (optional `description`/`actions`, `id` for `aria-labelledby`, `size="lg"` for landing sections). `SummaryCard` is the stat tile (`label`/`value`/`detail`). `ActionButton` is the inline text action button (`tone="primary" | "success" | "danger"`, underlined + `focus-ring`) — use it for in-row actions like Confirm/Cancel/Restore instead of colored hand-rolled buttons. `ChoiceCard` is the single-choice option (service cards, time-slot chips): a real `<input type="radio">` visually hidden inside its own `<label>`, so the group keeps native semantics and arrow-key navigation while the whole card is the hit area. Selection and focus are both expressed on the card via `has-[:checked]:` and `focus-within-ring`, keeping the label a pure function of input state. `FormBanner` is the form-level success/dailure notice (`tone` defaults to `success`; `danger` sets `role="alert"`). `ButtonLink` mirrors `Button` as a link and supports the same variants plus `outline`. `Skeleton`/`SkeletonGroup` are the loading placeholders (`SkeletonGroup` owns the `role="status"` + screen-reader label; use one per loading view). `ErrorState` is the shared error-boundary body (heading, copy, dev-only `error.message`, digest reference, retry button). `Toast`/`useToast()` is the transient feedback layer (`toast.success()`/`toast.error()`); the provider mounts once in the root layout, holds at most 3 toasts, auto-dismisses after 5s, and renders `role="status"`/`role="alert"` live regions above page content — use it for action outcomes (row actions, saves, invites) instead of `window.alert`. `ConfirmDialog` is the destructive-action confirmation built on native `<dialog>` + `showModal()` (focus trap, Escape, backdrop, and top-layer stacking come from the platform) — use it instead of `window.confirm`; contextual form-level messages stay in `FormBanner`.

Unused tokens are pruned from the built CSS until a component uses them — that is expected.

### Visual polish conventions

- Use the token-backed `text-meta`, `text-body`, `text-body-lg`, `text-title`, `text-section`, and `text-display` utilities for interface copy. Avoid arbitrary text sizes except the 16px mobile form-control override in `controls.tsx` — that one is load-bearing, see below.
- Use `py-section sm:py-section-lg` for full-width public sections so mobile and desktop vertical rhythm stays consistent.
- Use `primary` for the one main action in a group, `secondary` for a related positive alternative, `outline` for a neutral choice, and `ghost` for low-emphasis navigation or dismissal. Keep destructive actions in `danger` or the `ActionButton` danger tone.
- Interactive surfaces use the shared motion tokens and reduced-motion kill-switch. Buttons and pills provide hover, active, and visible-focus states; cards use `interactive-surface` only when the whole surface participates in an interaction.

### Mobile root font: px for touch targets, 16px for inputs

`app/globals.css` shrinks the root font on small screens, which quietly breaks any rem-sized control:

| Viewport | Root font | `min-h-11` (2.75rem) | `min-h-12` (3rem) |
|---|---|---|---|
| ≥640px | 100% = 16px | 44px ✓ | 48px ✓ |
| ≤639px | 93.75% = 15px | 41.25px ✗ | 45px ✓ |
| ≤359px | 90% = 14.4px | 39.6px ✗ | 43.2px ✗ |

- **Touch targets use px literals.** `min-h-[44px]`, `h-[44px] w-[44px]` — never `min-h-11`, which silently renders under 44px on every phone and worse at 320px. This covers standalone controls only: inline text actions (`ActionButton` used inside a sentence) are exempt under WCAG 2.2 target size, so do not blanket-apply it.
- **Rem is still correct where it tracks the root font on purpose.** `AdminTabBar`'s `sticky top-14 sm:top-16` and the header's `h-14`/`h-16` are deliberately rem: the bar must sit flush against the header at every breakpoint, so it has to shrink with it.
- **Form controls are `text-[16px] sm:text-sm` on purpose.** At 14px under the 93.75% root they render ~13px, and iOS Safari auto-zooms any focused field below 16px — mid-booking, on the phone-number step. The desktop 14px is intentional; do not "tidy" the mobile value back to `text-sm`.

### Loading convention

Pages `await` their data directly — there is deliberately no `<Suspense>` and no streaming anywhere in the app. Each route segment owns a `loading.tsx` built on `Skeleton`/`SkeletonGroup` (from `components/ui/Skeleton.tsx`, which carries `role="status"`). Route failures are handled by a segment `error.tsx` (plus `global-error.tsx` for root-layout failures), both built on the shared `ErrorState`; admin boundaries render inside the admin shell so navigation survives a crash. Do not introduce `<Suspense>` as a performance optimisation — it changes the loading UX that was designed and verified.

### Layering (z-index tiers)

Overlapping/sticky UI claims a fixed tier (lower sits behind); never invent an arbitrary value — add a row here instead:

| Tier | Element | Source |
|---|---|---|
| auto | page content | default |
| `z-30` | admin tab bar (sticky under the header) | `components/admin/AdminTabBar.tsx` |
| `z-40` | site header | `app/components/NavbarClient.tsx` |
| `z-50` | account-menu panel | `app/components/AccountButton.tsx` |
| `z-[60]` | toast tray | `components/ui/Toast.tsx` |
| `z-[70]` | booking-wizard sticky action bar | `components/appointments/BookingWizard.tsx` |
| top layer | `ConfirmDialog` | `components/ui/Dialog.tsx` (native `<dialog>` — above every z-index) |

The wizard sticky bar sets the CSS variable `--toast-inset-bottom` (px) so the toast tray clears it: the tray's bottom padding is `calc(1rem + env(safe-area-inset-bottom) + var(--toast-inset-bottom, 0px))`, which also keeps toasts above the iOS home indicator. Toasts therefore never cover the wizard's Confirm button while still sitting above the header and menus.

### Multi-step Forms

The booking flow (`components/appointments/BookingWizard.tsx`) is the reference implementation:

- **One `<form>`, one submit.** Steps are body components (`components/appointments/booking/`), not separate forms. `useActionState` stays in the shell so the action's `{ success } | { errors }` contract is unchanged.
- **State lives in the shell.** Because steps unmount when inactive, every value a step owns is lifted into the shell — that is what makes Back preserve state. Unmounting also means native `required` cannot gate submission, so the shell gates `Continue` explicitly and the server stays the backstop.
- **Cross-step values travel as hidden inputs.** A step's visible control carries no `name`; the shell mirrors its value into `<input type="hidden" name="...">` so the `FormData` is identical to a single-screen form. `phone` is the exception — it keeps a real `name` because it is the only autofillable field on the submit step.
- **Server errors route to their step.** Navigation is recorded against the action state it happened under, so a fresh result can override it: a returned `serviceId`/`startTime`/`phone` error sends the customer back to the step that owns the field instead of stranding them on the last one.
- **Slot values are opaque.** `getAvailableSlots` returns UTC ISO strings that the action re-compares with `===`. Carry `slot.value` through verbatim; never re-format it into the submitted `startTime`.
- **Sticky bars and the toast tray.** The wizard's action bar is `sticky bottom-0` at `z-[70]` on every step. It measures itself with a `ResizeObserver` and writes `--toast-inset-bottom` on `documentElement` for as long as it is mounted (removed again on unmount), so toasts always clear the Back/Confirm buttons even when the bar grows with the safe-area inset or wraps.

### Admin Navigation and Filters

- `AdminTabBar` (`components/admin/`) is rendered once from `app/admin/layout.tsx`, so section navigation survives every admin page and a crash inside one. It is `sticky top-14 sm:top-16` — both values are rem, so they track the reduced mobile root font size the same way `h-14`/`h-16` do — at `z-30`, deliberately below the header's `z-40` so an expanded mobile menu covers it.
- Its active test is **not** a plain prefix match. `pathname.startsWith("/admin")` would light the Appointments tab on every admin page, so the dashboard tab claims `/admin` and `/admin/appointments/*` explicitly.
- Dashboard sub-pages therefore have **no back link** — the tab bar is the navigation. `/admin/appointments/[id]` keeps its `backHref`, because that is a detail view below the dashboard rather than a sibling section.
- `AdminFilters` collapses search, date and status filters behind a disclosure on mobile only. The closed state is `max-sm:hidden`, **not** the `hidden` attribute: Tailwind's preflight emits `[hidden] {display:none!important}`, so an `sm:block` can never undo it and the panel would be unreachable on every screen ≥640px where the toggle is itself hidden.
- **Filter values stay URL-driven.** Every control is a `<Link>` or a GET `<form>`; the disclosure owns only the open state, so filters survive navigation, reload and the back button. Filter markup lives in the server component (`app/admin/page.tsx`), never in `AdminAppointmentsList` — keeping it there previously made it impossible to group with the other filters.

### Post-auth redirect

`lib/auth/redirect.ts` owns the return target for sign-in and sign-up:

- `sanitizeReturnTo` accepts **only** a same-origin path. `returnTo` comes from the URL and is therefore attacker-controlled, so `//host`, `/\host`, an encoded `%2f`/`%5c` in the first segment, absolute URLs, and control characters are all rejected.
- `authFallbackRedirectUrl` builds `fallbackRedirectUrl` for Clerk. It never hands Clerk the caller's path — only our own `/auth/redirect` route with the path as a query parameter. `/auth/redirect` re-validates and then redirects locally.
- **This is why no Clerk dashboard change is needed.** Clerk's allow-list is only consulted for URLs handed to the Clerk components; because the final hop is a server-side `redirect()` to a path we validated, a full path *and* query string survives sign-in (`/appointments?serviceId=3`) without touching allowed-redirect-urls.
- Admins still land on `/admin`; `/auth/redirect` only honours `returnTo` for everyone else.

## Request Flow

```
Browser UI → Server Action or Route Handler → lib/db query → Prisma → PostgreSQL
```

For example, the booking form invokes `createAppointment`; the action verifies the Clerk session, validates the form, runs a Prisma transaction, and refreshes the appointment page. This is backend work even though it is in the same Next.js project.

## Authentication and Authorization

Clerk authenticates the person. The Prisma `User` record is the authority for ordinary application roles and account status:

- `super_admin`, `admin`, `staff`, and `customer` are application roles.
- Disabled users are denied through database checks.
- Clerk metadata is synchronized for display/integration purposes, but is not used as the authorization source of truth.
- The configured super-admin Clerk ID remains a recovery mechanism.
- Bootstrap admin IDs create an initial admin record only when it is missing; after that, the database record controls access.

Every protected page and every Server Action must perform a server-side check. Showing or hiding a navigation link is a usability feature, not a permission check.

### Auth Guards (in `lib/auth/index.ts`)

- `requireActiveUser()` — any signed-in active user
- `requireAdmin()` — active super_admin, admin, or staff
- `requireOwnerAdmin()` — active super_admin or admin only
- `requireSuperAdmin()` — configured super-admin Clerk ID only

## Data Rules

- `User` stores identity, role, and account status.
- `Customer` stores salon-specific customer data and optionally links to `User`.
- `Service.active` hides a service without deleting historical appointments.
- Appointments are never deleted for normal cancellation; status changes to `cancelled`.
- Booking conflicts use interval overlap checks and ignore cancelled rows.
- Appointment snapshots (`serviceName`, `servicePrice`, `serviceDurationMin`) captured at booking time preserve historical accuracy.
- `BusinessSettings` is a singleton (one row) controlling scheduling rules and marketing content.
- `Appointment.status` is a 3-value enum (`pending`/`confirmed`/`cancelled`) with Completed derived from a past `endTime`; `Service.price` is whole rupees (integer); `Service.category` is a fixed allowlist.
- **Caching: request-scoped only, via React `cache()`.** `next.config.ts` has no `cacheComponents`, so every data page is `force-dynamic` and there is no full-route cache — which means the `revalidatePath()` calls in the server actions currently have nothing to invalidate and are inert. That is known, not a bug to chase. Per-request dedup uses `cache()` imported from `react` (request-scope memoization, *not* `next/cache`), wrapped around the raw DB read rather than the display mapper, so a shared writable row is never aliased across callers. Shared-caching public data across requests (and switching to `cacheTag`/`updateTag`) needs `cacheComponents: true`, which turns on Partial Prerendering app-wide and conflicts with the no-`Suspense` loading convention above — treat it as its own project.

## Error Handling and Logging

Boundaries (all render inside their segment's layout, so Navbar/Footer/nav survive):

- `app/global-error.tsx` — root-layout failures only; defines its own `<html>/<body>`, re-imports `globals.css`, the font variable, and the theme init script.
- `app/error.tsx` — root-level catch-all below the root layout.
- `app/(site)/error.tsx`, `app/admin/error.tsx` — segment boundaries; both wrap `ErrorState`.
- Colocated `not-found.tsx` files (e.g. `app/admin/appointments/[id]/`) catch `notFound()` inside the shell.

Convention (`lib/errors.ts` exports `GENERIC_FORM_ERROR`, `logServerError`, `logClientError`):

- **Boundaries** log `console.error("[error:<scope>]", error)` in a `useEffect`.
- **Server actions** wrap DB work in `try/catch` (auth guards stay *outside* the try so `redirect()` propagates), log with `logServerError(scope, error)`, and return their generic failure (`{ errors: { form: GENERIC_FORM_ERROR } }` or the action's existing failure shape). Expected/domain errors are return values, not throws.
- **Client handlers** catch rejected action calls, log with `logClientError(scope, error)`, and surface `GENERIC_FORM_ERROR` inline (`FormBanner`/alert) — pending state is always reset in `finally`.
- **Never swallow in pages:** a failed page-level fetch throws into the segment `error.tsx`; never render catch-to-empty data as if it were real.
- **Never leak internals:** production UI renders only the generic copy plus `error.digest`; `error.message`/stack appear only when `NODE_ENV === "development"`. Raw `Error` messages are logged, never returned to the client.

## Testing Locally

Use the product itself to test customer and admin flows, then use Prisma Studio to inspect saved records:

```powershell
npm.cmd run dev
npm.cmd run db:studio
```

Run the test suite:

```powershell
npm.cmd run test
```

Postman is only useful for real HTTP route handlers under `app/api/`. Server Actions are tested through the forms and controls that invoke them.

## Platform Notes

- Next.js 16 uses `proxy.ts`, not `middleware.ts`, for Clerk's handshake.
- In this App Router version, page `searchParams` are asynchronous and must be awaited.
- `DATABASE_URL` is the application connection string. `DIRECT_URL` is for Prisma CLI migrations only.
- Netlify builds with `prisma generate && next build`.
- Tailwind CSS v4 uses `@theme` in `app/globals.css` for design tokens.
- Server Actions are the primary mutation mechanism; Route Handlers only for webhooks.
