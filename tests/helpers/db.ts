import { prisma } from "@/lib/prisma";

function assertTestsMayTruncate() {
  const url = process.env.DATABASE_URL;
  const testUrl = process.env.TEST_DIRECT_URL;

  if (!testUrl) {
    throw new Error("Refusing to TRUNCATE: TEST_DIRECT_URL is not set (tests/setup.ts must run first).");
  }
  if (!url || url !== testUrl) {
    throw new Error("Refusing to TRUNCATE: DATABASE_URL does not match TEST_DIRECT_URL.");
  }
}

export async function resetDb() {
  assertTestsMayTruncate();
  await prisma.$executeRawUnsafe(
    'TRUNCATE "Appointment","BusinessSettings","Customer","Service","User" RESTART IDENTITY CASCADE'
  );
}
