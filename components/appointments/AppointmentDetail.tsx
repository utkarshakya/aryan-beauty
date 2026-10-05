"use client";

import { useState } from "react";
import { confirmAppointment } from "@/app/actions/appointments";
import {
  Badge,
  Button,
  PageHeader,
  badgeTone,
  cardClassName,
  cardLabelHeadingClass,
} from "@/components/ui";
import CancelButton from "./CancelButton";
import RestoreButton from "./RestoreButton";

const formatDate = (date: Date | string) =>
  new Date(date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatTime = (date: Date | string) =>
  new Date(date).toLocaleTimeString("en-IN", {
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
    startTime: Date | string;
    endTime: Date | string;
    createdAt: Date | string;
    notes: string;
    displayStatus: string;
  };
};

export default function AppointmentDetail({
  appointment,
}: AppointmentDetailProps) {
  const displayStatus = appointment.displayStatus;
  const isCompleted = displayStatus === "completed";
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    if (confirming) return;
    setConfirming(true);
    try {
      await confirmAppointment(appointment.id);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-3 py-4 sm:px-6 sm:py-8">
      <PageHeader
        backHref="/admin"
        backLabel="Back to dashboard"
        title={`Appointment #${appointment.id}`}
        subtitle={`Booked ${formatDate(appointment.createdAt)} at ${formatTime(appointment.createdAt)}`}
        actions={
          <Badge tone={badgeTone(displayStatus)}>
            {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
          </Badge>
        }
      />

      <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
        <section
          className={cardClassName("p-4 sm:p-5")}
          aria-labelledby="customer-heading"
        >
          <h2
            id="customer-heading"
            className={cardLabelHeadingClass}
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
          className={cardClassName("p-4 sm:p-5")}
          aria-labelledby="service-heading"
        >
          <h2
            id="service-heading"
            className={cardLabelHeadingClass}
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
                ₹{appointment.servicePrice}
              </dd>
            </div>
          </dl>
        </section>

        <section
          className={cardClassName("p-4 sm:p-5")}
          aria-labelledby="schedule-heading"
        >
          <h2
            id="schedule-heading"
            className={cardLabelHeadingClass}
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
          className={cardClassName("p-4 sm:p-5")}
          aria-labelledby="notes-heading"
        >
          <h2
            id="notes-heading"
            className={cardLabelHeadingClass}
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
            <form action={handleConfirm}>
              <Button type="submit" disabled={confirming}>
                {confirming ? "Confirming…" : "Confirm appointment"}
              </Button>
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