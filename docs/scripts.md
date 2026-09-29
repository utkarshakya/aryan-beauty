# npm Scripts

Every script in `package.json`, what it runs, and when to use it.

## Development

| Script  | Full command                    | What it does / when to use                                                                     |
| ------- | ------------------------------- | ---------------------------------------------------------------------------------------------- |
| `dev`   | `next dev`                      | Starts the local dev server at `http://localhost:3000`. Use while building the app.            |
| `build` | `prisma generate && next build` | Regenerates the Prisma client, then creates the production build. Netlify runs this on deploy. |
| `start` | `next start`                    | Serves the production build locally. Use to preview `npm run build` output.                    |

## Code checks

| Script      | Full command   | What it does / when to use                                            |
| ----------- | -------------- | --------------------------------------------------------------------- |
| `lint`      | `eslint`       | Lints the codebase. Run before committing.                            |
| `typecheck` | `tsc --noEmit` | Type-checks everything without emitting files. Run before committing. |

## Tests

| Script     | Full command      | What it does / when to use                                                            |
| ---------- | ----------------- | ------------------------------------------------------------------------------------- |
| `test`     | `vitest run`      | Runs the whole test suite. **Empties the dev database first** (truncates all tables). |
| `posttest` | `npm run db:seed` | Runs automatically after a green `test`. Reloads the demo data the app shows.         |

## Prisma — local only (no database connection)

| Script        | Full command       | What it does / when to use                                                           |
| ------------- | ------------------ | ------------------------------------------------------------------------------------ |
| `db:generate` | `prisma generate`  | Regenerates the Prisma client after a schema change. Also runs inside `build`.       |
| `db:validate` | `prisma validate`  | Checks `prisma/schema.prisma` for errors. Run after editing the schema.              |
| `db:format`   | `prisma format`    | Rewrites the schema with Prisma's standard formatting. Run to clean up schema edits. |
| `db:version`  | `prisma --version` | Prints Prisma and engine versions. Use when reporting a bug.                         |

## Prisma — needs the database

| Script              | Full command                            | What it does / when to use                                                                                                              |
| ------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `db:migrate`        | `prisma migrate dev`                    | Creates a migration from schema changes and applies it. **The everyday command** after editing the schema.                              |
| `db:migrate:status` | `prisma migrate status`                 | Shows which migrations are applied vs pending. Use when the database and schema seem out of sync.                                       |
| `db:migrate:deploy` | `prisma migrate deploy`                 | Applies pending migrations without prompting. Use in production/CI to ship migrations.                                                  |
| `db:migrate:reset`  | `prisma migrate reset`                  | **Destructive:** drops every table, replays all migrations, then seeds. Use to get a clean database.                                    |
| `db:push`           | `prisma db push`                        | Writes schema changes straight to the database, no migration file. Prototyping only — prefer `db:migrate`.                              |
| `db:pull`           | `prisma db pull`                        | Reverse-engineers the schema from the live database into `prisma/schema.prisma`. Use when the schema is lost or was changed externally. |
| `db:seed`           | `prisma db seed` → `tsx prisma/seed.ts` | Inserts the demo data: 9 services, 6 demo customers, ~32 appointments across past/today/future. Idempotent — replaces only its own rows, never `User` or your bookings. Run after a reset or a failed test run. |
| `db:studio`         | `prisma studio`                         | Opens the browser GUI to browse and edit tables. Use for quick data inspection.                                                         |

## Which database URL is used

Simple rule: **the Prisma CLI uses `DIRECT_URL`, everything else uses `DATABASE_URL`.**

- **`prisma.config.ts` → `DIRECT_URL`.** The CLI reads this file, so `db:migrate*`, `db:push`, `db:pull`, and `db:studio` connect directly to Supabase (port 5432). This is the only place `DIRECT_URL` appears.
- **App runtime → `DATABASE_URL`.** `lib/prisma.ts` connects with the Supabase pooler (port 6543) from `process.env`. It never reads `prisma.config.ts`.
- **Seed → `DATABASE_URL`.** `prisma/seed.ts` builds its own pool from `process.env`, independent of the config.
- **Tests → `DATABASE_URL`.** `tests/setup.ts` loads it from `.env` before any test runs.
- **No connection at all:** `dev`, `start` (until a request hits the DB), `lint`, `typecheck`, `db:generate`, `db:validate`, `db:format`, `db:version`.
