-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('pending', 'confirmed', 'cancelled');

-- AlterTable
ALTER TABLE "Appointment"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "AppointmentStatus" USING "status"::"AppointmentStatus",
  ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Service"
  ALTER COLUMN "price" TYPE INTEGER USING round("price")::INTEGER;

-- CreateIndex
CREATE INDEX "Appointment_customerId_idx" ON "Appointment"("customerId");

-- CreateIndex
CREATE INDEX "Appointment_serviceId_idx" ON "Appointment"("serviceId");
