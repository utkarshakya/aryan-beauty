import CancelAppointmentButton from "./CancelAppointmentButton";

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

const formatTime = (date: Date) =>
  date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

const statusClasses: Record<string, string> = {
  pending: "bg-warning-soft text-warning",
  confirmed: "bg-success-soft text-success",
  cancelled: "bg-neutral-soft text-neutral",
};

type Appointment = {
  id: number;
  startTime: Date;
  endTime: Date;
  status: string;
  service: { name: string; durationMin: number; price: number };
};

export default function AppointmentGroup({
  title,
  emptyMessage,
  appointments,
}: {
  title: string;
  emptyMessage: string;
  appointments: Appointment[];
}) {
  return (
    <section aria-labelledby={`${title.toLowerCase().replace(/\s+/g, "-")}-appointments`}>
      <h2
        id={`${title.toLowerCase().replace(/\s+/g, "-")}-appointments`}
        className="mb-3 text-lg font-semibold text-foreground sm:mb-4 sm:text-xl"
      >
        {title}
      </h2>
      {appointments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted sm:p-6 sm:text-sm">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <article
              key={appointment.id}
              className="rounded-xl border border-border bg-background p-3 shadow-sm sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">{appointment.service.name}</h3>
                  <p className="mt-1 text-sm text-muted">
                    {appointment.service.durationMin} minutes · ₹{Math.round(appointment.service.price)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[appointment.status] ?? "bg-neutral-soft text-neutral"}`}
                >
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>

              <div className="mt-4 border-t border-border pt-3 text-sm text-foreground">
                <p>{formatDate(appointment.startTime)}</p>
                <p className="mt-1 text-muted">
                  {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}
                </p>
              </div>

              {appointment.status !== "cancelled" && appointment.startTime > new Date() && (
                <div className="mt-4 border-t border-border pt-3">
                  <CancelAppointmentButton appointmentId={appointment.id} />
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
