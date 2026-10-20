import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Appointment, Service, Customer } from "@prisma/client";
import { WEEKDAY_NAMES } from "@/lib/constants";

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


/**
 * Convert a business-local wall-clock date/time into an absolute instant.
 * The iterative correction avoids interpreting the value in the server's
 * local time zone. Invalid/nonexistent local times are rejected.
 */
function businessLocalDateTimeToInstant(
  date: string,
  time: string,
  timeZone: string,
): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const targetAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
  let candidate = targetAsUtc;

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = formatter.formatToParts(new Date(candidate));
    const values = Object.fromEntries(
      parts.filter((part) => part.type !== "literal").map((part) => [part.type, Number(part.value)]),
    );
    const representedAsUtc = Date.UTC(
      values.year,
      values.month - 1,
      values.day,
      values.hour,
      values.minute,
      values.second,
    );
    const correction = targetAsUtc - representedAsUtc;
    if (correction === 0) {
      return new Date(candidate);
    }
    candidate += correction;
  }

  throw new RangeError(`Local date/time ${date} ${time} does not exist in time zone ${timeZone}`);
}

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

export async function getAppointmentById(
  id: number
): Promise<AppointmentWithRelations | null> {
  return prisma.appointment.findUnique({
    where: { id },
    include: { customer: true, service: true },
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

  // `date` is a business-local calendar date, so derive its weekday in UTC.
  const dayOfWeek = new Date(date + "T00:00:00Z").getUTCDay();
  const dayName = WEEKDAY_NAMES[dayOfWeek];

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

  const opening = businessLocalDateTimeToInstant(date, dayHours.open, business.timeZone);
  const closing = businessLocalDateTimeToInstant(date, dayHours.close, business.timeZone);

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
        appointment.startTime &&
        appointment.endTime &&
        new Date(appointment.startTime).getTime() < end &&
        new Date(appointment.endTime).getTime() > start
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
  const result = await prisma.appointment.updateMany({
    where: { id: appointmentId, status: "pending" },
    data: { status: "confirmed" },
  });
  return result.count > 0;
}

export async function adminCancelAppointment(
  appointmentId: number,
  now: Date = new Date()
) {
  const result = await prisma.appointment.updateMany({
    where: {
      id: appointmentId,
      OR: [{ status: "pending" }, { status: "confirmed", endTime: { gte: now } }],
    },
    data: { status: "cancelled" },
  });
  return result.count > 0;
}

export async function restoreAppointment(
  appointmentId: number,
  now: Date = new Date()
) {
  const result = await prisma.appointment.updateMany({
    where: {
      id: appointmentId,
      status: "cancelled",
      startTime: { gte: now },
    },
    data: { status: "confirmed" },
  });
  return result.count > 0;
}
