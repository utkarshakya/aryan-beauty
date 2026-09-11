-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "serviceDurationMin" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "serviceName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "servicePrice" INTEGER NOT NULL DEFAULT 0;
