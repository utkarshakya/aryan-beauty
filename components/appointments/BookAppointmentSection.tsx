"use client";

import { useEffect, useRef, useState } from "react";
import type { Service } from "@prisma/client";
import { Button, cardClassName } from "@/components/ui";
import BookingWizard from "./BookingWizard";

export default function BookAppointmentSection({
  services,
  preselectedServiceId,
  hoursDays,
  hoursTime,
  timeZone,
}: {
  services: Service[];
  preselectedServiceId?: number;
  hoursDays: string;
  hoursTime: string;
  timeZone: string;
}) {
  const [open, setOpen] = useState(Boolean(preselectedServiceId));
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) formRef.current?.scrollIntoView({ block: "nearest" });
  }, [open]);

  if (open) {
    return (
      <div ref={formRef}>
        <BookingWizard
          services={services}
          preselectedServiceId={preselectedServiceId}
          hoursDays={hoursDays}
          hoursTime={hoursTime}
          timeZone={timeZone}
          onBookingComplete={() => setOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className={cardClassName("p-4 text-center sm:p-6")}>
      <p className="text-body text-muted">
        Choose a service, pick a date and time, and confirm your booking.
      </p>
      <Button type="button" className="mt-4" onClick={() => setOpen(true)}>
        Book appointment
      </Button>
    </div>
  );
}
