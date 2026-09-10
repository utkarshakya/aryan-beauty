-- CreateTable
CREATE TABLE "BusinessSettings" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "timeZone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "openingHours" JSONB NOT NULL DEFAULT '{}',
    "closedWeekdays" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "closures" JSONB NOT NULL DEFAULT '[]',
    "slotIntervalMin" INTEGER NOT NULL DEFAULT 30,
    "minBookingNoticeMin" INTEGER NOT NULL DEFAULT 60,
    "cancellationCutoffMin" INTEGER NOT NULL DEFAULT 120,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessSettings_pkey" PRIMARY KEY ("id")
);
