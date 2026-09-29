import { prisma } from "@/lib/prisma";

function assertTestsMayTruncate() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "Refusing to TRUNCATE: DATABASE_URL is not set (tests/setup.ts must run first).",
    );
  }
}

export async function resetDb() {
  assertTestsMayTruncate();
  await prisma.$executeRawUnsafe(
    'TRUNCATE "Appointment","BusinessSettings","Customer","Service","User" RESTART IDENTITY CASCADE',
  );
}
