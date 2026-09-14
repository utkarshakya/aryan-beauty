import Link from "next/link";
import { confirmAppointment } from "@/app/actions/appointments";
import CancelButton from "./CancelButton";
import RestoreButton from "./RestoreButton";

const STATUS_BADGE_CLASSES: Record<string, string> = {
  pending: "bg-warning-soft text-warning",
  confirmed: "bg-success-soft text-success",
  completed: "bg-primary-soft text-primary-strong",
  cancelled: "bg-neutral-soft text-neutral",
};

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatTime = (date: Date) =>
  date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

type AppointmentDetailProps = {
  appointment: {
    id: number;
    customer: { name: string; phone: string | null; email: string | null };
    serviceName: string;
    servicePrice: number;
    serviceDurationMin: number;
    startTime: Date;
    endTime: Date;
    createdAt: Date;
    notes: string;
    displayStatus: string;
  };
};

export default function AppointmentDetail({
  appointment,
}: AppointmentDetailProps) {
  const displayStatus = appointment.displayStatus;
  const isCompleted = displayStatus === "completed";

  return (
    <div className="container mx-auto max-w-4xl px-3 py-4 sm:px-6 sm:py-8">
      <div className="mb-8">
        <Link
          href="/admin"
          className="text-sm font-medium text-primary hover:text-primary-strong"
        >
          ← Back to appointments
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 sm:mt-3">
          <div>
            <h1 className="text-xl font-bold text-foreground sm:text-3xl">
              Appointment #{appointment.id}
            </h1>
            <p className="mt-1 text-sm text-muted sm:text-base">
              Booked {formatDate(appointment.createdAt)} at{" "}
              {formatTime(appointment.createdAt)}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${STATUS_BADGE_CLASSES[displayStatus]}`}
          >
            {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
        <section
          className="rounded-xl border border-border bg-background p-4 shadow-sm sm:p-5"
          aria-labelledby="customer-heading"
        >
          <h2
            id="customer-heading"
            className="text-sm font-semibold uppercase tracking-wide text-muted"
          >
            Customer
          </h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="text-muted">Name</dt>
              <dd className="mt-1 font-medium text-foreground">
                {appointment.customer.name}
              </dd>
            </div>
            {appointment.customer.phone && (
              <div>
                <dt className="text-muted">Phone</dt>
                <dd className="mt-1 text-foreground">
                  <a
                    href={`tel:${appointment.customer.phone}`}
                    className="text-primary hover:text-primary-strong"
                  >
                    {appointment.customer.phone}
                  </a>
                </dd>
              </div>
            )}
            {appointment.customer.email && (
              <div>
                <dt className="text-muted">Email</dt>
                <dd className="mt-1 text-foreground">
                  <a
                    href={`mailto:${appointment.customer.email}`}
                    className="text-primary hover:text-primary-strong"
                  >
                    {appointment.customer.email}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </section>

        <section
          className="rounded-xl border border-border bg-background p-4 shadow-sm sm:p-5"
          aria-labelledby="service-heading"
        >
          <h2
            id="service-heading"
            className="text-sm font-semibold uppercase tracking-wide text-muted"
          >
            Service
          </h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="text-muted">Name</dt>
              <dd className="mt-1 font-medium text-foreground">
                {appointment.serviceName}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Duration</dt>
              <dd className="mt-1 text-foreground">
                {appointment.serviceDurationMin} minutes
              </dd>
            </div>
            <div>
              <dt className="text-muted">Price</dt>
              <dd className="mt-1 text-foreground">
                ₹{Math.round(appointment.servicePrice)}
              </dd>
            </div>
          </dl>
        </section>

        <section
          className="rounded-xl border border-border bg-background p-4 shadow-sm sm:p-5"
          aria-labelledby="schedule-heading"
        >
          <h2
            id="schedule-heading"
            className="text-sm font-semibold uppercase tracking-wide text-muted"
          >
            Schedule
          </h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="text-muted">Date</dt>
              <dd className="mt-1 font-medium text-foreground">
                {formatDate(appointment.startTime)}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Time</dt>
              <dd className="mt-1 text-foreground">
                {formatTime(appointment.startTime)} –{" "}
                {formatTime(appointment.endTime)}
              </dd>
            </div>
          </dl>
        </section>

        <section
          className="rounded-xl border border-border bg-background p-4 shadow-sm sm:p-5"
          aria-labelledby="notes-heading"
        >
          <h2
            id="notes-heading"
            className="text-sm font-semibold uppercase tracking-wide text-muted"
          >
            Notes
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">
            {appointment.notes || "No notes on this booking."}
          </p>
        </section>
      </div>

      {!isCompleted && displayStatus !== "cancelled" && (
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-5">
          {displayStatus === "pending" && (
            <form
              action={confirmAppointment.bind(null, appointment.id)}
              className="inline-flex"
            >
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-5"
              >
                Confirm appointment
              </button>
            </form>
          )}
          <CancelButton appointmentId={appointment.id} />
        </div>
      )}
      {displayStatus === "cancelled" &&
        new Date(appointment.startTime) > new Date() && (
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-5">
            <RestoreButton appointmentId={appointment.id} />
          </div>
        )}
    </div>
  );
}