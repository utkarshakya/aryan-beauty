import { readFileSync } from "node:fs";

const env = new Map<string, string>();
for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Z0-9_]+)=(.+)$/);
  if (match) env.set(match[1], match[2]);
}

const testUrl = env.get("TEST_DIRECT_URL");
if (!testUrl) {
  throw new Error(
    "TEST_DIRECT_URL missing from .env — tests refuse to run without an explicit test database. " +
      "Set it to the connection string tests are allowed to TRUNCATE (the dev database)."
  );
}

process.env.DATABASE_URL = testUrl;
process.env.TEST_DIRECT_URL = testUrl;

process.env.SUPER_ADMIN_CLERK_USER_IDS = "sa-test-1,sa-test-2";
process.env.BOOTSTRAP_ADMIN_CLERK_USER_IDS = "ba-test-1";
