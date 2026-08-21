"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireOwner() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function confirmAppointment(id: number) {
  await requireOwner();
  await prisma.appointment.update({
    where: { id },
    data: { status: "confirmed" },
  });
  revalidatePath("/studio");
}

export async function cancelAppointment(id: number) {
  await requireOwner();
  await prisma.appointment.update({
    where: { id },
    data: { status: "cancelled" },
  });
  revalidatePath("/studio");
}