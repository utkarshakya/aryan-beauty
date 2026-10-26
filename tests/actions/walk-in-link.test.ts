import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.hoisted(() => ({
  requireAdmin: vi.fn(async () => "u-admin"),
}));
vi.mock("@/lib/auth", () => authMock);

const cacheMock = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));
vi.mock("next/cache", () => cacheMock);

import { prisma } from "@/lib/prisma";
import { resetDb } from "../helpers/db";
import { linkWalkInCustomerAction } from "@/app/actions/customers";

async function seedUser(clerkUserId: string) {
  return prisma.user.create({
    data: { clerkUserId, role: "customer", status: "active" },
  });
}

async function seedWalkInCustomer(name = "Walk-in") {
  return prisma.customer.create({ data: { name, userId: null } });
}

function linkFormData(customerId: number, clerkUserId: string) {
  const formData = new FormData();
  formData.set("customerId", String(customerId));
  formData.set("clerkUserId", clerkUserId);
  return formData;
}

beforeEach(async () => {
  await resetDb();
  vi.clearAllMocks();
});

afterEach(async () => {
  await resetDb();
});

describe("linkWalkInCustomerAction target validation", () => {
  it("links an unlinked walk-in customer to an unlinked user", async () => {
    const user = await seedUser("u-new");
    const customer = await seedWalkInCustomer();

    const result = await linkWalkInCustomerAction(
      { errors: {} },
      linkFormData(customer.id, user.clerkUserId),
    );

    expect(result.success).toBe("Walk-in customer linked successfully");
    const linked = await prisma.customer.findUnique({
      where: { id: customer.id },
    });
    expect(linked?.userId).toBe(user.id);
  });

  it("rejects a customer id that does not exist", async () => {
    const user = await seedUser("u-new");

    const result = await linkWalkInCustomerAction(
      { errors: {} },
      linkFormData(999_999, user.clerkUserId),
    );

    expect(result).toEqual({ errors: { form: "Customer not found" } });
    expect(await prisma.customer.count()).toBe(0);
  });

  it("rejects a customer that is already linked to another user", async () => {
    const existing = await seedUser("u-existing");
    const customer = await prisma.customer.create({
      data: { name: "Taken", userId: existing.id },
    });
    const newcomer = await seedUser("u-newcomer");

    const result = await linkWalkInCustomerAction(
      { errors: {} },
      linkFormData(customer.id, newcomer.clerkUserId),
    );

    expect(result).toEqual({
      errors: { form: "This customer is already linked to a user" },
    });
    const unchanged = await prisma.customer.findUnique({
      where: { id: customer.id },
    });
    expect(unchanged?.userId).toBe(existing.id);
    expect(await prisma.customer.count({ where: { userId: newcomer.id } })).toBe(0);
  });

  it("rejects an unknown clerk user id", async () => {
    const customer = await seedWalkInCustomer();

    const result = await linkWalkInCustomerAction(
      { errors: {} },
      linkFormData(customer.id, "user_does_not_exist"),
    );

    expect(result).toEqual({
      errors: { form: "Clerk user not found in database" },
    });
    const unchanged = await prisma.customer.findUnique({
      where: { id: customer.id },
    });
    expect(unchanged?.userId).toBeNull();
  });

  it("rejects a target user who already has a customer profile", async () => {
    const takenUser = await seedUser("u-taken");
    const alreadyLinked = await prisma.customer.create({
      data: { name: "Profile", userId: takenUser.id },
    });
    const walkIn = await seedWalkInCustomer();

    const result = await linkWalkInCustomerAction(
      { errors: {} },
      linkFormData(walkIn.id, takenUser.clerkUserId),
    );

    expect(result).toEqual({
      errors: { form: "This user is already linked to another customer" },
    });
    const unchanged = await prisma.customer.findUnique({
      where: { id: walkIn.id },
    });
    expect(unchanged?.userId).toBeNull();
    const profile = await prisma.customer.findUnique({
      where: { id: alreadyLinked.id },
    });
    expect(profile?.userId).toBe(takenUser.id);
  });

  it("denies the whole action without an admin session", async () => {
    authMock.requireAdmin.mockRejectedValueOnce(new Error("NEXT_REDIRECT"));
    const user = await seedUser("u-new");
    const customer = await seedWalkInCustomer();

    await expect(
      linkWalkInCustomerAction({}, linkFormData(customer.id, user.clerkUserId)),
    ).rejects.toThrow("NEXT_REDIRECT");

    const unchanged = await prisma.customer.findUnique({
      where: { id: customer.id },
    });
    expect(unchanged?.userId).toBeNull();
  });
});
