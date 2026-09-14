import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const clerkMock = vi.hoisted(() => ({
  auth: vi.fn(function () {}),
  clerkClient: vi.fn(),
}));
(clerkMock.auth as unknown as { protect: () => void }).protect = vi.fn(() => {
  throw new Error("NEXT_REDIRECT");
});

vi.mock("@clerk/nextjs/server", () => clerkMock);

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { resetDb } from "../helpers/db";
import {
  hasAdminAccess,
  requireAdmin,
  requireOwnerAdmin,
  requireActiveUser,
} from "@/lib/auth";

const mockedAuth = vi.mocked(auth);

beforeEach(async () => {
  await resetDb();
  mockedAuth.mockReset();
});

afterEach(async () => {
  await resetDb();
});

function setClerkUser(userId: string | null) {
  mockedAuth.mockResolvedValue({
    userId,
    protect: vi.fn(),
  } as never);
}

async function expectRedirect(promise: Promise<unknown>) {
  await expect(promise).rejects.toThrow("NEXT_REDIRECT");
}

describe("authorization roles", () => {
  it("super-admin from env gets access even without a database record", async () => {
    setClerkUser("sa-test-1");
    expect(await hasAdminAccess("sa-test-1")).toBe(true);
    expect(await requireAdmin()).toBe("sa-test-1");
    expect(await requireOwnerAdmin()).toBe("sa-test-1");
  });

  it("active admin has admin and owner access", async () => {
    await prisma.user.create({
      data: { clerkUserId: "u-admin", role: "admin", status: "active" },
    });
    setClerkUser("u-admin");
    expect(await hasAdminAccess("u-admin")).toBe(true);
    expect(await requireAdmin()).toBe("u-admin");
    expect(await requireOwnerAdmin()).toBe("u-admin");
  });

  it("active staff can reach admin area but not owner-only actions", async () => {
    await prisma.user.create({
      data: { clerkUserId: "u-staff", role: "staff", status: "active" },
    });
    setClerkUser("u-staff");
    expect(await hasAdminAccess("u-staff")).toBe(true);
    expect(await requireAdmin()).toBe("u-staff");
    await expectRedirect(requireOwnerAdmin());
  });

  it("active customer is denied admin access", async () => {
    await prisma.user.create({
      data: { clerkUserId: "u-customer", role: "customer", status: "active" },
    });
    setClerkUser("u-customer");
    expect(await hasAdminAccess("u-customer")).toBe(false);
    await expectRedirect(requireAdmin());
    await expectRedirect(requireOwnerAdmin());
  });

  it("unknown unregistered user is denied", async () => {
    setClerkUser("u-unknown");
    expect(await hasAdminAccess("u-unknown")).toBe(false);
    await expectRedirect(requireAdmin());
    await expectRedirect(requireActiveUser());
  });

  it("guest (no session) is denied", async () => {
    setClerkUser(null);
    expect(await hasAdminAccess(null)).toBe(false);
    await expectRedirect(requireAdmin());
  });

  it("reads role and status from the database, not the session value", async () => {
    await prisma.user.create({
      data: { clerkUserId: "u-role", role: "admin", status: "active" },
    });
    setClerkUser("u-role");
    await prisma.user.update({
      where: { clerkUserId: "u-role" },
      data: { role: "customer" },
    });
    expect(await hasAdminAccess("u-role")).toBe(false);
  });
});

describe("disabled users", () => {
  it("disabled admin loses admin access even if still listed as admin", async () => {
    await prisma.user.create({
      data: { clerkUserId: "u-disabled", role: "admin", status: "disabled" },
    });
    setClerkUser("u-disabled");
    expect(await hasAdminAccess("u-disabled")).toBe(false);
    await expectRedirect(requireAdmin());
    await expectRedirect(requireActiveUser());
  });

  it("disabled staff loses admin access", async () => {
    await prisma.user.create({
      data: { clerkUserId: "u-disabled2", role: "staff", status: "disabled" },
    });
    setClerkUser("u-disabled2");
    expect(await hasAdminAccess("u-disabled2")).toBe(false);
    await expectRedirect(requireAdmin());
  });

  it("disabled super-admin env user is forced back to active", async () => {
    await prisma.user.create({
      data: { clerkUserId: "sa-test-1", role: "super_admin", status: "disabled" },
    });
    setClerkUser("sa-test-1");
    expect(await hasAdminAccess("sa-test-1")).toBe(true);
  });
});

describe("bootstrap admin", () => {
  it("creates an admin only when no record exists", async () => {
    setClerkUser("ba-test-1");
    expect(await requireAdmin()).toBe("ba-test-1");
    const record = await prisma.user.findUnique({ where: { clerkUserId: "ba-test-1" } });
    expect(record?.role).toBe("admin");
    expect(record?.status).toBe("active");
  });

  it("never overrides an existing record's role or status", async () => {
    await prisma.user.create({
      data: { clerkUserId: "ba-test-1", role: "customer", status: "disabled" },
    });
    setClerkUser("ba-test-1");
    await expectRedirect(requireAdmin());
    const record = await prisma.user.findUnique({ where: { clerkUserId: "ba-test-1" } });
    expect(record?.role).toBe("customer");
    expect(record?.status).toBe("disabled");
  });
});