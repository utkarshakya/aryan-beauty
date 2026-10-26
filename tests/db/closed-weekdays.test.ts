import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { resetDb } from "../helpers/db";
import { getAvailableSlots } from "@/lib/db/appointments";
import { getBusinessSettingsForAvailability } from "@/lib/db/business";

/**
 * `closedWeekdays` is written by the settings form with the ISO convention
 * (0 = Monday … 6 = Sunday) and read by `getAvailableSlots`. These tests pin
 * the convention on real dates so the two can never drift apart again — they
 * were off by one for every day of the week before the fix.
 */

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** A Monday at least a week out, plus the Tuesday and Sunday after it. */
function futureWeek() {
  const base = new Date();
  base.setUTCDate(base.getUTCDate() + 7);
  const isoBase = (base.getUTCDay() + 6) % 7; // 0 = Monday
  const monday = new Date(base);
  monday.setUTCDate(base.getUTCDate() + ((7 - isoBase) % 7));
  const tuesday = new Date(monday);
  tuesday.setUTCDate(monday.getUTCDate() + 1);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return { monday: ymd(monday), tuesday: ymd(tuesday), sunday: ymd(sunday) };
}

async function seedSettings(closedWeekdays: number[]) {
  await getBusinessSettingsForAvailability(); // creates the singleton row
  const openingHours = Object.fromEntries(
    ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(
      (day) => [day, { open: "09:00", close: "18:00" }],
    ),
  );
  await prisma.businessSettings.update({
    where: { id: 1 },
    data: {
      timeZone: "Asia/Kolkata",
      openingHours,
      closedWeekdays,
      closures: [],
      slotIntervalMin: 30,
      minBookingNoticeMin: 0,
      cancellationCutoffMin: 120,
    },
  });
  return prisma.service.create({
    data: { name: "Haircut", price: 500, durationMin: 30, category: "Hair", active: true },
  });
}

beforeEach(async () => {
  await resetDb();
});

afterEach(async () => {
  await resetDb();
});

describe("closedWeekdays convention", () => {
  it("uses dates that really are a Monday, a Tuesday and a Sunday", () => {
    const { monday, tuesday, sunday } = futureWeek();
    const iso = (d: string) => (new Date(d + "T00:00:00Z").getUTCDay() + 6) % 7;
    expect(iso(monday)).toBe(0);
    expect(iso(tuesday)).toBe(1);
    expect(iso(sunday)).toBe(6);
    expect(new Date(monday).getTime()).toBeGreaterThan(Date.now());
  });

  it("0 means Monday: closes Monday and leaves Tuesday and Sunday open", async () => {
    const service = await seedSettings([0]);
    const { monday, tuesday, sunday } = futureWeek();

    expect(await getAvailableSlots(service.id, monday)).toEqual([]);
    expect(await getAvailableSlots(service.id, tuesday)).not.toEqual([]);
    expect(await getAvailableSlots(service.id, sunday)).not.toEqual([]);
  });

  it("6 means Sunday: closes Sunday and leaves Monday open", async () => {
    const service = await seedSettings([6]);
    const { monday, tuesday, sunday } = futureWeek();

    expect(await getAvailableSlots(service.id, sunday)).toEqual([]);
    expect(await getAvailableSlots(service.id, monday)).not.toEqual([]);
    expect(await getAvailableSlots(service.id, tuesday)).not.toEqual([]);
  });

  it("an empty list closes no day", async () => {
    const service = await seedSettings([]);
    const { monday, tuesday, sunday } = futureWeek();

    expect(await getAvailableSlots(service.id, monday)).not.toEqual([]);
    expect(await getAvailableSlots(service.id, tuesday)).not.toEqual([]);
    expect(await getAvailableSlots(service.id, sunday)).not.toEqual([]);
  });
});
