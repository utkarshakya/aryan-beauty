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

type SessionClaims = {
  metadata: {
    role: "super_admin" | "admin" | "staff" | "customer";
    status: "active" | "disabled";
  };
};

async function getClaims(): Promise<SessionClaims | null> {
  const { sessionClaims } = await auth();
  return (sessionClaims as unknown as SessionClaims) ?? null;
}

export async function hasAdminAccess(userId: string | null) {
  if (!userId) return false;
  if (getSuperAdminUserIds().includes(userId) || getBootstrapAdminUserIds().includes(userId)) {
    return true;
  }

  const claims = await getClaims();
  if (claims?.metadata?.role && claims?.metadata?.status === "active") {
    return ["super_admin", "admin", "staff"].includes(claims.metadata.role);
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
  const { userId, sessionClaims } = await auth();

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

  const claims = sessionClaims as unknown as SessionClaims | null;
  const metadata = claims?.metadata;

  if (
    !metadata ||
    metadata.status !== "active" ||
    !["super_admin", "admin", "staff"].includes(metadata.role)
  ) {
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
  }

  return currentUserId;
}

export async function requireOwnerAdmin() {
  const currentUserId = await requireAdmin();
  const { sessionClaims } = await auth();
  const claims = sessionClaims as unknown as SessionClaims | null;
  const metadata = claims?.metadata;

  if (metadata?.role && ["super_admin", "admin"].includes(metadata.role)) {
    return currentUserId;
  }

  const appUser = await prisma.user.findUnique({
    where: { clerkUserId: currentUserId },
    select: { role: true },
  });

  if (!appUser || (appUser.role !== "super_admin" && appUser.role !== "admin")) {
    redirect("/");
  }

  return currentUserId;
}