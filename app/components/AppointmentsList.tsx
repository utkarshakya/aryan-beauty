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
  pending: "bg-warning-soft text-warning",
  confirmed: "bg-success-soft text-success",
  cancelled: "bg-neutral-soft text-neutral",
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
        className="flex flex-wrap gap-1.5 border-b border-border pb-2 sm:gap-4 sm:pb-2"
        aria-label="Appointment status filters"
      >
        {statusTabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin?status=${tab.value}`}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:py-2 sm:text-sm ${
              currentStatus === tab.value
                ? "bg-pink-600 text-white"
                : "text-muted hover:bg-neutral-soft"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {appointments.length === 0 ? (
        <div className="rounded-xl border border-border bg-background p-5 text-center text-sm text-muted shadow-sm sm:p-8">
          No appointments
        </div>
      ) : (
      <>
      <div className="space-y-3 md:hidden">
        {appointments.map((appointment) => (
          <article key={appointment.id} className="rounded-xl border border-border bg-background p-3 shadow-sm sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{appointment.customer.name}</p>
                {appointment.customer.phone && (
                  <p className="mt-1 text-sm text-muted">{appointment.customer.phone}</p>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${STATUS_BADGE_CLASSES[appointment.status]}`}
              >
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </span>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs sm:mt-4 sm:gap-3 sm:text-sm">
              <div>
                <dt className="text-muted">Service</dt>
                <dd className="mt-1 font-medium text-foreground">{appointment.service.name}</dd>
              </div>
              <div>
                <dt className="text-muted">Price</dt>
                <dd className="mt-1 font-medium text-foreground">₹{Math.round(appointment.service.price)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted">Date &amp; time</dt>
                <dd className="mt-1 text-foreground">
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
              <div className="mt-4 flex flex-wrap justify-end gap-3 border-t border-border pt-3">
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
            <tr className="border-b border-border text-left text-muted">
              <th className="pb-3 font-medium">Customer</th>
              <th className="pb-3 font-medium">Service</th>
              <th className="pb-3 font-medium">Date & Time</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {appointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-neutral-soft">
                <td className="py-4">
                  <p className="font-medium text-foreground">{appointment.customer.name}</p>
                  {appointment.customer.phone && (
                    <p className="text-muted">{appointment.customer.phone}</p>
                  )}
                </td>
                <td className="py-4">
                  <p className="font-medium text-foreground">{appointment.service.name}</p>
                  <p className="text-muted">
                    {appointment.service.durationMin} min · ₹{Math.round(appointment.service.price)}
                  </p>
                </td>
                <td className="py-4 text-foreground">
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
