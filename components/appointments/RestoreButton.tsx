"use client";

import { useState } from "react";
import { restoreAppointmentAction } from "@/app/actions/appointments";
import { GENERIC_FORM_ERROR, logClientError } from "@/lib/errors";
import { ActionButton } from "@/components/ui";

export default function RestoreButton({
  appointmentId,
}: {
  appointmentId: number;
}) {
  const [pending, setPending] = useState(false);

  const handleSubmit = async () => {
    if (pending) return;
    if (window.confirm("Restore this appointment as confirmed?")) {
      setPending(true);
      try {
        const result = await restoreAppointmentAction(appointmentId);
        if (result.error) {
          window.alert(result.error);
        }
      } catch (error) {
        logClientError("action:restoreAppointment", error);
        window.alert(GENERIC_FORM_ERROR);
      } finally {
        setPending(false);
      }
    }
  };

  return (
    <form action={handleSubmit}>
      <ActionButton type="submit" tone="primary" disabled={pending}>
        {pending ? "Restoring…" : "Restore"}
      </ActionButton>
    </form>
  );
}