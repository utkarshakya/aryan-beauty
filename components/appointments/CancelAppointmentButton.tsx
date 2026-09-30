"use client";

import { useActionState } from "react";
import { cancelMyAppointment } from "@/app/actions/appointments";
import { ActionButton } from "@/components/ui";
import type { CancellationState } from "@/lib/db/appointments";

const initialState: CancellationState = {};

export default function CancelAppointmentButton({
  appointmentId,
}: {
  appointmentId: number;
}) {
  const [state, formAction, pending] = useActionState(
    cancelMyAppointment,
    initialState,
  );

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm("Cancel this appointment?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <ActionButton type="submit" tone="danger" disabled={pending}>
        {pending ? "Cancelling…" : "Cancel appointment"}
      </ActionButton>
      {state.error && (
        <p className="mt-2 text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="mt-2 text-sm text-success" role="status" aria-live="polite">
          {state.success}
        </p>
      )}
    </form>
  );
}