import { readFileSync } from "node:fs";

const env = new Map<string, string>();
for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Z0-9_]+)=(.+)$/);
  if (match) env.set(match[1], match[2]);
}

if (!env.has("DIRECT_URL")) {
  throw new Error("DIRECT_URL missing from .env");
}

process.env.DATABASE_URL = env.get("DIRECT_URL")!;
process.env.SUPER_ADMIN_CLERK_USER_IDS = "sa-test-1,sa-test-2";
process.env.BOOTSTRAP_ADMIN_CLERK_USER_IDS = "ba-test-1";