import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

// ─── Types ──────────────────────────────────────────────────────────────────

export type UserRole = "super_admin" | "admin" | "staff" | "customer";
export type UserStatus = "active" | "disabled";

export interface PublicMetadata {
  role: UserRole;
  status: UserStatus;
}

export interface SessionClaims {
  metadata: PublicMetadata;
}

export * from "./sync";

// ─── Internal Helpers ───────────────────────────────────────────────────────

const getUserIds = (value: string | undefined) =>
  (value ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

const getSuperAdminUserIds = () => {
  return getUserIds(process.env.SUPER_ADMIN_CLERK_USER_IDS);
};

const getBootstrapAdminUserIds = () =>
  getUserIds(process.env.BOOTSTRAP_ADMIN_CLERK_USER_IDS);

type AppUserAccess = {
  role: "super_admin" | "admin" | "staff" | "customer";
  status: "active" | "disabled";
};

/**
 * The database is the authority for ordinary roles and disabled accounts.
 * Environment IDs exist only to provision the first privileged records and
 * to guarantee that the configured super admin can recover access.
 */
async function getAppUserAccess(userId: string): Promise<AppUserAccess | null> {
  if (getSuperAdminUserIds().includes(userId)) {
    return prisma.user.upsert({
      where: { clerkUserId: userId },
      create: { clerkUserId: userId, role: "super_admin", status: "active" },
      update: { role: "super_admin", status: "active" },
      select: { role: true, status: true },
    });
  }

  const existingUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { role: true, status: true },
  });
  if (existingUser) return existingUser;

  // Bootstrap is a one-time provisioning fallback. Once the record exists,
  // its database role and status control access, including disabling it.
  if (!getBootstrapAdminUserIds().includes(userId)) return null;

  return prisma.user.create({
    data: { clerkUserId: userId, role: "admin", status: "active" },
    select: { role: true, status: true },
  });
}

// ─── Auth Guards ────────────────────────────────────────────────────────────

export async function hasAdminAccess(userId: string | null) {
  if (!userId) return false;
  const appUser = await getAppUserAccess(userId);

  return Boolean(
    appUser?.status === "active" &&
      (appUser.role === "super_admin" || appUser.role === "admin" || appUser.role === "staff"),
  );
}

export async function requireActiveUser() {
  const { userId } = await auth();
  if (!userId) await auth.protect();

  const currentUserId = userId!;
  const appUser = await getAppUserAccess(currentUserId);
  if (!appUser || appUser.status !== "active") {
    redirect("/");
  }

  return currentUserId;
}

export async function requireAdmin() {
  const { userId } = await auth();

  if (!userId) {
    await auth.protect();
  }

  const currentUserId = userId!;
  const appUser = await getAppUserAccess(currentUserId);

  if (
    !appUser ||
    appUser.status !== "active" ||
    (appUser.role !== "super_admin" &&
      appUser.role !== "admin" &&
      appUser.role !== "staff")
  ) {
    redirect("/");
  }

  return currentUserId;
}

export async function requireOwnerAdmin() {
  const currentUserId = await requireAdmin();
  const appUser = await getAppUserAccess(currentUserId);

  if (!appUser || (appUser.role !== "super_admin" && appUser.role !== "admin")) {
    redirect("/");
  }

  return currentUserId;
}

export async function requireSuperAdmin() {
  const { userId } = await auth();
  if (!userId) await auth.protect();

  const currentUserId = userId!;
  if (!getSuperAdminUserIds().includes(currentUserId)) {
    redirect("/");
  }

  await getAppUserAccess(currentUserId);
  return currentUserId;
}
