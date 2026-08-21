import { confirmAppointment } from "@/app/studio/actions";
import CancelButton from "./CancelButton";
import Link from "next/link";

type Appointment = {
  id: number;
  startTime: Date;
  endTime: Date;
  status: string;
  notes: string;
  customer: { name: string; phone: string };
  service: { name: string; durationMin: number; price: number };
};

type AppointmentsListProps = {
  appointments: Appointment[];
  currentStatus: "default" | "all" | "pending" | "confirmed" | "cancelled";
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

const statusTabs: { value: "all" | "pending" | "confirmed" | "cancelled"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AppointmentsList({
  appointments,
  currentStatus,
}: AppointmentsListProps) {
  return (
    <div className="space-y-4">
      <nav className="flex gap-4 border-b border-gray-200 pb-2" aria-label="Appointment status filters">
        {statusTabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/studio?status=${tab.value}`}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentStatus === tab.value
                ? "bg-pink-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
          No appointments
        </div>
      ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="pb-3 font-medium">Customer</th>
              <th className="pb-3 font-medium">Service</th>
              <th className="pb-3 font-medium">Date & Time</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="hover:bg-gray-50">
                <td className="py-4">
                  <p className="font-medium text-gray-800">{appointment.customer.name}</p>
                  <p className="text-gray-500">{appointment.customer.phone}</p>
                </td>
                <td className="py-4">
                  <p className="font-medium text-gray-800">{appointment.service.name}</p>
                  <p className="text-gray-500">
                    {appointment.service.durationMin} min · ₹{Math.round(appointment.service.price)}
                  </p>
                </td>
                <td className="py-4 text-gray-700">
                  <p>
                    {new Date(appointment.startTime).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                  <p>
                    {new Date(appointment.startTime).toLocaleTimeString("en-IN", {
                      hour: "numeric",
                      minute: "2-digit",
                    })} –{" "}
                    {new Date(appointment.endTime).toLocaleTimeString("en-IN", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </td>
                <td className="py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_BADGE_CLASSES[appointment.status]}`}
                  >
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {appointment.status === "pending" && (
                      <form action={confirmAppointment.bind(null, appointment.id)}>
                        <button
                          type="submit"
                          className="text-green-600 hover:text-green-800 font-medium underline text-sm"
                        >
                          Confirm
                        </button>
                      </form>
                    )}
                    {appointment.status !== "cancelled" && (
                      <CancelButton appointmentId={appointment.id} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}