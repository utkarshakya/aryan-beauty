"use server";

import { prisma } from "@/lib/prisma";

export type BookingState =
  | {
      success: {
        serviceName: string;
        startTime: string;
        name: string;
        phone: string;
      };
    }
  | { errors: Record<string, string> };

const INDIAN_PHONE_RE = /^[6-9]\d{9}$/;
const NOTES_MAX = 100;

export async function createAppointment(
  _prevState: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const serviceId = Number(formData.get("serviceId"));
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const startTimeRaw = String(formData.get("startTime") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  const errors: Record<string, string> = {};

  if (!name) {
    errors.name = "Name is required";
  }
  if (!INDIAN_PHONE_RE.test(phone)) {
    errors.phone = "Enter a valid 10-digit Indian mobile number";
  }
  if (!Number.isInteger(serviceId) || serviceId <= 0) {
    errors.serviceId = "Please select a service";
  }
  const startTime = new Date(startTimeRaw);
  if (!startTimeRaw || Number.isNaN(startTime.getTime())) {
    errors.startTime = "Please pick a date and time";
  } else if (startTime <= new Date()) {
    errors.startTime = "Start time must be in the future";
  }
  if (notes.length > NOTES_MAX) {
    errors.notes = `Notes must be ${NOTES_MAX} characters or fewer`;
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const service = await tx.service.findUnique({ where: { id: serviceId } });
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

      const customer = await tx.customer.upsert({
        where: { phone },
        update: { name },
        create: { name, phone },
      });

      await tx.appointment.create({
        data: {
          customerId: customer.id,
          serviceId: service.id,
          startTime,
          endTime,
          notes,
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
      return { errors: { startTime: "Time slot unavailable" } };
    }
    if (error instanceof Error && error.message === "Service not found") {
      return { errors: { serviceId: "Service not found" } };
    }
    return { errors: { form: "Something went wrong. Please try again." } };
  }
}
