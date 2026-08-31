import { confirmAppointment } from "@/app/admin/actions";
import CancelButton from "./CancelButton";
import Link from "next/link";

type Appointment = {
  id: number;
  startTime: Date;
  endTime: Date;
  status: string;
  notes: string;
  customer: { name: string; phone: string | null };
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
      <nav
        className="flex flex-wrap gap-2 border-b border-gray-200 pb-3 sm:gap-4 sm:pb-2"
        aria-label="Appointment status filters"
      >
        {statusTabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin?status=${tab.value}`}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
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
        <div className="rounded-xl bg-white p-6 text-center text-gray-500 shadow-sm sm:p-8">
          No appointments
        </div>
      ) : (
      <>
      <div className="space-y-3 md:hidden">
        {appointments.map((appointment) => (
          <article key={appointment.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-800">{appointment.customer.name}</p>
                {appointment.customer.phone && (
                  <p className="mt-1 text-sm text-gray-500">{appointment.customer.phone}</p>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${STATUS_BADGE_CLASSES[appointment.status]}`}
              >
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </span>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3 text-sm">
              <div>
                <dt className="text-gray-500">Service</dt>
                <dd className="mt-1 font-medium text-gray-800">{appointment.service.name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Price</dt>
                <dd className="mt-1 font-medium text-gray-800">₹{Math.round(appointment.service.price)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-gray-500">Date &amp; time</dt>
                <dd className="mt-1 text-gray-700">
                  {new Date(appointment.startTime).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })} · {new Date(appointment.startTime).toLocaleTimeString("en-IN", {
                    hour: "numeric",
                    minute: "2-digit",
                  })} – {new Date(appointment.endTime).toLocaleTimeString("en-IN", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </dd>
              </div>
            </dl>

            {appointment.status !== "cancelled" && (
              <div className="mt-4 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-3">
                {appointment.status === "pending" && (
                  <form action={confirmAppointment.bind(null, appointment.id)}>
                    <button type="submit" className="font-medium text-green-600 underline hover:text-green-800">
                      Confirm
                    </button>
                  </form>
                )}
                {appointment.status !== "cancelled" && <CancelButton appointmentId={appointment.id} />}
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[700px] text-sm">
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
                  {appointment.customer.phone && (
                    <p className="text-gray-500">{appointment.customer.phone}</p>
                  )}
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
      </>
      )}
    </div>
  );
}
