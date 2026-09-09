import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Appointment, Service, Customer } from "@prisma/client";

export type AppointmentWithRelations = Appointment & {
  customer: Customer;
  service: Service;
};

export type TimeSlot = { value: string; label: string };

export type BookingState =
  | {
      success: {
        serviceName: string;
        startTime: string;
        name: string;
        phone: string | null;
      };
    }
  | { errors: Record<string, string> };

export type CancellationState = {
  success?: string;
  error?: string;
};

export async function getAppointmentsByCustomerId(
  customerId: number
): Promise<AppointmentWithRelations[]> {
  return prisma.appointment.findMany({
    where: { customerId },
    include: { service: true, customer: true },
    orderBy: { startTime: "desc" },
  });
}

export async function getUpcomingAppointmentsByCustomer(
  customerId: number,
  now: Date = new Date()
): Promise<AppointmentWithRelations[]> {
  const appointments = await getAppointmentsByCustomerId(customerId);
  return appointments.filter(
    (a) => a.startTime >= now && a.status !== "cancelled"
  );
}

export async function getRecentHistory(
  customerId: number,
  limit: number = 10
): Promise<AppointmentWithRelations[]> {
  const appointments = await getAppointmentsByCustomerId(customerId);
  const upcoming = await getUpcomingAppointmentsByCustomer(customerId);
  const upcomingIds = new Set(upcoming.map((a) => a.id));
  return appointments
    .filter((a) => !upcomingIds.has(a.id))
    .slice(0, limit);
}

export async function getAvailableSlots(
  serviceId: number,
  date: string
): Promise<{ value: string; label: string }[]> {
  const { business } = await import("@/lib/business");

  const dateAtBusinessTime = (date: string, hour: number) =>
    new Date(`${date}T${String(hour).padStart(2, "0")}:00:00+05:30`);

  const service = await prisma.service.findFirst({
    where: { id: serviceId, active: true },
  });
  if (!service) return [];

  const opening = dateAtBusinessTime(date, business.openingHour);
  const closing = dateAtBusinessTime(date, business.closingHour);

  const appointments = await prisma.appointment.findMany({
    where: {
      status: { not: "cancelled" },
      startTime: { lt: closing },
      endTime: { gt: opening },
    },
    select: { startTime: true, endTime: true },
  });

  const slots: { value: string; label: string }[] = [];
  const durationMs = service.durationMin * 60_000;
  const intervalMs = business.slotIntervalMin * 60_000;
  const now = Date.now();

  for (
    let start = opening.getTime();
    start + durationMs <= closing.getTime();
    start += intervalMs
  ) {
    const end = start + durationMs;
    const unavailable = appointments.some(
      (appointment) =>
        appointment.startTime.getTime() < end &&
        appointment.endTime.getTime() > start
    );
    if (start > now && !unavailable) {
      const startDate = new Date(start);
      slots.push({
        value: startDate.toISOString(),
        label: startDate.toLocaleTimeString("en-IN", {
          timeZone: business.timezone,
          hour: "numeric",
          minute: "2-digit",
        }),
      });
    }
  }

  return slots;
}

export async function createAppointmentTx(
  tx: Prisma.TransactionClient,
  data: {
    customerId: number;
    serviceId: number;
    startTime: Date;
    endTime: Date;
  }
) {
  return tx.appointment.create({ data });
}

export async function cancelAppointment(
  appointmentId: number,
  customerId: number,
  cutoffHours: number
) {
  const result = await prisma.appointment.updateMany({
    where: {
      id: appointmentId,
      status: { not: "cancelled" },
      startTime: {
        gt: new Date(Date.now() + cutoffHours * 60 * 60 * 1000),
      },
      customerId,
    },
    data: { status: "cancelled" },
  });
  return result.count > 0;
}

export async function confirmAppointment(appointmentId: number) {
  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "confirmed" },
  });
}

export async function getCustomerWithAppointments(customerId: number) {
  return prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      appointments: {
        include: { service: true },
        orderBy: { startTime: "desc" },
      },
    },
  });
}