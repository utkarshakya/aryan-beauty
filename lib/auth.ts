import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

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

export async function hasAdminAccess(userId: string | null) {
  if (!userId) return false;
  if (getSuperAdminUserIds().includes(userId) || getBootstrapAdminUserIds().includes(userId)) {
    return true;
  }

  const appUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { role: true, status: true },
  });

  return Boolean(
    appUser?.status === "active" &&
      (appUser.role === "super_admin" || appUser.role === "admin" || appUser.role === "staff"),
  );
}

export async function requireAdmin() {
  const { userId } = await auth();

  if (!userId) {
    await auth.protect();
  }

  const currentUserId = userId!;
  const isSuperAdmin = getSuperAdminUserIds().includes(currentUserId);

  if (isSuperAdmin) {
    await prisma.user.upsert({
      where: { clerkUserId: currentUserId },
      create: { clerkUserId: currentUserId, role: "super_admin" },
      update: { role: "super_admin", status: "active" },
    });
    return currentUserId;
  }

  if (getBootstrapAdminUserIds().includes(currentUserId)) {
    await prisma.user.upsert({
      where: { clerkUserId: currentUserId },
      create: { clerkUserId: currentUserId, role: "admin" },
      update: { role: "admin", status: "active" },
    });
  }

  const appUser = await prisma.user.findUnique({
    where: { clerkUserId: currentUserId },
    select: { role: true, status: true },
  });

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
  const appUser = await prisma.user.findUnique({
    where: { clerkUserId: currentUserId },
    select: { role: true },
  });

  if (!appUser || (appUser.role !== "super_admin" && appUser.role !== "admin")) {
    redirect("/");
  }

  return currentUserId;
}
