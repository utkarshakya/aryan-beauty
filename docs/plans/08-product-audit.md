# Product Audit — Phase 0 Baseline

Sub-plan of `07-product-polish.md` → Phase 0 — Product audit and baseline.

**Status:** Reviewed and agreed with the project owner. This document is the factual baseline for all subsequent phases.

**Ground rule going forward:** No code should be touched on the basis of this audit until Phase 2 (product visual language) is defined and the relevant experience-redesign phase (Phase 3 customer, Phase 4 owner) is reached. This audit records what exists today; it does not prescribe solutions.

All findings are grounded in code read at audit time; file + line citations are preserved so every claim remains checkable.

---

## 1. Current product map

| Route | Files | What it does today |
|---|---|---|
| `/` | `app/page.tsx` | Navbar + Hero (headline, tagline, CTA → `/book`) + hardcoded 3-item "Popular Services" preview (`app/components/ServicesPreview.tsx:1-5`) |
| `/services` | `app/services/page.tsx` | Live DB services via Prisma, rendered by client-side category filter (`ServicesFilter.tsx`), each card links to `/book?serviceId=` |
| `/book` | `app/book/page.tsx` | Booking form (service select w/ preselect from query param, name, phone, date, time, notes). Success renders inline, same URL |
| `/studio` | `app/studio/page.tsx` | Clerk-protected appointments table, status filter tabs via `?status=`, default = pending+confirmed from today onward |
| `/sign-in`, `/sign-up` | `app/sign-in/...`, `app/sign-up/...` | Clerk auth pages |
| `/about`, `/contact` | — | **Linked in navbar, do not exist** (`Navbar.tsx:8-9`) → 404 |

Global: `app/layout.tsx` — ClerkProvider, Geist fonts, static metadata ("Aryan Beauty") shared by every route. No `loading.tsx`, `error.tsx`, or `not-found.tsx` anywhere in `app/`. No footer component exists.

---

## 2. Customer journey audit (as-is)

1. **Home `/`** — Pink hero band, "Discover Your Natural Beauty", one CTA to `/book`. Below: "Popular Services" — 3 **hardcoded** items with prices (₹500/₹800/₹600) that may not match DB data. No contact info, no hours, no location, no footer, no brand name in nav.
2. **Navigation** — Desktop: Services (hover dropdown with Hair/Skin/Spa/Nails — all four link to plain `/services`, no actual filtering), About, Contact, Login. Mobile: hamburger only; dropdown categories absent entirely on mobile.
3. **`/services`** — DB-driven grid, filter chips derived from real categories, card shows name/description/price/duration + "Book Now" deep-link. No empty state if DB is empty.
4. **`/book`** — Single-column form, max-w-xl. Copy: "No account needed". Fields: service (required select), name, phone (placeholder hints format), date (`min` = today), time (`step=900`), optional notes (maxLength 100). Submit shows pending state.
5. **Confirmation** — Inline green panel replaces form: service, date/time (en-IN locale), phone, "We will confirm your appointment shortly", "Book another appointment" via `window.location.reload()` (`BookingForm.tsx:63`). No business contact info on confirmation.

---

## 3. Owner journey audit (as-is)

1. **Entry** — Navbar "Login" → Clerk sign-in. `/studio` calls `auth.protect()` (`app/studio/page.tsx:26`) — unauthenticated users get redirected by Clerk.
2. **Dashboard** — Heading "Appointments" (text-3xl, left-aligned, `container mx-auto`). Status tabs: All / Pending / Confirmed / Cancelled as links (`AppointmentsList.tsx:26-31`). Default view (`?status` absent): pending+confirmed only, starting at server-local midnight today (`page.tsx:15-19, 7-13`). Past appointments invisible in every tab including "all".
3. **List** — Table: customer name+phone, service+duration+price, date/time range (en-IN), colored status badge, actions. Row hover highlight.
4. **Actions** — Confirm: plain form + server action (pending rows show no feedback). Cancel: client component with native `window.confirm`, then awaits action (`CancelButton.tsx:6-10`).
5. **After action** — `revalidatePath("/studio")` refreshes list. No success message, no error handling.
6. **Empty** — Single generic "No appointments" box regardless of tab/date scope (`AppointmentsList.tsx:55-58`).
7. **Notes** — Collected at booking, typed in the component's data model (`AppointmentsList.tsx:10`), never rendered anywhere.

