"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { business } from "@/lib/business";

// --- Booking ---

export type TimeSlot = { value: string; label: string };

const dateAtBusinessTime = (date: string, hour: number) =>
  new Date(`${date}T${String(hour).padStart(2, "0")}:00:00+05:30`);

export async function getAvailableSlots(
  serviceId: number,
  date: string,
): Promise<TimeSlot[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (!Number.isInteger(serviceId) || serviceId <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return [];
  }

  const service = await prisma.service.findFirst({ where: { id: serviceId, active: true } });
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

  const slots: TimeSlot[] = [];
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
        appointment.endTime.getTime() > start,
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

const INDIAN_PHONE_RE = /^[6-9]\d{9}$/;

const initialState: BookingState = { errors: {} };

export async function createAppointment(
  _prevState: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

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

  const businessDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: business.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(startTime);
  const availableSlots = await getAvailableSlots(serviceId, businessDate);
  if (!availableSlots.some((slot) => slot.value === startTime.toISOString())) {
    return {
      errors: {
        startTime: "That time is no longer available. Please choose another slot.",
      },
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const service = await tx.service.findFirst({ where: { id: serviceId, active: true } });
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

      const appUser = await tx.user.findUnique({ where: { clerkUserId: userId } });
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

      await tx.appointment.create({
        data: {
          customerId: customer.id,
          serviceId: service.id,
          startTime,
          endTime,
        },
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
      return { errors: { serviceId: "This service is no longer available. Please pick another." } };
    }
    return { errors: { form: "Something went wrong. Please try again." } };
  }
}

// --- Cancellation ---

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

  const appUser = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    if (!appUser) return { error: "User not found" };

    const result = await prisma.appointment.updateMany({
      where: {
        id: appointmentId,
        status: { not: "cancelled" },
        startTime: {
          gt: new Date(Date.now() + business.cancellationCutoffHours * 60 * 60 * 1000),
        },
        customer: { userId: appUser.id },
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
