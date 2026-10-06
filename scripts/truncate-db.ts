import "dotenv/config";
import { createInterface } from "node:readline/promises";

function describeTarget(raw: string) {
  try {
    const url = new URL(raw);
    return `${url.hostname}${url.pathname}`;
  } catch {
    return "(DATABASE_URL could not be parsed)";
  }
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set — check the dev/production lines in .env.",
    );
  }

  console.log(`Target: ${describeTarget(url)} (from .env DATABASE_URL)`);

  if (!process.argv.includes("--yes")) {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const answer = (
      await rl.question('Type "yes" to truncate all tables: ')
    )
      .trim()
      .toLowerCase();
    rl.close();
    if (answer !== "yes") {
      console.log("Aborted — nothing changed.");
      return;
    }
  }

  const { prisma } = await import("../lib/prisma");
  try {
    const rows = await prisma.$queryRawUnsafe<Array<{ tablename: string }>>(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' " +
        "AND tablename <> 'prisma_migrations' ORDER BY tablename",
    );
    if (rows.length === 0) {
      console.log("No tables found — nothing to do.");
      return;
    }
    const list = rows.map((row) => `"${row.tablename}"`).join(", ");
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`,
    );
    console.log(`Truncated ${rows.length} table(s): ${list}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