---

## 4. UI/design audit (specifics)

### Color tokens dead / hardcoded palette everywhere
- `globals.css:4-5` defines `--color-background/--color-foreground`, but `globals.css:11-12` reads `var(--background)` / `var(--foreground)` — those variables are never defined; body background/color declarations are invalid-at-computed-value-time. Meanwhile every component hardcodes Tailwind pink/gray/green/yellow/red utilities. No semantic color system exists.

### Typography scale inconsistent
- H1 sizes: `text-5xl` (Hero.tsx:7), `text-4xl` centered (ServicesFilter.tsx:28, book/page.tsx:24), `text-3xl` left (studio/page.tsx:52). No consistent page-heading pattern.

### Vertical rhythm inconsistent
- Section padding: `py-20` (Hero.tsx:5) vs `py-16` (ServicesPreview.tsx:9, ServicesFilter.tsx:26, book/page.tsx:22) vs `py-8` (studio/page.tsx:51).

### Container widths inconsistent
- `max-w-6xl` (Hero.tsx:6, ServicesPreview.tsx:10, ServicesFilter.tsx:27) vs `max-w-xl` (book/page.tsx:23) vs `container mx-auto` (studio/page.tsx:51).
- Navbar has **no container/horizontal padding at all** — desktop items sit flush against viewport edge (`Navbar.tsx:26`), mobile hamburger flush left (`Navbar.tsx:68`).

### Radius language inconsistent
- `rounded-full`: Hero CTA (Hero.tsx:15), submit button (BookingForm.tsx:202), Book Now (ServicesFilter.tsx:73), filter chips (ServicesFilter.tsx:40), status badges (AppointmentsList.tsx:105).
- `rounded-lg`: inputs (BookingForm.tsx:10), studio tabs (AppointmentsList.tsx:44), error banner (BookingForm.tsx:87), success details box (BookingForm.tsx:44).
- `rounded-xl`: cards (ServicesPreview.tsx:16, ServicesFilter.tsx:55), success panel (BookingForm.tsx:36), studio empty box (AppointmentsList.tsx:56), dropdown (Navbar.tsx:40), mobile menu links (Navbar.tsx:88).

### Button styling inconsistent
- Primary buttons all pink-600 but different paddings/radii: `px-8 py-3` (Hero.tsx:15), `px-6 py-3 w-full` (BookingForm.tsx:202), `px-6 py-2` (ServicesFilter.tsx:73).
- Studio tabs use a different active/inactive system: active `bg-pink-600 text-white rounded-lg`, inactive gray-on-gray (`text-gray-600 hover:bg-gray-100`, AppointmentsList.tsx:46-47) — while service filter chips use pink-50/pink-100 inactive states (ServicesFilter.tsx:43).
- Confirm/Cancel/"Book another" are bare underlined text links, visually unrelated to any button style (AppointmentsList.tsx:116, CancelButton.tsx:16, BookingForm.tsx:64).
- Transition utility mixed: `transition` (Hero.tsx:15) vs `transition-colors` elsewhere.

### Card styling inconsistent
- Pink-50 flat cards (ServicesPreview.tsx:16, ServicesFilter.tsx:55) vs white + shadow-sm (AppointmentsList.tsx:56) vs bordered green (BookingForm.tsx:36) vs white nested box inside green panel (BookingForm.tsx:44).

### Input styling
- One shared class string (BookingForm.tsx:9-10) — internally consistent; pink-tinted borders/focus ring tie into nothing else systemically. Studio side has zero styled controls.

### Navbar specifics
- No brand/logo/home link anywhere (`Navbar.tsx:24-96`) — business identity absent from chrome.
- Dropdown is hover-only (`onMouseEnter/onMouseLeave`, Navbar.tsx:33-34); its four categories all point to identical `/services` href (Navbar.tsx:13-18).
- Mobile menu omits the Services categories that desktop shows.
- Dropdown lacks aria attributes; mobile toggle has them (Navbar.tsx:71-72).

---

