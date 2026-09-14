"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { requireActiveUser, requireAdmin } from "@/lib/auth";
import {
  getAvailableSlots,
  createAppointmentTx,
  cancelAppointment,
  getAppointmentById,
  confirmAppointment as confirmAppointmentTransition,
  adminCancelAppointment as adminCancelAppointmentTransition,
  restoreAppointment,
  type BookingState,
  type CancellationState,
  type TimeSlot,
} from "@/lib/db/appointments";

// ─── Re-exports ─────────────────────────────────────────────────────────────

export { getAvailableSlots };
export type {
  BookingState,
  CancellationState,
  TimeSlot,
} from "@/lib/db/appointments";

// ─── Constants ──────────────────────────────────────────────────────────────

const INDIAN_PHONE_RE = new RegExp("^[6-9]\\d{9}$");
const DATE_RE = new RegExp("^\\d{4}-\\d{2}-\\d{2}$");
const initialState: BookingState = { errors: {} };

// ─── Customer Actions ───────────────────────────────────────────────────────

export async function getAvailableSlotsAction(
  serviceId: number,
  date: string,
): Promise<TimeSlot[]> {
  await requireActiveUser();

  if (!Number.isInteger(serviceId) || serviceId <= 0 || !DATE_RE.test(date)) {
    return [];
  }

  return getAvailableSlots(serviceId, date);
}

export async function createAppointment(
  _prevState: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const userId = await requireActiveUser();

  const user = await currentUser();
  const accountName =
    user?.fullName?.trim() ||
    user?.firstName?.trim() ||
    user?.primaryEmailAddress?.emailAddress ||
    "Customer";
  const accountEmail = user?.primaryEmailAddress?.emailAddress ?? null;

  if (formData.get("__reset")) {
    return initialState;
  }

  const serviceId = Number(formData.get("serviceId"));
  const name = accountName;
  const phone = String(formData.get("phone") ?? "").trim();
  const startTimeRaw = String(formData.get("startTime") ?? "");

  const errors: Record<string, string> = {};

  if (phone && !INDIAN_PHONE_RE.test(phone)) {
    errors.phone = "Enter a valid 10-digit Indian mobile number";
  }
  if (!Number.isInteger(serviceId) || serviceId <= 0) {
    errors.serviceId = "Please select a service";
  }
  const startTime = new Date(startTimeRaw);
  if (!startTimeRaw || Number.isNaN(startTime.getTime())) {
    errors.startTime = "Please pick a date and time";
  } else if (startTime <= new Date()) {
    errors.startTime = "Please pick a date and time in the future";
  }
  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const { getBusinessSettingsForAvailability } =
    await import("@/lib/db/business");
  const businessSettings = await getBusinessSettingsForAvailability();
  const businessDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: businessSettings.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(startTime);
  const availableSlots = await getAvailableSlots(serviceId, businessDate);
  if (!availableSlots.some((slot) => slot.value === startTime.toISOString())) {
    return {
      errors: {
        startTime:
          "That time is no longer available. Please choose another slot.",
      },
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const service = await tx.service.findFirst({
        where: { id: serviceId, active: true },
      });
      if (!service) {
        throw new Error("Service not found");
      }

      const endTime = new Date(
        startTime.getTime() + service.durationMin * 60_000,
      );

      const conflict = await tx.appointment.findFirst({
        where: {
          status: { not: "cancelled" },
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
      });
      if (conflict) {
        throw new Error("Time slot unavailable");
      }

      const appUser = await tx.user.findUnique({
        where: { clerkUserId: userId },
      });
      if (!appUser) throw new Error("User not found");

      const customer = await tx.customer.upsert({
        where: { userId: appUser.id },
        update: { name, phone: phone || null, email: accountEmail },
        create: {
          userId: appUser.id,
          name,
          phone: phone || null,
          email: accountEmail,
        },
      });

      await createAppointmentTx(tx, {
        customerId: customer.id,
        serviceId: service.id,
        serviceName: service.name,
        servicePrice: service.price,
        serviceDurationMin: service.durationMin,
        startTime,
        endTime,
      });

      return { serviceName: service.name, startTime };
    });

    return {
      success: {
        serviceName: result.serviceName,
        startTime: result.startTime.toISOString(),
        name,
        phone,
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message === "Time slot unavailable") {
      return {
        errors: {
          startTime:
            "Sorry, that time is already booked. Please choose another slot.",
        },
      };
    }
    if (error instanceof Error && error.message === "Service not found") {
      return {
        errors: {
          serviceId:
            "This service is no longer available. Please pick another.",
        },
      };
    }
    return { errors: { form: "Something went wrong. Please try again." } };
  }
}

export async function cancelMyAppointment(
  _previousState: CancellationState,
  formData: FormData,
): Promise<CancellationState> {
  const userId = await requireActiveUser();

  const appointmentId = Number(formData.get("appointmentId"));
  if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
    return { error: "That appointment could not be found." };
  }

  const appUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!appUser) return { error: "User not found" };

  const customer = await prisma.customer.findUnique({
    where: { userId: appUser.id },
  });
  if (!customer) return { error: "User not found" };

  const cancelled = await cancelAppointment(appointmentId, customer.id);

  if (!cancelled) {
    const { getBusinessSettingsForAvailability } =
      await import("@/lib/db/business");
    const business = await getBusinessSettingsForAvailability();
    const hours = Math.round(business.cancellationCutoffMin / 60);
    return {
      error: `Appointments can only be cancelled more than ${hours} hour${hours !== 1 ? "s" : ""} before the visit.`,
    };
  }

  revalidatePath("/appointments");
  revalidatePath("/admin");
  return { success: "Appointment cancelled successfully." };
}

