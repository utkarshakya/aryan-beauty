import { prisma } from "@/lib/prisma";

export async function resetDb() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE "Appointment","BusinessSettings","Customer","Service","User" RESTART IDENTITY CASCADE'
  );
}