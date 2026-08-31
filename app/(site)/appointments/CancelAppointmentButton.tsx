"use client";

import { cancelMyAppointment } from "./actions";

export default function CancelAppointmentButton({
  appointmentId,
}: {
  appointmentId: number;
}) {
  return (
    <form
      action={cancelMyAppointment.bind(null, appointmentId)}
      onSubmit={(event) => {
        if (!window.confirm("Cancel this appointment?")) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="text-sm font-medium text-danger underline transition-colors hover:text-danger/80"
      >
        Cancel appointment
      </button>
    </form>
  );
}
