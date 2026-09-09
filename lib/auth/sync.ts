"use server";

import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { requireSuperAdmin } from "@/lib/auth";
import type { UserRole, UserStatus } from "@prisma/client";

export async function upsertUserFromClerk(
  clerkUserId: string,
  data: { email?: string | null; name?: string; role?: UserRole }
) {
  const { email = null, name, role } = data;

  const user = await prisma.$transaction(async (tx) => {
    const existingUser = await tx.user.findUnique({
      where: { clerkUserId },
    });

    // A routine Clerk profile update must never change a person's role or
    // reactivate an account disabled by an administrator.
    const user = existingUser
      ? await tx.user.update({
          where: { clerkUserId },
          data: { email, name },
        })
      : await tx.user.create({
          data: {
            clerkUserId,
            email,
            name,
            role: role ?? "customer",
            status: "active",
          },
        });

    const customer = email
      ? await tx.customer.findFirst({
          where: { email, userId: { equals: null } },
        })
      : null;

    if (customer) {
      await tx.customer.update({
        where: { id: customer.id },
        data: { userId: user.id },
      });
    }

    return user;
  });

  // Do network I/O after the database transaction has committed.
  await syncPublicMetadata(clerkUserId, {
    role: user.role,
    status: user.status,
  });

  return user;
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
  const user = await prisma.$transaction(async (tx) => {
    const existingUser = await tx.user.findUnique({ where: { clerkUserId } });
    if (!existingUser) return null;

    return tx.user.update({
      where: { clerkUserId },
      data: { status: "disabled" },
    });
  });

  if (!user) return null;

  await syncPublicMetadata(clerkUserId, {
    role: user.role,
    status: "disabled",
  });

  return user;
}

export async function updateUserRole(clerkUserId: string, role: UserRole) {
  await requireSuperAdmin();
  if (role === "super_admin") {
    throw new Error(
      "Super admin access is configured outside the application."
    );
  }

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