import { prisma } from "@/lib/prisma";
import { BusinessSettings, Prisma } from "@prisma/client";
import { cache } from "react";

export type BusinessSettingsFormData = {
  name: string;
  phone: string;
  phoneDisplay: string;
  phoneHref: string;
  address: string;
  addressLine2: string;
  tagline: string;
  description: string;
  timeZone: string;
  openingHours: Record<string, { open: string; close: string }>;
  closedWeekdays: number[];
  closures: Array<{ date: string; reason: string }>;
  slotIntervalMin: number;
  minBookingNoticeMin: number;
  cancellationCutoffMin: number;
};

export type BusinessSettingsForAvailability = {
  timeZone: string;
  openingHours: Record<string, { open: string; close: string }>;
  closedWeekdays: number[];
  closures: Array<{ date: string; reason: string }>;
  slotIntervalMin: number;
  minBookingNoticeMin: number;
  cancellationCutoffMin: number;
};

export type BusinessSettingsForDisplay = {
  name: string;
  tagline: string;
  description: string;
  phone: string;
  phoneDisplay: string;
  phoneHref: string;
  address: string;
  addressLine2: string;
  timeZone: string;
  openingHours: Record<string, { open: string; close: string }>;
  closedWeekdays: number[];
};

export async function getBusinessSettings(): Promise<BusinessSettings | null> {
  return prisma.businessSettings.findFirst({ orderBy: { id: "asc" } });
}

async function fetchBusinessSettingsOrCreate(): Promise<BusinessSettings> {
  let settings = await prisma.businessSettings.findFirst({
    orderBy: { id: "asc" },
  });
  if (!settings) {
    try {
      settings = await prisma.businessSettings.create({
        data: {
          id: 1,
          name: "Aryan Beauty",
          phone: "",
          phoneDisplay: "+91 98765 43210",
          phoneHref: "tel:+919876543210",
          address: "Shop 12, Main Market Road",
          addressLine2: "",
          tagline: "Your neighbourhood beauty parlour",
          description:
            "Professional hair, skin, nail and beauty services — book your visit online in under a minute.",
          timeZone: "Asia/Kolkata",
          openingHours: {
            monday: { open: "09:00", close: "18:00" },
            tuesday: { open: "09:00", close: "18:00" },
            wednesday: { open: "09:00", close: "18:00" },
            thursday: { open: "09:00", close: "18:00" },
            friday: { open: "09:00", close: "18:00" },
            saturday: { open: "09:00", close: "18:00" },
            sunday: { open: "09:00", close: "18:00" },
          },
          closedWeekdays: [],
          closures: [],
          slotIntervalMin: 30,
          minBookingNoticeMin: 60,
          cancellationCutoffMin: 120,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        settings = await prisma.businessSettings.findFirst({
          orderBy: { id: "asc" },
        });
      } else {
        throw error;
      }
    }
    if (!settings) {
      throw new Error(
        "BusinessSettings singleton row missing after create retry",
      );
    }
  }
  return settings;
}

/**
 * Request-scoped dedup: a public page and the `Footer` rendered from its
 * layout both need the singleton row, so this collapses to one read per
 * request. The write on first call stays put — it is idempotent, and the
 * `P2002` retry above already covers the create race, so running it once per
 * request instead of once per caller is the correct behaviour.
 *
 * `cache()` is React's request-scope memoization, not `next/cache`; the row
 * is never shared between requests. The display/availability mappers below
 * stay uncached so each caller builds its own object from the shared row.
 */
export const getBusinessSettingsOrCreate = cache(fetchBusinessSettingsOrCreate);

export async function getBusinessSettingsForAvailability(): Promise<BusinessSettingsForAvailability> {
  const settings = await getBusinessSettingsOrCreate();
  return {
    timeZone: settings.timeZone,
    openingHours: settings.openingHours as Record<
      string,
      { open: string; close: string }
    >,
    closedWeekdays: settings.closedWeekdays,
    closures: settings.closures as Array<{ date: string; reason: string }>,
    slotIntervalMin: settings.slotIntervalMin,
    minBookingNoticeMin: settings.minBookingNoticeMin,
    cancellationCutoffMin: settings.cancellationCutoffMin,
  };
}

export async function getBusinessSettingsForDisplay(): Promise<BusinessSettingsForDisplay> {
  const settings = await getBusinessSettingsOrCreate();
  return {
    name: settings.name,
    tagline: settings.tagline ?? "Your neighbourhood beauty parlour",
    description:
      settings.description ??
      "Professional hair, skin, nail and beauty services — book your visit online in under a minute.",
    phone: settings.phone ?? "",
    phoneDisplay: settings.phoneDisplay ?? "+91 98765 43210",
    phoneHref: settings.phoneHref ?? "tel:+919876543210",
    address: settings.address ?? "Shop 12, Main Market Road",
    addressLine2: settings.addressLine2 ?? "",
    timeZone: settings.timeZone,
    openingHours: settings.openingHours as Record<
      string,
      { open: string; close: string }
    >,
    closedWeekdays: settings.closedWeekdays,
  };
}

export async function updateBusinessSettings(
  data: Partial<BusinessSettingsFormData>,
): Promise<BusinessSettings> {
  const settings = await getBusinessSettingsOrCreate();
  return prisma.businessSettings.update({
    where: { id: settings.id },
    data,
  });
}
