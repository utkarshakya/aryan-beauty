import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const clerkMock = vi.hoisted(() => ({
  auth: vi.fn(function () {}),
  clerkClient: vi.fn(async () => ({ users: { updateUserMetadata: vi.fn() } })),
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

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { resetDb } from "../helpers/db";
import {
  updateRoleAction,
  disableUserAction,
  restoreUserAction,
} from "@/app/actions/users";
import { updateBusinessSettingsAction } from "@/app/actions/business";

const mockedAuth = vi.mocked(auth);

// Tests run from the repo root (tests/setup.ts reads `.env` relative to it).
const ROOT = process.cwd();
const SCAN_DIRS = ["app", "lib", "components"];
const EXPECTED_ACTION_FILES = [
  "app/actions/appointments.ts",
  "app/actions/business.ts",
  "app/actions/customers.ts",
  "app/actions/services.ts",
  "app/actions/users.ts",
];

function walk(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, found);
    else if (full.endsWith(".ts") || full.endsWith(".tsx")) found.push(full);
  }
  return found;
}

function serverActionFiles(): string[] {
  return SCAN_DIRS.flatMap((dir) => walk(path.join(ROOT, dir)))
    .filter((file) => /^\s*["']use\s+server["']/.test(readFileSync(file, "utf8")))
    .map((file) => path.relative(ROOT, file).split(path.sep).join("/"))
    .sort();
}

function setGuestSession() {
  mockedAuth.mockReset();
  mockedAuth.mockResolvedValue({ userId: null, protect: vi.fn() } as never);
}

beforeEach(async () => {
  await resetDb();
  setGuestSession();
  clerkMock.clerkClient.mockClear();
});

afterEach(async () => {
  await resetDb();
});

describe("server-action surface", () => {
  it('is exactly the five files under app/actions — lib/auth/sync.ts is no longer an endpoint', () => {
    expect(serverActionFiles()).toEqual(EXPECTED_ACTION_FILES);
  });
});

describe("no session cannot mutate user access", () => {
  it("updateRoleAction returns ok:false and leaves the role untouched", async () => {
    const target = await prisma.user.create({
      data: { clerkUserId: "u-target", role: "customer", status: "active" },
    });

    const result = await updateRoleAction(target.clerkUserId, "staff");

    expect(result.ok).toBe(false);
    const unchanged = await prisma.user.findUnique({
      where: { id: target.id },
    });
    expect(unchanged?.role).toBe("customer");
    expect(clerkMock.clerkClient).not.toHaveBeenCalled();
  });

  it("disableUserAction returns ok:false and leaves the status untouched", async () => {
    const target = await prisma.user.create({
      data: { clerkUserId: "u-target", role: "admin", status: "active" },
    });

    const result = await disableUserAction(target.clerkUserId);

    expect(result.ok).toBe(false);
    const unchanged = await prisma.user.findUnique({
      where: { id: target.id },
    });
    expect(unchanged?.status).toBe("active");
    expect(clerkMock.clerkClient).not.toHaveBeenCalled();
  });

  it("restoreUserAction returns ok:false and leaves a disabled user disabled", async () => {
    const target = await prisma.user.create({
      data: { clerkUserId: "u-target", role: "customer", status: "disabled" },
    });

    const result = await restoreUserAction(target.clerkUserId);

    expect(result.ok).toBe(false);
    const unchanged = await prisma.user.findUnique({
      where: { id: target.id },
    });
    expect(unchanged?.status).toBe("disabled");
    expect(clerkMock.clerkClient).not.toHaveBeenCalled();
  });
});

describe("no session cannot mutate business settings", () => {
  it("updateBusinessSettingsAction redirects before it reads or writes anything", async () => {
    const formData = new FormData();
    formData.set("name", "Hijacked");

    await expect(
      updateBusinessSettingsAction({ errors: {} }, formData),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(await prisma.businessSettings.count()).toBe(0);
  });
});
