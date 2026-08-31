"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function cancelMyAppointment(appointmentId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
    throw new Error("Invalid appointment");
  }

  const result = await prisma.appointment.updateMany({
    where: {
      id: appointmentId,
      status: { not: "cancelled" },
      startTime: { gt: new Date() },
      customer: { clerkUserId: userId },
    },
    data: { status: "cancelled" },
  });

  if (result.count === 0) {
    throw new Error("Appointment cannot be cancelled");
  }

  revalidatePath("/appointments");
  revalidatePath("/admin");
}
