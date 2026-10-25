import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { resetDb } from "../helpers/db";
import {
  getActiveServices,
  getServiceById,
} from "@/lib/db/services";
import {
  getAvailableSlots,
  cancelAppointment,
  confirmAppointment,
  adminCancelAppointment,
  restoreAppointment,
  getAppointmentsByCustomerId,
  getUpcomingAppointmentsForUser,
  getRecentHistoryForUser,
  MAX_HISTORY,
} from "@/lib/db/appointments";

beforeEach(async () => {
  await resetDb();
});

afterEach(async () => {
  await resetDb();
});

function futureDate(days: number, hours = 0, minutes = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

function pastDate(days: number, hours = 12, minutes = 0) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

async function seedCustomer(name = "Alice") {
  const user = await prisma.user.create({
    data: { clerkUserId: `clerk-${name.toLowerCase()}`, role: "customer", status: "active" },
  });
  const customer = await prisma.customer.create({
    data: { userId: user.id, name },
  });
  return { user, customer };
}

async function seedService(name = "Haircut", active = true, durationMin = 30) {
  return prisma.service.create({
    data: { name, price: 100, durationMin, category: "Hair", active },
  });
}

async function seedAppointment(customerId: number, serviceId: number, start: Date, status: AppointmentStatus = "confirmed", durationMin = 30) {
  return prisma.appointment.create({
    data: {
      customerId,
      serviceId,
      serviceName: "Haircut",
      servicePrice: 100,
      serviceDurationMin: durationMin,
      startTime: start,
      endTime: new Date(start.getTime() + durationMin * 60_000),
      status,
    },
  });
}

describe("inactive services", () => {
  it("never produce available slots", async () => {
    const service = await seedService("Old", false);
    const date = ymd(futureDate(10));
    expect(await getAvailableSlots(service.id, date)).toEqual([]);
  });

  it("are excluded from getActiveServices but still retrievable by id", async () => {
    const inactive = await seedService("Old", false);
    await seedService("New", true);
    const active = await getActiveServices();
    expect(active.map((s) => s.id)).not.toContain(inactive.id);
    expect(await getServiceById(inactive.id)).not.toBeNull();
  });
});

describe("business time zone", () => {
  it("interprets opening hours in the configured business time zone, not the server time zone", async () => {
    const originalTimeZone = process.env.TZ;
    process.env.TZ = "UTC";

    try {
      const service = await seedService("Haircut", true, 30);
      const { getBusinessSettingsForAvailability } = await import("@/lib/db/business");
      await getBusinessSettingsForAvailability();
      await prisma.businessSettings.update({
        where: { id: 1 },
        data: { timeZone: "Asia/Kolkata" },
      });

      const date = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      const slots = await getAvailableSlots(service.id, date);
      const openingSlot = slots.find((slot) => slot.value === `${date}T03:30:00.000Z`);

      expect(openingSlot).toBeDefined();
      expect(openingSlot?.label).toMatch(/9:00/);
    } finally {
      if (originalTimeZone === undefined) {
        delete process.env.TZ;
      } else {
        process.env.TZ = originalTimeZone;
      }
    }
  });
});

describe("booking conflicts", () => {
  const DURATION = 30;

  it("blocks a slot overlapping an existing non-cancelled appointment", async () => {
    const service = await seedService("Haircut", true, DURATION);
    const { customer } = await seedCustomer();
    const day = futureDate(10);
    const date = ymd(day);
    const busyStart = new Date(`${date}T10:00:00Z`);
    await seedAppointment(customer.id, service.id, busyStart, "confirmed", 45);

    const slots = await getAvailableSlots(service.id, date);

    expect(slots.some((s) => s.value.includes("T10:00"))).toBe(false);
    expect(slots.some((s) => s.value.includes("T10:30"))).toBe(false);
    expect(slots.some((s) => s.value.includes("T11:00"))).toBe(true);
  });

  it("does not block slots on a cancelled appointment", async () => {
    const service = await seedService("Haircut", true, DURATION);
    const { customer } = await seedCustomer();
    const date = ymd(futureDate(10));
    await seedAppointment(customer.id, service.id, new Date(`${date}T10:00:00Z`), "cancelled", 45);

    const slots = await getAvailableSlots(service.id, date);
    expect(slots.some((s) => s.value.includes("T10:00"))).toBe(true);
  });
});

describe("cancellation cutoff", () => {
  it("allows cancellation more than the cutoff before the visit", async () => {
    const service = await seedService();
    const { customer } = await seedCustomer();
    const start = new Date(Date.now() + 3 * 60 * 60 * 1000);
    const appointment = await seedAppointment(customer.id, service.id, start, "pending");

    expect(await cancelAppointment(appointment.id, customer.id)).toBe(true);
    const reloaded = await prisma.appointment.findUnique({ where: { id: appointment.id } });
    expect(reloaded?.status).toBe("cancelled");
  });

  it("rejects cancellation inside the cutoff window", async () => {
    const service = await seedService();
    const { customer } = await seedCustomer();
    const start = new Date(Date.now() + 60 * 60 * 1000);
    const appointment = await seedAppointment(customer.id, service.id, start, "pending");

    expect(await cancelAppointment(appointment.id, customer.id)).toBe(false);
    const reloaded = await prisma.appointment.findUnique({ where: { id: appointment.id } });
    expect(reloaded?.status).toBe("pending");
  });
});

describe("ownership", () => {
  it("lets a customer cancel only their own appointments", async () => {
    const service = await seedService();
    const { customer: alice } = await seedCustomer("Alice");
    const { customer: bob } = await seedCustomer("Bob");
    const start = new Date(Date.now() + 3 * 60 * 60 * 1000);
    const appointment = await seedAppointment(alice.id, service.id, start);

    expect(await cancelAppointment(appointment.id, bob.id)).toBe(false);
    expect(await cancelAppointment(appointment.id, alice.id)).toBe(true);
  });

  it("returns only the requesting customer's appointments", async () => {
    const service = await seedService();
    const { customer: alice } = await seedCustomer("Alice");
    const { customer: bob } = await seedCustomer("Bob");
    const day = futureDate(1, 12);
    await seedAppointment(alice.id, service.id, day, "pending");
    await seedAppointment(bob.id, service.id, futureDate(2, 12), "pending");

    const aliceAppointments = await getAppointmentsByCustomerId(alice.id);
    expect(aliceAppointments).toHaveLength(1);
    expect(aliceAppointments[0].customerId).toBe(alice.id);
  });
});

describe("guarded status transitions", () => {
  it("confirms a pending appointment once; re-submission is a silent no-op", async () => {
    const service = await seedService();
    const { customer } = await seedCustomer();
    const appointment = await seedAppointment(customer.id, service.id, futureDate(1, 12), "pending");

    expect(await confirmAppointment(appointment.id)).toBe(true);
    expect(await confirmAppointment(appointment.id)).toBe(false);
    const reloaded = await prisma.appointment.findUnique({ where: { id: appointment.id } });
    expect(reloaded?.status).toBe("confirmed");
  });

  it("admin can cancel a pending appointment and a future confirmed one", async () => {
    const service = await seedService();
    const { customer } = await seedCustomer();
    const pending = await seedAppointment(customer.id, service.id, futureDate(1, 12), "pending");
    const confirmed = await seedAppointment(customer.id, service.id, futureDate(2, 12), "confirmed");

    expect(await adminCancelAppointment(pending.id)).toBe(true);
    expect(await adminCancelAppointment(confirmed.id)).toBe(true);
  });

  it("rejects cancelling a completed (past confirmed) or already cancelled appointment", async () => {
    const service = await seedService();
    const { customer } = await seedCustomer();
    const completed = await seedAppointment(customer.id, service.id, new Date(Date.now() - 60 * 60 * 1000), "confirmed");
    const cancelled = await seedAppointment(customer.id, service.id, futureDate(1, 12), "cancelled");

    expect(await adminCancelAppointment(completed.id)).toBe(false);
    expect(await adminCancelAppointment(cancelled.id)).toBe(false);
  });

  it("restores an upcoming cancelled appointment; rejects a past one and a double restore", async () => {
    const service = await seedService();
    const { customer } = await seedCustomer();
    const upcoming = await seedAppointment(customer.id, service.id, futureDate(1, 12), "cancelled");
    const past = await seedAppointment(customer.id, service.id, new Date(Date.now() - 60 * 60 * 1000), "cancelled");

    expect(await restoreAppointment(upcoming.id)).toBe(true);
    expect(await restoreAppointment(upcoming.id)).toBe(false);
    expect(await restoreAppointment(past.id)).toBe(false);
  });
});

describe("user-keyed appointment lists", () => {
  it("sends a cancelled future booking to history, never to upcoming", async () => {
    const service = await seedService();
    const { user, customer } = await seedCustomer("Alice");
    const cancelled = await seedAppointment(customer.id, service.id, futureDate(1, 12), "cancelled");

    const now = new Date();
    const upcoming = await getUpcomingAppointmentsForUser(user.id, now);
    const history = await getRecentHistoryForUser(user.id, now);

    expect(upcoming.map((a) => a.id)).not.toContain(cancelled.id);
    expect(history.map((a) => a.id)).toContain(cancelled.id);
  });

  it("keeps cancelled bookings out of upcoming while a confirmed booking stays", async () => {
    const service = await seedService();
    const { user, customer } = await seedCustomer("Alice");
    const confirmed = await seedAppointment(customer.id, service.id, futureDate(2, 12), "confirmed");
    await seedAppointment(customer.id, service.id, futureDate(3, 12), "cancelled");

    const upcoming = await getUpcomingAppointmentsForUser(user.id, new Date());

    expect(upcoming.map((a) => a.id)).toEqual([confirmed.id]);
  });

  it("caps history at the requested limit, newest first", async () => {
    const service = await seedService();
    const { user, customer } = await seedCustomer("Alice");
    const oldest = await seedAppointment(customer.id, service.id, pastDate(3));
    const middle = await seedAppointment(customer.id, service.id, pastDate(2));
    const newest = await seedAppointment(customer.id, service.id, pastDate(1));

    const history = await getRecentHistoryForUser(user.id, new Date(), 2);

    expect(history.map((a) => a.id)).toEqual([newest.id, middle.id]);
    expect(history.map((a) => a.id)).not.toContain(oldest.id);
  });

  it("defaults history to MAX_HISTORY entries", async () => {
    const service = await seedService();
    const { user, customer } = await seedCustomer("Alice");
    for (let days = 1; days <= MAX_HISTORY + 2; days += 1) {
      await seedAppointment(customer.id, service.id, pastDate(days));
    }

    const history = await getRecentHistoryForUser(user.id, new Date());

    expect(history).toHaveLength(MAX_HISTORY);
  });

  it("returns unjoined rows — only the denormalized columns the list renders", async () => {
    const service = await seedService();
    const { user, customer } = await seedCustomer("Alice");
    await seedAppointment(customer.id, service.id, futureDate(1, 12), "confirmed");
    await seedAppointment(customer.id, service.id, pastDate(1), "confirmed");

    const now = new Date();
    const [upcomingRow] = await getUpcomingAppointmentsForUser(user.id, now);
    const [historyRow] = await getRecentHistoryForUser(user.id, now);

    for (const row of [upcomingRow, historyRow]) {
      expect(row).not.toHaveProperty("customer");
      expect(row).not.toHaveProperty("service");
      expect(row.serviceName).toBeTruthy();
      expect(typeof row.servicePrice).toBe("number");
      expect(typeof row.serviceDurationMin).toBe("number");
    }
  });

  it("never returns another user's appointments", async () => {
    const service = await seedService();
    const { user: aliceUser, customer: alice } = await seedCustomer("Alice");
    const { user: bobUser, customer: bob } = await seedCustomer("Bob");
    await seedAppointment(alice.id, service.id, futureDate(1, 12), "confirmed");
    await seedAppointment(alice.id, service.id, pastDate(1), "confirmed");
    await seedAppointment(bob.id, service.id, futureDate(2, 12), "confirmed");

    const now = new Date();
    const aliceUpcoming = await getUpcomingAppointmentsForUser(aliceUser.id, now);
    const aliceHistory = await getRecentHistoryForUser(aliceUser.id, now);
    const bobUpcoming = await getUpcomingAppointmentsForUser(bobUser.id, now);

    expect(aliceUpcoming).toHaveLength(1);
    expect(aliceUpcoming[0].customerId).toBe(alice.id);
    expect(aliceHistory).toHaveLength(1);
    expect(aliceHistory[0].customerId).toBe(alice.id);
    expect(bobUpcoming).toHaveLength(1);
    expect(bobUpcoming[0].customerId).toBe(bob.id);
  });
});
