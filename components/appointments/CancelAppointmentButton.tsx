"use client";

import { useActionState } from "react";
import { cancelMyAppointment } from "@/app/actions/appointments";
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
      <button
        type="submit"
        disabled={pending}
        className="text-sm font-medium text-danger underline transition-colors hover:text-danger/80"
      >
        {pending ? "Cancelling…" : "Cancel appointment"}
      </button>
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