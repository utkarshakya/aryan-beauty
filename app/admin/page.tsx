import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import {
  Button,
  ButtonLink,
  Input,
  PageHeader,
  SummaryCard,
  cardClassName,
  filterPillClasses,
} from "@/components/ui";
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
      <PageHeader
        eyebrow="Admin"
        title="Today's workspace"
        subtitle="A quick view of the parlour and its appointments."
        actions={
          <>
            <ButtonLink href="/admin/services" variant="primary">
              Manage services
            </ButtonLink>
            <ButtonLink href="/admin/settings" variant="outline">
              Business settings
            </ButtonLink>
            <ButtonLink href="/admin/staff" variant="outline">
              Manage staff
            </ButtonLink>
          </>
        }
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
                    {appointment.startTime ? new Date(appointment.startTime).toLocaleTimeString("en-IN", {
                      hour: "numeric",
                      minute: "2-digit",
                    }) : ""}
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
      <div className="mb-4 flex flex-wrap items-end gap-2">
        <Link
          href={makeAdminHref()}
          aria-current={dateMode === "today" ? "page" : undefined}
          className={filterPillClasses(dateMode === "today")}
        >
          Today
        </Link>
        <Link
          href={makeAdminHref("all")}
          aria-current={dateMode === "all" ? "page" : undefined}
          className={filterPillClasses(dateMode === "all")}
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
          <Input
            id="appointment-date"
            name="date"
            type="date"
            defaultValue={dateFilter && dateFilter !== "all" ? dateFilter : todayInputValue}
            className="sm:w-auto"
          />
          </div>
          {hasExplicitStatus && (
            <input type="hidden" name="status" value={statusParam} />
          )}
          {searchParam && (
            <input type="hidden" name="search" value={searchParam} />
          )}
          <Button type="submit" variant="outline">
            View date
          </Button>
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
