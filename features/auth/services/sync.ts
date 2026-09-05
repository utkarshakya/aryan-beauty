import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { UserRole, UserStatus } from "@prisma/client";

export async function upsertUserFromClerk(
  clerkUserId: string,
  data: { email: string; name?: string; role?: UserRole }
) {
  const { email, name, role = "customer" } = data;

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { clerkUserId },
      create: {
        clerkUserId,
        email,
        name,
        role,
        status: "active",
      },
      update: {
        email,
        name,
        role,
        status: "active",
      },
    });

    const customer = await tx.customer.findFirst({
      where: { email, userId: { equals: null } },
    });

    if (customer) {
      await tx.customer.update({
        where: { id: customer.id },
        data: { userId: user.id },
      });
    }

    await syncPublicMetadata(clerkUserId, { role: user.role, status: user.status });

    return user;
  });
}

export async function syncPublicMetadata(
  clerkUserId: string,
  metadata: { role: UserRole; status: UserStatus }
) {
  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkUserId, {
    publicMetadata: metadata,
  });
}

export async function softDeleteUser(clerkUserId: string) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { clerkUserId } });
    if (!user) return null;

    await tx.user.update({
      where: { clerkUserId },
      data: { status: "disabled" },
    });

    await syncPublicMetadata(clerkUserId, { role: user.role, status: "disabled" });

    return user;
  });
}

export async function updateUserRole(
  clerkUserId: string,
  role: UserRole
) {
  const client = await clerkClient();
  
  const user = await prisma.user.update({
    where: { clerkUserId },
    data: { role },
  });

  await client.users.updateUserMetadata(clerkUserId, {
    publicMetadata: { role: user.role, status: user.status },
  });

  return user;
}

export async function getOrCreateUser(clerkUserId: string) {
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(clerkUserId);

  const email = clerkUser.primaryEmailAddress?.emailAddress;
  const name = clerkUser.fullName || clerkUser.firstName || undefined;

  if (!email) throw new Error("Clerk user has no email");

  return upsertUserFromClerk(clerkUserId, { email, name });
}