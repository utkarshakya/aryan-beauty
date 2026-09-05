"use client";

import { useRef, useState } from "react";
import type { Service } from "@prisma/client";
import BookingForm from "./BookingForm";

export default function BookAppointmentSection({
  services,
  preselectedServiceId,
}: {
  services: Service[];
  preselectedServiceId?: number;
}) {
  const [open, setOpen] = useState(Boolean(preselectedServiceId));
  const formRef = useRef<HTMLDivElement>(null);

  if (open) {
    return (
      <div ref={formRef}>
        <BookingForm
          services={services}
          preselectedServiceId={preselectedServiceId}
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-background p-4 text-center shadow-sm sm:p-6">
      <p className="text-sm text-muted">
        Choose a service, pick a date and time, and confirm your booking.
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open booking form"
        className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        Book appointment
      </button>
    </div>
  );
}
