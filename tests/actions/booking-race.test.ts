import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { SLOT_A, SLOT_B, GATE } = vi.hoisted(() => {
  const start = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  let expected = 0;
  let arrived = 0;
  let open: () => void = () => {};
  let closed: Promise<void> = Promise.resolve();

  return {
    SLOT_A: start,
    SLOT_B: new Date(new Date(start).getTime() + 30 * 60_000).toISOString(),
    /**
     * Both requests must clear the action's availability re-validation before
     * either opens its transaction, otherwise the reproduction is a coin flip.
     */
    GATE: {
      arm(n: number) {
        expected = n;
        arrived = 0;
        closed = new Promise<void>((resolve) => {
          open = resolve;
        });
      },
      async enter() {
        arrived += 1;
        if (arrived >= expected) open();
        await closed;
      },
    },
  };
});

const authMock = vi.hoisted(() => ({
  requireActiveUser: vi.fn(async () => "u-racer-a"),
  requireAdmin: vi.fn(async () => "u-admin"),
  requireOwnerAdmin: vi.fn(async () => "u-admin"),
  requireSuperAdmin: vi.fn(async () => "sa-test-1"),
  hasAdminAccess: vi.fn(async () => true),
}));
vi.mock("@/lib/auth", () => authMock);

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
  clerkClient: vi.fn(),
  currentUser: vi.fn(async () => ({
    fullName: "Race Racer",
    firstName: "Race",
    primaryEmailAddress: { emailAddress: "race@example.com" },
  })),
}));

vi.mock("@/lib/db/appointments", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/db/appointments")>();
  return {
    ...actual,
    // Slot generation is not what is under test — pin the offered slots so the
    // action's re-validation passes and the requests stay in lockstep.
    getAvailableSlots: vi.fn(async () => {
      await GATE.enter();
      return [
        { value: SLOT_A, label: "10:00 AM" },
        { value: SLOT_B, label: "10:30 AM" },
      ];
    }),
  };
});

import { prisma } from "@/lib/prisma";
import { createAppointment } from "@/app/actions/appointments";
import type { BookingState } from "@/lib/db/appointments";
import { resetDb } from "../helpers/db";

beforeEach(async () => {
  await resetDb();
  vi.clearAllMocks();
  authMock.requireActiveUser.mockReset();
  authMock.requireActiveUser.mockImplementation(async () => "u-racer-a");
});

afterEach(async () => {
  await resetDb();
});

async function seedService(durationMin = 30) {
  return prisma.service.create({
    data: {
      name: "Haircut",
      price: 100,
      durationMin,
      category: "Hair",
      active: true,
    },
  });
}

async function seedUser(clerkUserId: string) {
  return prisma.user.create({
    data: { clerkUserId, role: "customer", status: "active" },
  });
}

function bookingFormData(serviceId: number, startTime: string) {
  const formData = new FormData();
  formData.set("serviceId", String(serviceId));
  formData.set("phone", "9876543210");
  formData.set("startTime", startTime);
  return formData;
}

function successes(results: BookingState[]) {
  return results.filter((r) => "success" in r);
}

function errorsOf(result: BookingState) {
  return (result as { errors: Record<string, string> }).errors;
}

describe("concurrent booking", () => {
  it("creates only one of two conflicting concurrent bookings", async () => {
    const service = await seedService(30);
    await seedUser("u-racer-a");
    await seedUser("u-racer-b");

    authMock.requireActiveUser
      .mockResolvedValueOnce("u-racer-a")
      .mockResolvedValueOnce("u-racer-b");
    GATE.arm(2);

    const results = await Promise.all([
      createAppointment({ errors: {} }, bookingFormData(service.id, SLOT_A)),
      createAppointment({ errors: {} }, bookingFormData(service.id, SLOT_A)),
    ]);

    expect(successes(results)).toHaveLength(1);

    const loss = results.find((r) => "errors" in r);
    expect(loss).toBeDefined();
    if (!loss) throw new Error("expected exactly one loser");
    expect(errorsOf(loss).startTime).toContain("already booked");
    expect(errorsOf(loss).form).toBeUndefined();

    const rows = await prisma.appointment.findMany();
    expect(rows).toHaveLength(1);
    expect(rows[0].startTime.toISOString()).toBe(SLOT_A);

    // The losing transaction rolls back whole — no orphan customer row.
    const customers = await prisma.customer.findMany();
    expect(customers).toHaveLength(1);
    expect(customers[0].id).toBe(rows[0].customerId);
  });

  it("lets two non-overlapping concurrent bookings both succeed", async () => {
    const service = await seedService(30);
    await seedUser("u-racer-a");
    await seedUser("u-racer-b");

    authMock.requireActiveUser
      .mockResolvedValueOnce("u-racer-a")
      .mockResolvedValueOnce("u-racer-b");
    GATE.arm(2);

    const results = await Promise.all([
      createAppointment({ errors: {} }, bookingFormData(service.id, SLOT_A)),
      createAppointment({ errors: {} }, bookingFormData(service.id, SLOT_B)),
    ]);

    expect(successes(results)).toHaveLength(2);
    expect(await prisma.appointment.count()).toBe(2);
    expect(await prisma.customer.count()).toBe(2);
  });
});
