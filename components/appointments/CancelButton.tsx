"use client";

import { useState } from "react";
import { adminCancelAppointment as cancelAppointment } from "@/app/actions/appointments";
import { GENERIC_FORM_ERROR, logClientError } from "@/lib/errors";
import { ActionButton } from "@/components/ui";

export default function CancelButton({ appointmentId }: { appointmentId: number }) {
  const [pending, setPending] = useState(false);

  const handleSubmit = async () => {
    if (pending) return;
    if (window.confirm("Cancel this appointment?")) {
      setPending(true);
      try {
        const result = await cancelAppointment(appointmentId);
        if (result.error) {
          window.alert(result.error);
        }
      } catch (error) {
        logClientError("action:adminCancelAppointment", error);
        window.alert(GENERIC_FORM_ERROR);
      } finally {
        setPending(false);
      }
    }
  };

  return (
    <form action={handleSubmit}>
      <ActionButton type="submit" tone="danger" disabled={pending}>
        {pending ? "Cancelling…" : "Cancel"}
      </ActionButton>
    </form>
  );
}