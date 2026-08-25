# Deployment — V1

## Status

**Complete and verified.**

The application is deployed to Netlify and the production customer → booking → owner workflow has been tested successfully.

## Deployment architecture

```text
Customer / Owner
      ↓
   Netlify
      ↓
  Next.js app
      ↓
 Clerk authentication
      ↓
 Prisma 7.9.1
      ↓
 Supabase PostgreSQL (Production V1)
```

## Completed work

- Netlify project connected to the GitHub repository `AryanBeautyParlour`.
- Production environment variables configured.
- Prisma Client generation added to the Netlify build command:

```json
"build": "prisma generate && next build"
```

- Production Prisma migrations deployed successfully using the Supabase Direct Connection:

```bash
npx prisma migrate deploy
```

- Production seed completed successfully using the Supabase Transaction Pooler:

```bash
npx prisma db seed
```

- Netlify deployment completed successfully.
- Public/customer flow tested.
- Clerk authentication tested.
- Customer appointment creation tested against the Production V1 database.
- Owner appointment confirmation tested against the Production V1 database.

## Prisma connection model

Prisma 7.9.1 uses `prisma.config.ts` with:

```ts
datasource: {
  url: env("DATABASE_URL"),
}
```

Do **not** add `directUrl`; Prisma 7.9.1 does not support that property.

Conceptually:

- `DATABASE_URL` → Supabase Transaction Pooler → normal application/runtime and database operations.
- `DIRECT_URL` → Supabase Direct Connection → Prisma migration operations.

The deployed application does not need `DIRECT_URL`.

## Netlify environment-variable classification

### Secret variables

- `DATABASE_URL`
- `CLERK_SECRET_KEY`

### Normal/public configuration

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`

Never document or commit actual secret values.

## Security cleanup completed

- Old exposed credentials are considered compromised and must not be reused.
- Rotated credentials are used for the current deployment.
- `.netlify/` is ignored by Git because it is generated deployment output.
- `.env.example` contains safe placeholders/example values rather than credentials.

## Current production state

The deployed application is intentionally **private/not publicly launched**.

A temporary Netlify deployment URL is available for testing, but the product is not yet ready for the final owner demonstration.

## Intentionally deferred

The following are not deployment blockers for the current V1:

- Clerk production instance/custom domain setup;
- final custom domain;
- public launch;
- final marketing/SEO work.

These should be revisited after Product Polish V1.1 is complete.

## Next phase

Deployment is no longer the primary workstream.

The project now moves to:

**Product Polish V1.1 → `docs/plans/07-product-polish.md`**

The next task is to audit the existing product and create the detailed sub-plans before implementation.