## 5. UX-state inventory

### Customer flow

| State | Status today |
|---|---|
| Loading (submit) | ✅ Handled — disabled button + "Booking..." (BookingForm.tsx:199-205) |
| Loading (page/nav) | ❌ None — no `loading.tsx`; `/services`, `/book` are force-dynamic DB reads with no visual wait state |
| Validation (field) | ⚠️ Partial — HTML `required` + server field errors for name/phone/serviceId/time/notes (actions.ts:29-48, rendered BookingForm.tsx:121,136,151,182,196); date field has no server-past check surfaced as its own message beyond startTime; no inline validation until submit |
| Error (form-level) | ⚠️ Handled but buggy — dismissible red banner (BookingForm.tsx:86-98); `formErrorDismissed` (line 24) is **never reset**, so after dismissing once, subsequent *different* form errors stay hidden |
| Error (slot unavailable) | ✅ Mapped to startTime field (actions.ts:104-106) |
| Error (service gone) | ✅ Mapped to serviceId field (actions.ts:107-109) |
| Error (network/server crash) | ⚠️ Generic catch-all string only (actions.ts:110); no app-level `error.tsx` |
| Empty (no services) | ❌ Not handled — empty select with just placeholder; page renders normally, dead end |
| Success | ⚠️ Partial — inline panel with summary + next-step sentence (BookingForm.tsx:36-69); no contact info; "Book another" nukes page via reload; URL unchanged so back/refresh behavior untested-by-design |
| Unavailable-slot pre-check | ❌ Nothing — no availability indication before submit; conflict discovered only after full submit |

### Owner flow

| State | Status today |
|---|---|
| Auth gate | ✅ `auth.protect()` redirect (studio/page.tsx:26) |
| Loading (confirm/cancel) | ❌ None — plain forms/server actions, no `useFormStatus`/pending UI (AppointmentsList.tsx:113-120); CancelButton awaits action with no pending state and **no try/catch** — a thrown error becomes an unhandled rejection with zero user feedback (CancelButton.tsx:6-10) |
| Error (action failure) | ❌ None — `requireOwner()` throws raw (studio/actions.ts:7-11); Prisma update failures uncaught; no error boundary in tree |
| Success feedback | ❌ None — silent revalidatePath refresh (studio/actions.ts:19,28) |
| Empty | ⚠️ Generic single message, identical across tabs, doesn't explain date scope or active filter (AppointmentsList.tsx:55-58) |
| Filtered view | ✅ Tabs work via query param with whitelist fallback (studio/page.tsx:29-35) |
| Confirmation of destructive action | ⚠️ Native `window.confirm` only — inconsistent with rest of UI, blocks main thread |
| Mobile usability | ⚠️ Table wrapped in `overflow-x-auto` (AppointmentsList.tsx:60) — horizontal scroll for 5 columns on a phone |

### Cross-cutting
- **Timezone**: booking `min` date uses UTC (`new Date().toISOString().split("T")[0]`, BookingForm.tsx:164) while server validates against server-local now (actions.ts:43) and `/studio` "today" uses server-local midnight (studio/page.tsx:15-19) — three different clock references; Netlify servers typically run UTC, so IST boundaries skew.
- Time input `step=900` (BookingForm.tsx:177) restricts picker UI, but typed values like 10:07 pass server validation if free — no business-hours concept exists server-side.
- Static metadata for all routes (layout.tsx:16-19) — no per-page titles.

---

## 6. Prioritized problem list

Classification reviewed and approved by the project owner, including the decision to keep the studio error-handling issues (missing error handling on confirm/cancel, dismissed-error-banner bug, absent app-level error/loading boundaries) classified as P0 rather than deferring them to Phase 5 reliability work.

Definitions per plan: P0 = demo blocker; P1 = high-value polish; P2 = nice-to-have; Later = deferred until real usage evidence.

