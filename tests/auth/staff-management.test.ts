import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const clerkMock = vi.hoisted(() => {
  const updateUserMetadata = vi.fn().mockResolvedValue({});
  return {
    auth: vi.fn(function () {}),
    clerkClient: vi.fn(async () => ({ users: { updateUserMetadata } })),
    updateUserMetadata,
  };
});
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
import type { UserRole, UserStatus } from "@prisma/client";
import { resetDb } from "../helpers/db";
import {
  setUserRole,
  disableUser,
  restoreUser,
  updateUserRole,
  roleFromPublicMetadata,
} from "@/lib/auth";

const mockedAuth = vi.mocked(auth);

beforeEach(async () => {
  await resetDb();
  mockedAuth.mockReset();
  clerkMock.updateUserMetadata.mockClear();
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

async function createUser(clerkUserId: string, role: UserRole, status: UserStatus = "active") {
  return prisma.user.create({
    data: { clerkUserId, role, status },
  });
}

describe("roleFromPublicMetadata", () => {
  it("accepts staff, customer, and admin", () => {
    expect(roleFromPublicMetadata("staff")).toBe("staff");
    expect(roleFromPublicMetadata("customer")).toBe("customer");
    expect(roleFromPublicMetadata("admin")).toBe("admin");
  });

  it("falls back to customer for anything else", () => {
    expect(roleFromPublicMetadata("super_admin")).toBe("customer");
    expect(roleFromPublicMetadata(42)).toBe("customer");
    expect(roleFromPublicMetadata(undefined)).toBe("customer");
    expect(roleFromPublicMetadata(null)).toBe("customer");
  });
});

describe("staff management authorization", () => {
  it("active owner can promote customer to staff", async () => {
    await createUser("u-owner", "admin");
    await createUser("u-target", "customer");
    setClerkUser("u-owner");

    const updated = await setUserRole("u-target", "staff");
    expect(updated.role).toBe("staff");
    expect(clerkMock.updateUserMetadata).toHaveBeenCalledWith("u-target", {
      publicMetadata: { role: "staff", status: "active" },
    });
  });

  it("active owner can demote staff back to customer", async () => {
    await createUser("u-owner", "admin");
    await createUser("u-target", "staff");
    setClerkUser("u-owner");

    const updated = await setUserRole("u-target", "customer");
    expect(updated.role).toBe("customer");
  });

  it("staff cannot manage other accounts", async () => {
    await createUser("u-staff", "staff");
    await createUser("u-target", "customer");
    setClerkUser("u-staff");
    await expectRedirect(setUserRole("u-target", "staff"));
    await expectRedirect(disableUser("u-target"));
  });

  it("customer cannot manage other accounts", async () => {
    await createUser("u-customer", "customer");
    await createUser("u-target", "customer");
    setClerkUser("u-customer");
    await expectRedirect(setUserRole("u-target", "staff"));
  });

  it("owner cannot grant super_admin", async () => {
    await createUser("u-owner", "admin");
    await createUser("u-target", "customer");
    setClerkUser("u-owner");
    await expect(setUserRole("u-target", "super_admin")).rejects.toThrow(
      "configured outside the application"
    );
  });

  it("owner cannot grant admin role", async () => {
    await createUser("u-owner", "admin");
    await createUser("u-target", "staff");
    setClerkUser("u-owner");
    await expectRedirect(setUserRole("u-target", "admin"));
  });

  it("super admin can grant admin role", async () => {
    await createUser("u-target", "staff");
    setClerkUser("sa-test-1");
    const updated = await setUserRole("u-target", "admin");
    expect(updated.role).toBe("admin");
  });

  it("owner cannot modify a super admin account", async () => {
    await createUser("u-owner", "admin");
    await createUser("u-sa", "super_admin");
    setClerkUser("u-owner");
    await expect(disableUser("u-sa")).rejects.toThrow(
      "configured outside the application"
    );
    const unchanged = await prisma.user.findUnique({ where: { clerkUserId: "u-sa" } });
    expect(unchanged?.status).toBe("active");
    expect(unchanged?.role).toBe("super_admin");
  });

  it("owner cannot change their own access", async () => {
    await createUser("u-owner", "admin");
    setClerkUser("u-owner");
    await expect(disableUser("u-owner")).rejects.toThrow(
      "You cannot change your own access"
    );
    await expect(setUserRole("u-owner", "customer")).rejects.toThrow(
      "You cannot change your own access"
    );
  });

  it("super-admin-only updateUserRole rejects an owner", async () => {
    await createUser("u-owner", "admin");
    setClerkUser("u-owner");
    await expectRedirect(updateUserRole("some-user", "staff"));
  });
});

describe("disable and restore staff", () => {
  it("disabled staff loses all access until restored", async () => {
    await createUser("u-owner", "admin");
    await createUser("u-target", "staff");
    setClerkUser("u-owner");

    await disableUser("u-target");
    const disabled = await prisma.user.findUnique({ where: { clerkUserId: "u-target" } });
    expect(disabled?.status).toBe("disabled");
    expect(clerkMock.updateUserMetadata).toHaveBeenLastCalledWith("u-target", {
      publicMetadata: { role: "staff", status: "disabled" },
    });

    await restoreUser("u-target");
    const restored = await prisma.user.findUnique({ where: { clerkUserId: "u-target" } });
    expect(restored?.status).toBe("active");
    expect(clerkMock.updateUserMetadata).toHaveBeenLastCalledWith("u-target", {
      publicMetadata: { role: "staff", status: "active" },
    });
  });

  it("double disable and restore of an active user are silent no-ops", async () => {
    await createUser("u-owner", "admin");
    await createUser("u-target", "staff");
    setClerkUser("u-owner");

    expect(await disableUser("u-target")).not.toBeNull();
    expect(await disableUser("u-target")).toBeNull();
    expect(await restoreUser("u-target")).not.toBeNull();
    expect(await restoreUser("u-target")).toBeNull();
  });

  it("rejects operations on an unknown user", async () => {
    await createUser("u-owner", "admin");
    setClerkUser("u-owner");
    await expect(setUserRole("u-ghost", "staff")).rejects.toThrow("User not found");
  });
});