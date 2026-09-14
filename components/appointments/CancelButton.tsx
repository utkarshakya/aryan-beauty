"use client";

import { adminCancelAppointment as cancelAppointment } from "@/app/actions/appointments";

export default function CancelButton({ appointmentId }: { appointmentId: number }) {
  const handleSubmit = async () => {
    if (window.confirm("Cancel this appointment?")) {
      const result = await cancelAppointment(appointmentId);
      if (result.error) {
        window.alert(result.error);
      }
    }
  };

  return (
    <form action={handleSubmit}>
      <button
        type="submit"
        className="text-red-600 hover:text-red-800 font-medium underline text-sm"
      >
        Cancel
      </button>
    </form>
  );
}