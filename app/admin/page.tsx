import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import AdminAppointmentsList from "@/components/appointments/AdminAppointmentsList";
import {
  getAdminAppointments,
  getAdminAppointmentCounts,
  getUpcomingAppointments,
} from "@/app/actions/appointments";

type StatusFilter =
  | "default"
  | "all"
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

const STATUS_FILTER_MAP: Record<StatusFilter, string[] | undefined> = {
  default: ["pending"],
  all: undefined,
  pending: ["pending"],
  confirmed: ["confirmed"],
  cancelled: ["cancelled"],
  completed: ["completed"],
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; date?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const requestedStatus = params.status;
  const searchParam = params.search?.trim() ?? "";
  const statusParam: StatusFilter =
    requestedStatus === "all" ||
    requestedStatus === "pending" ||
    requestedStatus === "confirmed" ||
    requestedStatus === "cancelled" ||
    requestedStatus === "completed"
      ? requestedStatus
      : "pending";
  const statusFilter = STATUS_FILTER_MAP[statusParam];
  const today = startOfToday();
  const now = new Date();

  const dateRaw = params.date;
  const validDate =
    typeof dateRaw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateRaw)
      ? dateRaw
      : undefined;
  const dateMode: "today" | "date" | "all" =
    dateRaw === "all" ? "all" : validDate ? "date" : "today";
  const dateFilter =
    dateMode === "all" ? "all" : dateMode === "date" ? validDate! : undefined;
  const from =
    dateMode === "today"
      ? today
      : dateMode === "date"
        ? new Date(`${validDate}T00:00:00`)
        : undefined;
  const to =
    dateMode === "date"
      ? (() => {
          const end = new Date(from!.getTime());
          end.setDate(end.getDate() + 1);
          return end;
        })()
      : undefined;
  const todayInputValue = new Date().toLocaleDateString("en-CA");
  const scopeLabel =
    dateMode === "date"
      ? `for ${new Date(`${validDate}T00:00:00`).toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
        })}`
      : dateMode === "all"
        ? "for all dates"
        : "for today";
  const statusWord = statusParam === "all" ? null : statusParam;
  const statusText = statusWord
    ? statusWord.charAt(0).toUpperCase() + statusWord.slice(1)
    : "appointments";
  const hasExplicitStatus =
    requestedStatus === "all" ||
    requestedStatus === "pending" ||
    requestedStatus === "confirmed" ||
    requestedStatus === "cancelled" ||
    requestedStatus === "completed";
  const makeAdminHref = (date?: string) => {
    const p = new URLSearchParams();
    if (hasExplicitStatus) p.set("status", statusParam);
    if (searchParam) p.set("search", searchParam);
    if (date) p.set("date", date);
    const qs = p.toString();
    return qs ? `/admin?${qs}` : "/admin";
  };

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
    getAdminAppointments(statusFilter, now, {
      search: searchParam || undefined,
      from,
      to,
      windowCompleted: dateMode === "date",
    }),
    getAdminAppointmentCounts(today, now),
    getUpcomingAppointments(today, now),
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
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/services"
            className="inline-flex items-center rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Manage services
          </Link>
          <Link
            href="/admin/settings"
            className="inline-flex items-center rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Business settings
          </Link>
        </div>
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
                    {appointment.serviceName}
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
      <form
        action="/admin"
        method="GET"
        className="mb-4 flex flex-wrap items-end gap-3"
      >
        <div className="min-w-56 flex-1 sm:max-w-md">
          <label
            htmlFor="appointment-search"
            className="mb-1 block text-sm font-medium text-foreground"
          >
            Search
          </label>
          <input
            id="appointment-search"
            name="search"
            defaultValue={searchParam}
            placeholder="Customer name or phone"
            autoComplete="off"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        {hasExplicitStatus ? (
          <input type="hidden" name="status" value={statusParam} />
        ) : null}
        {dateFilter && <input type="hidden" name="date" value={dateFilter} />}
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-5"
        >
          Search
        </button>
      </form>
      <div className="mb-4 flex flex-wrap items-end gap-2">
        <Link
          href={makeAdminHref()}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
            dateMode === "today"
              ? "border-primary/30 bg-primary-soft text-primary-strong"
              : "border-transparent text-muted hover:bg-neutral-soft"
          }`}
        >
          Today
        </Link>
        <Link
          href={makeAdminHref("all")}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
            dateMode === "all"
              ? "border-primary/30 bg-primary-soft text-primary-strong"
              : "border-transparent text-muted hover:bg-neutral-soft"
          }`}
        >
          All dates
        </Link>
        <form
          action="/admin"
          method="GET"
          className="flex items-end gap-2"
        >
          <div>
            <label
              htmlFor="appointment-date"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Date
            </label>
            <input
              id="appointment-date"
              name="date"
              type="date"
              defaultValue={dateFilter && dateFilter !== "all" ? dateFilter : todayInputValue}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
          {hasExplicitStatus && (
            <input type="hidden" name="status" value={statusParam} />
          )}
          {searchParam && (
            <input type="hidden" name="search" value={searchParam} />
          )}
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-4 sm:py-2 sm:text-sm"
          >
            View date
          </button>
        </form>
      </div>
      <AdminAppointmentsList
        appointments={appointments}
        currentStatus={statusParam}
        searchTerm={searchParam}
        dateFilter={dateFilter}
        scopeLabel={scopeLabel}
        showScope={dateMode !== "today"}
        emptyMessage={
          statusParam === "all"
            ? `No appointments ${scopeLabel}.`
            : `No ${statusText.toLowerCase()} appointments ${scopeLabel}.`
        }
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
