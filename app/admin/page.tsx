import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import type { AppointmentStatus } from "@prisma/client";
import {
  Button,
  EmptyState,
  Input,
  PageHeader,
  SummaryCard,
  cardClassName,
  filterPillClasses,
} from "@/components/ui";
import Container from "@/components/ui/Container";
import AdminAppointmentsList from "@/components/appointments/AdminAppointmentsList";
import AdminFilters from "@/components/admin/AdminFilters";
import AdminDateFilter from "@/components/admin/AdminDateFilter";
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

const STATUS_FILTER_MAP: Record<StatusFilter, AppointmentStatus[] | undefined> =
  {
    default: ["pending"],
    all: undefined,
    pending: ["pending"],
    confirmed: ["confirmed"],
    cancelled: ["cancelled"],
    completed: undefined,
  };

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

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
  const statusHref = (value: StatusFilter) => {
    const p = new URLSearchParams();
    p.set("status", value);
    if (searchParam) p.set("search", searchParam);
    if (dateFilter) p.set("date", dateFilter);
    return `/admin?${p.toString()}`;
  };
  const activeFilterCount =
    (hasExplicitStatus ? 1 : 0) +
    (dateMode === "today" ? 0 : 1) +
    (searchParam ? 1 : 0);

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
      completed: statusParam === "completed",
    }),
    getAdminAppointmentCounts(today, now),
    getUpcomingAppointments(today, now),
  ]);

  return (
    <Container className="py-4 sm:py-8">
      <PageHeader
        eyebrow="Admin"
        title="Today's workspace"
        subtitle="A quick view of the parlour and its appointments."
      />
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
        className={cardClassName("mt-6 p-4 sm:mt-8 sm:p-6")}
        aria-labelledby="upcoming-heading"
      >
        <h2
          id="upcoming-heading"
          className="text-title font-semibold text-foreground"
        >
          Upcoming today
        </h2>
        {upcomingAppointments.length === 0 ? (
          <EmptyState
            className="mt-4"
            title="No appointments scheduled for today."
            body="Your upcoming appointments will appear here."
          />
        ) : (
          <div className="mt-4 divide-y divide-border">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-body font-medium text-foreground">
                    {appointment.customer.name}
                  </p>
                  <p className="truncate text-meta text-muted">
                    {appointment.serviceName}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-body font-medium text-foreground">
                    {appointment.startTime ? new Date(appointment.startTime).toLocaleTimeString("en-IN", {
                      hour: "numeric",
                      minute: "2-digit",
                    }) : ""}
                  </p>
                  <p className="text-meta capitalize text-muted">
                    {appointment.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <h2 className="mb-5 mt-8 text-section font-bold text-foreground sm:mt-10 sm:text-stat">
        Appointments
      </h2>

      <AdminFilters activeCount={activeFilterCount}>
        <div className="space-y-3 sm:space-y-4">
          <nav
            className="flex flex-wrap gap-2"
            aria-label="Appointment status filters"
          >
            {STATUS_TABS.map((tab) => {
              const active =
                statusParam === tab.value ||
                (!hasExplicitStatus && tab.value === "pending");
              return (
                <Link
                  key={tab.value}
                  href={statusHref(tab.value)}
                  aria-current={active ? "page" : undefined}
                  className={filterPillClasses(active)}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          <form
            action="/admin"
            method="GET"
            className="flex flex-wrap items-end gap-3"
          >
            <div className="w-full min-w-0 flex-1 sm:max-w-md">
              <label
                htmlFor="appointment-search"
                className="mb-1 block text-body font-medium text-foreground"
              >
                Search
              </label>
              <Input
                id="appointment-search"
                name="search"
                defaultValue={searchParam}
                placeholder="Customer name or phone"
                autoComplete="off"
              />
            </div>
            {hasExplicitStatus ? (
              <input type="hidden" name="status" value={statusParam} />
            ) : null}
            {dateFilter && <input type="hidden" name="date" value={dateFilter} />}
            <Button type="submit">Search</Button>
          </form>

          <AdminDateFilter
            dateMode={dateMode}
            todayHref={makeAdminHref()}
            allDatesHref={makeAdminHref("all")}
            customDate={dateFilter && dateFilter !== "all" ? dateFilter : undefined}
            todayInputValue={todayInputValue}
            status={hasExplicitStatus ? statusParam : undefined}
            search={searchParam || undefined}
          />
        </div>
      </AdminFilters>

      <div className="mt-4">
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
    </Container>
  );
}
