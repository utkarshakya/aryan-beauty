# Plan: Step 2 — Auth (Clerk)

## Goal
Add authentication with Clerk so the owner can sign in to a protected studio area, while all public customer pages stay accessible without an account.

## Decisions
- Auth provider: Clerk (free tier)
- Owner-only auth for now. Customers book without accounts (name + phone on the booking form), matching `plan.md` ("basic authentication where needed").
- Scope for this step is auth infrastructure only: proxy, provider, sign-in/up pages, and a minimal protected `/studio` page to prove it works. No appointment/customer management UI yet.
- Owner identity: Clerk session is the source of truth. No DB schema changes this step. Simplest model: any authenticated Clerk user can access `/studio` (single-owner solo parlor). Hardening options (email allowlist, Clerk metadata role) are noted as follow-ups, not built now.
- Next.js 16 convention: the file that was `middleware.ts` is now `proxy.ts` at the repo root (not in `app/`). Clerk is compatible; contents are identical to the old `middleware.ts` pattern.

## Prerequisites
- Clerk account (dashboard access)
- Next.js 16 app at repo root (current state)
- No database changes required

## Tasks

### T1 — Create Clerk application
- [x] Create/log in to Clerk dashboard
- [x] Create application named e.g. `Aryan Beauty`
- [x] Copy the two keys from `API Keys`: Publishable Key and Secret Key

### T2 — Install SDK
- [x] Run `npm install @clerk/nextjs`
- [x] Confirm it registers in `package.json`

### T3 — Configure environment
- [x] Add to `.env`:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<publishable key>`
  - `CLERK_SECRET_KEY=<secret key>`
  - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
  - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
  - `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/studio`
  - `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/studio`
- [x] Mirror the same keys (with placeholder values) into `.env.example`
- [x] Confirm `.env` stays gitignored (already covered by `.env*`)

### T4 — Create `proxy.ts`
- [x] Create `proxy.ts` at repo root (sibling of `app/`)
- [x] Import `clerkMiddleware` from `@clerk/nextjs/server`
- [x] Keep `clerkMiddleware()` bare (no auth checks) and export `config.matcher` including static-file exclusions, `/(api|trpc)(.*)`, and `/__clerk/(.*)`
- [x] Do NOT set a `runtime` config in `proxy.ts` (Next 16 throws on it; proxy defaults to Node.js runtime)
- [x] NOTE: `createRouteMatcher` is deprecated (removed in next major). Auth checks move to each protected resource via `await auth.protect()` per Clerk's resource-based protection model. Proxy still required for Clerk to work but holds no auth logic.

### T5 — Wrap app in `ClerkProvider`
- [x] Modify `app/layout.tsx` to wrap `{children}` in `<ClerkProvider>`
- [x] Keep the existing fonts, globals, and metadata in the layout

### T6 — Create sign-in and sign-up pages
- [x] Create `app/sign-in/[[...sign-in]]/page.tsx` rendering Clerk's `<SignIn />` component
- [x] Create `app/sign-up/[[...sign-up]]/page.tsx` rendering Clerk's `<SignUp />` component
- [x] Verify the routes match `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL`

### T7 — Create protected studio area
- [x] Create `app/studio/page.tsx`
- [x] Server component calls `await auth.protect()` from `@clerk/nextjs/server` (resource-based check, replaces proxy-level auth since `createRouteMatcher` is deprecated)
- [x] Render a minimal "Studio" placeholder showing the signed-in user id (e.g. `user?.id`) to prove server-side auth works

### T8 — Verify
- [x] Run `npx prisma validate` (confirm no schema impact)
- [x] Run `npm run lint`
- [x] Run `npm run build`
- [x] Run `npm run dev`
- [x] Visiting `/studio` while signed out redirects to `/sign-in`
- [x] Signing in redirects to `/studio`
- [x] Visiting `/` works signed out (public)
- [x] Log out, confirm `/studio` is protected again

## Files to create or modify
| File | Action |
|---|---|
| `.env` | add Clerk keys and redirect env vars |
| `.env.example` | add blank Clerk keys as template |
| `package.json` | add `@clerk/nextjs` |
| `proxy.ts` (root) | create — `clerkMiddleware` + public-route matcher |
| `app/layout.tsx` | wrap in `ClerkProvider` |
| `app/sign-in/[[...sign-in]]/page.tsx` | create — `<SignIn />` |
| `app/sign-up/[[...sign-up]]/page.tsx` | create — `<SignUp />` |
| `app/studio/page.tsx` | create — minimal protected shell using `await auth()` |

## Edge cases and failure handling
- `proxy.ts` must live at the repo root or in `src/`, never inside `app/`. Keep it at the root here.
- The matcher must include Clerk's frontend API (`/__clerk/(.*)`) so the authentication handshake works, and `/(api|trpc)(.*)` for future API routes.
- `auth.protect()` from `@clerk/nextjs/server` is async — always `await` it. Use it in every protected page/route/server action (resource-based auth); `createRouteMatcher` is deprecated and must not return.
- After changing `proxy.ts`, clear `.next` and restart `npm run dev` if behavior looks stale.
- Clerk docs fast-path (`npx clerk@latest init --framework next`) exists but we are setting up manually so every file stays intentional.
- Keyless/dev keys are ephemeral; real keys belong in the Clerk dashboard and, later, in Vercel environment variables when we deploy.
- Do not rely on the proxy alone for authorization. Later API/route-handler steps must re-check auth server-side with `auth.protect()`.

## Done When
- Clerk SDK installed and env configured
- `proxy.ts` protects `/studio`; `/`, `/sign-in`, `/sign-up` are public
- Sign-in/sign-up pages render Clerk's hosted forms
- `app/studio/page.tsx` shows the signed-in user from server-side `auth()`
- Build is green; sign-in → `/studio` redirect works; logged-out access to `/studio` redirects to sign-in

## Next Step
After auth is complete: **Public UI (Home + Services)** — port the legacy `client/src` components and pages into the Next.js app and render the seeded services from the database.