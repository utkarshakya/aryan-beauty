"use client";

import { cancelAppointment } from "@/app/admin/actions";

export default function CancelButton({ appointmentId }: { appointmentId: number }) {
  const handleSubmit = async () => {
    if (window.confirm("Cancel this appointment?")) {
      await cancelAppointment(appointmentId);
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
