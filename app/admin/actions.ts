"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export async function confirmAppointment(id: number) {
  await requireAdmin();
  await prisma.appointment.update({
    where: { id },
    data: { status: "confirmed" },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/dashboard");
}

export async function cancelAppointment(id: number) {
  await requireAdmin();
  await prisma.appointment.update({
    where: { id },
    data: { status: "cancelled" },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/dashboard");
}