// ─── Admin Actions ──────────────────────────────────────────────────────────

export async function confirmAppointment(id: number) {
  await requireAdmin();
  if (!Number.isInteger(id) || id <= 0) return;

  const applied = await confirmAppointmentTransition(id);
  if (!applied) return;

  revalidatePath("/admin");
  revalidatePath(`/admin/appointments/${id}`);
}

export async function adminCancelAppointment(id: number) {
  await requireAdmin();
  if (!Number.isInteger(id) || id <= 0)
    return { ok: false, error: "That appointment could not be found." };

  const applied = await adminCancelAppointmentTransition(id);
  if (applied) {
    revalidatePath("/admin");
    revalidatePath(`/admin/appointments/${id}`);
  }
  return {
    ok: applied,
    error: applied
      ? undefined
      : "This appointment is already completed or cancelled and cannot be changed.",
  };
}

export async function restoreAppointmentAction(id: number) {
  await requireAdmin();
  if (!Number.isInteger(id) || id <= 0)
    return { ok: false, error: "That appointment could not be found." };

  const applied = await restoreAppointment(id);
  if (applied) {
    revalidatePath("/admin");
    revalidatePath(`/admin/appointments/${id}`);
  }
  return {
    ok: applied,
    error: applied
      ? undefined
      : "Only an upcoming cancelled appointment can be restored.",
  };
}

export async function getAdminAppointmentAction(id: number) {
  await requireAdmin();

  if (!Number.isInteger(id) || id <= 0) return null;

  const appointment = await getAppointmentById(id);
  if (!appointment) return null;

  const now = new Date();
  return {
    ...appointment,
    displayStatus:
      appointment.status === "confirmed" && appointment.endTime < now
        ? "completed"
        : appointment.status,
  };
}

export async function getAdminAppointments(
  statusFilter: string[] | undefined,
  now = new Date(),
  opts: {
    search?: string;
    from?: Date;
    to?: Date;
    windowCompleted?: boolean;
  } = {},
) {
  await requireAdmin();
  const { search, from, to, windowCompleted } = opts;
  const completedFilter =
    statusFilter?.length === 1 && statusFilter[0] === "completed";
  const term = search?.trim();
  const customerFilter: Prisma.AppointmentWhereInput = term
    ? {
        customer: {
          is: {
            OR: [
              { name: { contains: term, mode: "insensitive" } },
              { phone: { contains: term } },
            ],
          },
        },
      }
    : {};
  const dateWindow =
    from || to
      ? {
          ...(from ? { gte: from } : {}),
          ...(to ? { lt: to } : {}),
        }
      : undefined;

  const appointments = await prisma.appointment.findMany({
    where: {
      ...customerFilter,
      ...(completedFilter
        ? {
            status: "confirmed",
            endTime: { lt: now },
            ...(windowCompleted && dateWindow
              ? { startTime: dateWindow }
              : {}),
          }
        : term
          ? {
              ...(statusFilter ? { status: { in: statusFilter } } : {}),
            }
          : {
              ...(dateWindow ? { startTime: dateWindow } : {}),
              ...(statusFilter ? { status: { in: statusFilter } } : {}),
              NOT: { status: "confirmed", endTime: { lt: now } },
            }),
    },
    include: { customer: true },
    orderBy: {
      startTime: term || completedFilter || !dateWindow ? "desc" : "asc",
    },
  });

  return appointments.map((appointment) => ({
    ...appointment,
    displayStatus:
      appointment.status === "confirmed" && appointment.endTime < now
        ? "completed"
        : appointment.status,
  }));
}

export async function getAdminAppointmentCounts(
  startTime: Date,
  now = new Date(),
) {
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
      where: {
        status: "confirmed",
        startTime: { gte: startTime },
        NOT: { endTime: { lt: now } },
      },
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

export async function getUpcomingAppointments(
  startTime: Date,
  now = new Date(),
) {
  await requireAdmin();
  return prisma.appointment.findMany({
    where: {
      startTime: { gte: startTime },
      endTime: { gte: now },
      status: { not: "cancelled" },
    },
    include: { customer: true },
    orderBy: { startTime: "asc" },
    take: 5,
  });
}
