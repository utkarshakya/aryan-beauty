import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Appointment, Service, Customer } from "@prisma/client";

// ─── Types ──────────────────────────────────────────────────────────────────

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

// ─── Customer Queries ───────────────────────────────────────────────────────

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

// ─── Booking Logic ──────────────────────────────────────────────────────────

export async function getAvailableSlots(
  serviceId: number,
  date: string
): Promise<{ value: string; label: string }[]> {
  const { getBusinessSettingsForAvailability } = await import("@/lib/db/business");

  const business = await getBusinessSettingsForAvailability();

  const service = await prisma.service.findFirst({
    where: { id: serviceId, active: true },
  });
  if (!service) return [];

  const dayOfWeek = new Date(date + "T00:00:00").getDay();
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayName = dayNames[dayOfWeek];

  if (business.closedWeekdays.includes(dayOfWeek)) {
    return [];
  }

  const dayHours = business.openingHours[dayName];
  if (!dayHours) {
    return [];
  }

  const isClosureDate = business.closures.some((c) => c.date === date);
  if (isClosureDate) {
    return [];
  }

  const [openHour, openMin] = dayHours.open.split(":").map(Number);
  const [closeHour, closeMin] = dayHours.close.split(":").map(Number);

  const opening = new Date(`${date}T${String(openHour).padStart(2, "0")}:${String(openMin).padStart(2, "0")}:00`);
  const closing = new Date(`${date}T${String(closeHour).padStart(2, "0")}:${String(closeMin).padStart(2, "0")}:00`);

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
  const minBookingNoticeMs = business.minBookingNoticeMin * 60_000;
  const earliestAllowed = now + minBookingNoticeMs;

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
    if (start >= earliestAllowed && !unavailable) {
      const startDate = new Date(start);
      slots.push({
        value: startDate.toISOString(),
        label: startDate.toLocaleTimeString("en-IN", {
          timeZone: business.timeZone,
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
    serviceName: string;
    servicePrice: number;
    serviceDurationMin: number;
    startTime: Date;
    endTime: Date;
  }
) {
  return tx.appointment.create({ data });
}

export async function cancelAppointment(
  appointmentId: number,
  customerId: number
) {
  const { getBusinessSettingsForAvailability } = await import("@/lib/db/business");
  const business = await getBusinessSettingsForAvailability();
  const cutoffMs = business.cancellationCutoffMin * 60 * 1000;

  const result = await prisma.appointment.updateMany({
    where: {
      id: appointmentId,
      status: { not: "cancelled" },
      startTime: {
        gt: new Date(Date.now() + cutoffMs),
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
