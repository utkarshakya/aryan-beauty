import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const getUserIds = (value: string | undefined) =>
  (value ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

const getSuperAdminUserIds = () => {
  // Keep the previous variable as a fallback so the existing account is not
  // locked out before SUPER_ADMIN_CLERK_USER_IDS is added to the environment.
  return getUserIds(
    process.env.SUPER_ADMIN_CLERK_USER_IDS ?? process.env.ADMIN_CLERK_USER_IDS,
  );
};

const getBootstrapAdminUserIds = () =>
  getUserIds(process.env.BOOTSTRAP_ADMIN_CLERK_USER_IDS);

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
