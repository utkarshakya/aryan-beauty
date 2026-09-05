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
}

export async function cancelAppointment(id: number) {
  await requireAdmin();
  await prisma.appointment.update({
    where: { id },
    data: { status: "cancelled" },
  });
  revalidatePath("/admin");
}

export async function getAdminAppointments(
  statusFilter: string[] | undefined,
  startTime: Date,
) {
  await requireAdmin();
  return prisma.appointment.findMany({
    where: {
      startTime: { gte: startTime },
      ...(statusFilter ? { status: { in: statusFilter } } : {}),
    },
    include: { customer: true, service: true },
    orderBy: { startTime: "asc" },
  });
}

export async function getAdminAppointmentCounts(startTime: Date) {
  await requireAdmin();
  const [
    todayAppointments,
    pendingAppointments,
    confirmedAppointments,
    activeServices,
  ] = await Promise.all([
    prisma.appointment.count({
      where: { startTime: { gte: startTime }, status: { not: "cancelled" } },
    }),
    prisma.appointment.count({
      where: { status: "pending", startTime: { gte: startTime } },
    }),
    prisma.appointment.count({
      where: { status: "confirmed", startTime: { gte: startTime } },
    }),
    prisma.service.count({ where: { active: true } }),
  ]);
  return {
    todayAppointments,
    pendingAppointments,
    confirmedAppointments,
    activeServices,
  };
}

export async function getUpcomingAppointments(startTime: Date) {
  await requireAdmin();
  return prisma.appointment.findMany({
    where: { startTime: { gte: startTime }, status: { not: "cancelled" } },
    include: { customer: true, service: true },
    orderBy: { startTime: "asc" },
    take: 5,
  });
}
