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
