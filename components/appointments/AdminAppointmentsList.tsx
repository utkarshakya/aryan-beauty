"use client";

import { useState } from "react";
import { confirmAppointment } from "@/app/actions/appointments";
import {
  ActionButton,
  Badge,
  EmptyState,
  badgeTone,
  cardClassName,
  filterPillClasses,
} from "@/components/ui";
import CancelButton from "./CancelButton";
import RestoreButton from "./RestoreButton";
import Link from "next/link";

const statusLabel = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1);

type Appointment = {
  id: number;
  startTime: Date | string;
  endTime: Date | string;
  status: string;
  displayStatus?: string;
  notes: string;
  customer: { name: string; phone: string | null };
  serviceName: string;
  servicePrice: number;
  serviceDurationMin: number;
};

type AppointmentsListProps = {
  appointments: Appointment[];
  currentStatus:
    | "default"
    | "all"
    | "pending"
    | "confirmed"
    | "cancelled"
    | "completed";
  searchTerm?: string;
  dateFilter?: string;
  scopeLabel?: string;
  showScope?: boolean;
  emptyMessage?: string;
};

const statusTabs: {
  value: "all" | "pending" | "confirmed" | "completed" | "cancelled";
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminAppointmentsList({
  appointments,
  currentStatus,
  searchTerm,
  dateFilter,
  scopeLabel,
  showScope,
  emptyMessage,
}: AppointmentsListProps) {
  const term = searchTerm?.trim();
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const handleConfirm = async (appointmentId: number) => {
    if (confirmingId !== null) return;
    setConfirmingId(appointmentId);
    try {
      await confirmAppointment(appointmentId);
    } finally {
      setConfirmingId(null);
    }
  };
  const statusWord =
    currentStatus === "all"
      ? null
      : currentStatus === "default"
        ? "pending"
        : currentStatus;
  const clearHref = () => {
    const params = new URLSearchParams();
    params.set("status", currentStatus === "default" ? "pending" : currentStatus);
    if (dateFilter) params.set("date", dateFilter);
    const qs = params.toString();
    return qs ? `/admin?${qs}` : "/admin";
  };
  const hrefForTab = (value: string) => {
    const params = new URLSearchParams();
    params.set("status", value);
    if (term) params.set("search", term);
    if (dateFilter) params.set("date", dateFilter);
    return `/admin?${params.toString()}`;
  };

  return (
    <div className="space-y-5 rounded-card border border-border bg-muted-soft/40 p-3 sm:space-y-6 sm:p-5">
      <nav
        className="flex flex-wrap gap-2 border-b border-border pb-3 sm:gap-3 sm:pb-4"
        aria-label="Appointment status filters"
      >
        {statusTabs.map((tab) => {
          const active =
            currentStatus === tab.value ||
            (currentStatus === "default" && tab.value === "pending");
          return (
            <Link
              key={tab.value}
              href={hrefForTab(tab.value)}
              aria-current={active ? "page" : undefined}
              className={filterPillClasses(active)}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {appointments.length === 0 ? (
        term ? (
          <EmptyState
            title={<>No appointments match “{term}”.</>}
            body={
              <>
                Try a different name or phone number, or{" "}
                <Link
                  href={clearHref()}
                  className="font-medium text-primary underline hover:text-primary-strong"
                >
                  clear the search
                </Link>
                .
              </>
            }
          />
        ) : (
          <EmptyState title={emptyMessage ?? "No appointments"} />
        )
      ) : (
        <>
          {term ? (
            <p className="text-sm text-muted">
              {appointments.length}{" "}
              {appointments.length === 1 ? "appointment" : "appointments"} for
              “{term}” ·{" "}
              <Link
                href={clearHref()}
                className="font-medium text-primary underline hover:text-primary-strong"
              >
                Clear search
              </Link>
            </p>
          ) : showScope && scopeLabel ? (
            <p className="text-sm text-muted">
              Showing{" "}
              {statusWord
                ? `${statusWord} appointments ${scopeLabel}`
                : `appointments ${scopeLabel}`}
              .
            </p>
          ) : null}
          <div className="space-y-3 md:hidden">
            {appointments.map((appointment) => {
              const displayStatus = appointment.displayStatus ?? appointment.status;
              const isCompleted = displayStatus === "completed";

              return (
              <article
                key={appointment.id}
                className={cardClassName("p-4 sm:p-5")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/appointments/${appointment.id}`}
                      className="truncate font-medium text-foreground hover:text-primary hover:underline"
                    >
                      {appointment.customer.name}
                    </Link>
                    {appointment.customer.phone && (
                      <p className="mt-1 text-sm text-muted">
                        {appointment.customer.phone}
                      </p>
                    )}
                  </div>
                  <Badge tone={badgeTone(displayStatus)}>
                    {statusLabel(displayStatus)}
                  </Badge>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3 text-xs sm:gap-4 sm:text-sm">
                  <div>
                    <dt className="text-muted">Service</dt>
                    <dd className="mt-1 font-medium text-foreground">
                      {appointment.serviceName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Price</dt>
                    <dd className="mt-1 text-right font-medium text-foreground">
                      ₹{Math.round(appointment.servicePrice)}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-muted">Date & time</dt>
                    <dd className="mt-1 text-foreground">
                      {new Date(appointment.startTime).toLocaleDateString(
                        "en-IN",
                        {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        },
                      )}{" "}
                      ·{" "}
                      {new Date(appointment.startTime).toLocaleTimeString(
                        "en-IN",
                        {
                          hour: "numeric",
                          minute: "2-digit",
                        },
                      )}{" "}
                      –{" "}
                      {new Date(appointment.endTime).toLocaleTimeString(
                        "en-IN",
                        {
                          hour: "numeric",
                          minute: "2-digit",
                        },
                      )}
                    </dd>
                  </div>
                </dl>

                {!isCompleted && displayStatus !== "cancelled" && (
                  <div className="mt-4 flex flex-wrap justify-end gap-3 border-t border-border pt-3">
                    {displayStatus === "pending" && (
                      <form action={() => handleConfirm(appointment.id)}>
                        <ActionButton
                          type="submit"
                          tone="success"
                          disabled={confirmingId !== null}
                        >
                          {confirmingId === appointment.id
                            ? "Confirming…"
                            : "Confirm"}
                        </ActionButton>
                      </form>
                    )}
                    {displayStatus !== "cancelled" && (
                      <CancelButton appointmentId={appointment.id} />
                    )}
                  </div>
                )}
                {displayStatus === "cancelled" &&
                  appointment.startTime &&
                  new Date(appointment.startTime) > new Date() && (
                    <div className="mt-4 flex flex-wrap justify-end gap-3 border-t border-border pt-3">
                      <RestoreButton appointmentId={appointment.id} />
                    </div>
                  )}
              </article>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-175 text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted">
                  <th className="px-3 py-3 font-medium">Customer</th>
                  <th className="px-3 py-3 font-medium">Service</th>
                  <th className="px-3 py-3 font-medium">Date & Time</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appointments.map((appointment) => {
                  const displayStatus = appointment.displayStatus ?? appointment.status;
                  const isCompleted = displayStatus === "completed";

                  return (
                  <tr key={appointment.id} className="hover:bg-neutral-soft">
                    <td className="px-3 py-4">
                      <Link
                        href={`/admin/appointments/${appointment.id}`}
                        className="font-medium text-foreground hover:text-primary hover:underline"
                      >
                        {appointment.customer.name}
                      </Link>
                      {appointment.customer.phone && (
                        <p className="text-muted">
                          {appointment.customer.phone}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-4">
                      <p className="font-medium text-foreground">
                        {appointment.serviceName}
                      </p>
                      <p className="text-muted">
                        {appointment.serviceDurationMin} min · ₹
                        {Math.round(appointment.servicePrice)}
                      </p>
                    </td>
                    <td className="px-3 py-4 text-foreground">
                      <p>
                        {new Date(appointment.startTime).toLocaleDateString(
                          "en-IN",
                          {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          },
                        )}
                      </p>
                      <p>
                        {new Date(appointment.startTime).toLocaleTimeString(
                          "en-IN",
                          {
                            hour: "numeric",
                            minute: "2-digit",
                          },
                        )}{" "}
                        –{" "}
                        {new Date(appointment.endTime).toLocaleTimeString(
                          "en-IN",
                          {
                            hour: "numeric",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </td>
                    <td className="px-3 py-4">
                      <Badge tone={badgeTone(displayStatus)}>
                        {statusLabel(displayStatus)}
                      </Badge>
                    </td>
                    <td className="px-3 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {!isCompleted && displayStatus === "pending" && (
                          <form action={() => handleConfirm(appointment.id)}>
                            <ActionButton
                              type="submit"
                              tone="success"
                              disabled={confirmingId !== null}
                            >
                              {confirmingId === appointment.id
                                ? "Confirming…"
                                : "Confirm"}
                            </ActionButton>
                          </form>
                        )}
                        {!isCompleted && displayStatus !== "cancelled" && (
                          <CancelButton appointmentId={appointment.id} />
                        )}
                        {displayStatus === "cancelled" &&
                          appointment.startTime &&
                          new Date(appointment.startTime) > new Date() && (
                            <RestoreButton appointmentId={appointment.id} />
                          )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
