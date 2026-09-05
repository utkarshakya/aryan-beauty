import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import AdminAppointmentsList from "@/features/appointments/components/AdminAppointmentsList";
import {
  getAdminAppointments,
  getAdminAppointmentCounts,
  getUpcomingAppointments,
} from "@/features/appointments/actions/admin";

type StatusFilter = "default" | "all" | "pending" | "confirmed" | "cancelled";

const STATUS_FILTER_MAP: Record<StatusFilter, string[] | undefined> = {
  default: ["pending"],
  all: undefined,
  pending: ["pending"],
  confirmed: ["confirmed"],
  cancelled: ["cancelled"],
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const requestedStatus = params.status;
  const statusParam: StatusFilter =
    requestedStatus === "all" ||
    requestedStatus === "pending" ||
    requestedStatus === "confirmed" ||
    requestedStatus === "cancelled"
      ? requestedStatus
      : "pending";
  const statusFilter = STATUS_FILTER_MAP[statusParam];
  const today = startOfToday();

  const [
    appointments,
    {
      todayAppointments,
      pendingAppointments,
      confirmedAppointments,
      activeServices,
    },
    upcomingAppointments,
  ] = await Promise.all([
    getAdminAppointments(statusFilter, today),
    getAdminAppointmentCounts(today),
    getUpcomingAppointments(today),
  ]);

  return (
    <div className="container mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            Admin
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Today&apos;s workspace
          </h1>
          <p className="mt-1 text-sm text-muted">
            A quick view of the parlour and its appointments.
          </p>
        </div>
        <Link
          href="/admin/services"
          className="inline-flex items-center rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Manage services
        </Link>
      </div>
      <section
        className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-4 sm:gap-4"
        aria-label="Business summary"
      >
        <SummaryCard
          label="Today"
          value={todayAppointments}
          detail="appointments"
        />
        <SummaryCard
          label="Pending"
          value={pendingAppointments}
          detail="need confirmation"
        />
        <SummaryCard
          label="Confirmed"
          value={confirmedAppointments}
          detail="for today"
        />
        <SummaryCard
          label="Services"
          value={activeServices}
          detail="currently active"
        />
      </section>
      <section
        className="mt-6 rounded-xl border border-border bg-background p-4 shadow-sm sm:mt-8 sm:p-6"
        aria-labelledby="upcoming-heading"
      >
        <h2
          id="upcoming-heading"
          className="text-lg font-semibold text-foreground"
        >
          Upcoming today
        </h2>
        {upcomingAppointments.length === 0 ? (
          <p className="mt-4 rounded-lg bg-muted-soft p-4 text-sm text-muted">
            No appointments scheduled for today.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-border">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {appointment.customer.name}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {appointment.service.name}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium text-foreground">
                    {appointment.startTime.toLocaleTimeString("en-IN", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-xs capitalize text-muted">
                    {appointment.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <h2 className="mb-5 mt-8 text-xl font-bold text-foreground sm:mt-10 sm:text-2xl">
        Appointments
      </h2>
      <AdminAppointmentsList
        appointments={appointments}
        currentStatus={statusParam}
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3 shadow-sm sm:p-5">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-muted sm:text-xs">{detail}</p>
    </div>
  );
}
