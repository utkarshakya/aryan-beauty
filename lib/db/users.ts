import { prisma } from "@/lib/prisma";
import type { UserRole, UserStatus } from "@prisma/client";

export type AppUserSummary = {
  clerkUserId: string;
  role: UserRole;
  status: UserStatus;
  name: string | null;
  email: string | null;
  createdAt: string;
};

export async function getAppUsers(): Promise<AppUserSummary[]> {
  const users = await prisma.user.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      clerkUserId: true,
      role: true,
      status: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return users.map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
  }));
}