### P0 — demonstration blockers
1. `/about` and `/contact` linked from navbar return 404 (`Navbar.tsx:8-9`). Violates "no known broken routes."
2. No brand name/logo anywhere in navigation or footer — first-time visitor cannot identify whose site this is (`Navbar.tsx` entire file; no footer exists).
3. Hardcoded Popular Services names/prices can contradict live DB pricing shown two clicks later (`ServicesPreview.tsx:1-5` vs `services/page.tsx`).
4. No contact/location/business info anywhere in the product (no footer, no about page, none on confirmation screen).
5. Studio confirm/cancel have zero error handling — auth failure throws raw, Prisma failure crashes, cancel rejection is silent (`studio/actions.ts:7-11`, `CancelButton.tsx:6-10`); owner sees either a framework error page or nothing.
6. Dismissed booking error banner suppresses all future form-level errors for the session of the form (`BookingForm.tsx:24,86-98`).
7. No app-level error/loading/not-found boundaries (`app/**` glob confirms absence) — any DB hiccup on dynamic pages yields default framework screen during a demo.

### P1 — high-value polish
8. Navbar lacks brand link/home affordance and has no container padding; content touches viewport edges (`Navbar.tsx:26,68-75`).
9. Services dropdown is hover-only (keyboard/touch inaccessible on desktop-width touch devices) and its category items don't actually filter anything (`Navbar.tsx:13-18,33-34`).
10. Mobile menu drops Service categories entirely — desktop/mobile navigation asymmetry (`Navbar.tsx:77-94`).
11. No availability/business-hours signal before submit; slot conflicts discovered only post-submit (actions.ts:65-74 is the first knowledge of conflict).
12. Studio gives no loading/success/error feedback on row actions (`AppointmentsList.tsx:110-126`, `studio/actions.ts`).
13. Studio table-only layout requires horizontal scrolling on phones; collected notes never displayed (`AppointmentsList.tsx:60-130`, type includes `notes` line 10, never rendered).
14. Studio default view silently hides past + cancelled appointments even under "all"; empty state doesn't explain scope (`studio/page.tsx:38-42`, `AppointmentsList.tsx:55-58`).
15. Three inconsistent clock references (UTC date-min vs server-now validation vs server-local "today") create off-by-hours edge behavior around midnight IST (`BookingForm.tsx:164`, `actions.ts:43`, `studio/page.tsx:15-19`).
16. Visual system fragmentation as itemized in §4 (type scale, spacing, radius, containers, button/badge systems, dead CSS tokens) — one systemic fix area, not per-pixel tweaks.
17. Per-route metadata missing; every tab shows identical title (`layout.tsx:16-19`).
18. Booking success ends the journey abruptly: reload-based reset, no onward path to services/contact, confirmation lacks contact info (`BookingForm.tsx:61-67`).
19. Empty-services case renders a dead-end booking page with no message (`book/page.tsx:12-14` + `BookingForm.tsx:111-113`).
20. Native `window.confirm` as the only destructive-action guard, stylistically alien to product (`CancelButton.tsx:7`).

### P2 — nice-to-have
21. "Login" label gives owner no hint it leads to her studio (`Navbar.tsx:10`).
22. Dropdown/mobile-menu accessibility attributes incomplete (dropdown has no aria wiring; `Navbar.tsx:30-53`).
23. Unicode glyphs ☰/✕ instead of proper icons (`Navbar.tsx:74`).
24. Mixed `transition` vs `transition-colors` (Hero.tsx:15 vs BookingForm.tsx:202).
25. `@theme inline` tokens defined but unused; body styles reference undefined vars (`globals.css:3-13`) — dead code cleanup.
26. Studio heading/placement deviates from public-page heading conventions (systemic via #16; listed separately only as placement).

### Later — deferred until real usage evidence
27. Customer-facing cancellation/rescheduling (no mechanism exists today; customers can only wait for owner contact).
28. Notification/reminder infrastructure (plan lists under explicit non-goals).
29. Availability engine / business-hours configuration (beyond the P1 minimum of communicating what exists).
30. Pagination/search for appointments (current volume unknown).
31. Duplicate-phone merge semantics beyond current upsert-overwrite behavior (`actions.ts:76-80` overwrites name on repeat booking — acceptable until evidence says otherwise).

---

## Definition of done for Phase 0

This audit is complete when Utkarsh has read it in full and agrees it matches reality. It becomes the reference point against which Phase 2 design decisions and the Phase 3/4 redesign scopes are justified. No implementation follows directly from this document.
