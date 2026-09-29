import { readFileSync } from "node:fs";

const env = new Map<string, string>();
for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Z0-9_]+)=(.+)$/);
  if (match) env.set(match[1], match[2]);
}

const databaseUrl = env.get("DATABASE_URL");
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL missing from .env — tests refuse to run without a database. " +
      "Point it at the dev database only: tests TRUNCATE all rows.",
  );
}
process.env.DATABASE_URL = databaseUrl;

process.env.SUPER_ADMIN_CLERK_USER_IDS = "sa-test-1,sa-test-2";
process.env.BOOTSTRAP_ADMIN_CLERK_USER_IDS = "ba-test-1";
