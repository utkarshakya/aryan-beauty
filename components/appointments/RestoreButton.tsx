"use client";

import { restoreAppointmentAction } from "@/app/actions/appointments";

export default function RestoreButton({
  appointmentId,
}: {
  appointmentId: number;
}) {
  const handleSubmit = async () => {
    if (window.confirm("Restore this appointment as confirmed?")) {
      const result = await restoreAppointmentAction(appointmentId);
      if (result.error) {
        window.alert(result.error);
      }
    }
  };

  return (
    <form action={handleSubmit}>
      <button
        type="submit"
        className="font-medium text-primary underline hover:text-primary-strong text-sm"
      >
        Restore
      </button>
    </form>
  );
}