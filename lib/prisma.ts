import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    "DATABASE_URL environment variable is not defined. Please set DATABASE_URL in Netlify Site Settings."
  );
}

const pool = new Pool({
  connectionString: connectionString || "postgresql://postgres:postgres@localhost:5432/db",
  ssl: connectionString?.includes("localhost") ? false : { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
