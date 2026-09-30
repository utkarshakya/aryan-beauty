"use client";

import { useRef, useState } from "react";
import type { Service } from "@prisma/client";
import { Button, cardClassName } from "@/components/ui";
import BookingForm from "./BookingForm";

export default function BookAppointmentSection({
  services,
  preselectedServiceId,
  phoneDisplay,
  phoneHref,
  hoursDays,
  hoursTime,
}: {
  services: Service[];
  preselectedServiceId?: number;
  phoneDisplay: string;
  phoneHref: string;
  hoursDays: string;
  hoursTime: string;
}) {
  const [open, setOpen] = useState(Boolean(preselectedServiceId));
  const formRef = useRef<HTMLDivElement>(null);

  if (open) {
    return (
      <div ref={formRef}>
        <BookingForm
          services={services}
          preselectedServiceId={preselectedServiceId}
          phoneDisplay={phoneDisplay}
          phoneHref={phoneHref}
          hoursDays={hoursDays}
          hoursTime={hoursTime}
        />
      </div>
    );
  }

  return (
    <div className={cardClassName("p-4 text-center sm:p-6")}>
      <p className="text-sm text-muted">
        Choose a service, pick a date and time, and confirm your booking.
      </p>
      <Button type="button" className="mt-4" onClick={() => setOpen(true)}>
        Book appointment
      </Button>
    </div>
  );
}
