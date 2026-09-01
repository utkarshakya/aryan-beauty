"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { business } from "@/lib/business";

export type CancellationState = {
  success?: string;
  error?: string;
};

export async function cancelMyAppointment(
  _previousState: CancellationState,
  formData: FormData,
): Promise<CancellationState> {
  const { userId } = await auth();
  if (!userId) return { error: "Please sign in again to cancel this appointment." };

  const appointmentId = Number(formData.get("appointmentId"));
  if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
    return { error: "That appointment could not be found." };
  }

  const result = await prisma.appointment.updateMany({
    where: {
      id: appointmentId,
      status: { not: "cancelled" },
      startTime: {
        gt: new Date(Date.now() + business.cancellationCutoffHours * 60 * 60 * 1000),
      },
      customer: { clerkUserId: userId },
    },
    data: { status: "cancelled" },
  });

  if (result.count === 0) {
    return {
      error: `Appointments can only be cancelled more than ${business.cancellationCutoffHours} hours before the visit.`,
    };
  }

  revalidatePath("/appointments");
  revalidatePath("/admin");
  return { success: "Appointment cancelled successfully." };
}
