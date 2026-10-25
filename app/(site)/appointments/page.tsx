import type { Metadata } from "next";
import { getAppUserId, requireActiveUser } from "@/lib/auth";
import { getBusinessSettingsForDisplay } from "@/lib/db/business";
import { getActiveServices } from "@/lib/db/services";
import {
  getRecentHistoryForUser,
  getUpcomingAppointmentsForUser,
} from "@/lib/db/appointments";
import Container from "@/components/ui/Container";
import { PageHeader, SectionHeading } from "@/components/ui";
import BookAppointmentSection from "@/components/appointments/BookAppointmentSection";
import AppointmentGroup from "@/components/appointments/AppointmentGroup";
import EmptyServices from "@/components/services/EmptyServices";

const WEEKDAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatHoursDays(closedWeekdays: number[]): string {
  const openDays = [0, 1, 2, 3, 4, 5, 6].filter(d => !closedWeekdays.includes(d));
  if (openDays.length === 7) return "Monday – Sunday";
  if (openDays.length === 0) return "Currently closed";
  if (openDays.length === 1) return WEEKDAY_LABELS[openDays[0]];
  return `${WEEKDAY_LABELS[openDays[0]]} – ${WEEKDAY_LABELS[openDays[openDays.length - 1]]}`;
}

function formatHoursTime(openingHours: Record<string, { open: string; close: string }>): string {
  const hours = Object.values(openingHours);
  if (hours.length === 0) return "";
  const first = hours[0];
  return `${formatTime(first.open)} – ${formatTime(first.close)}`;
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour}:00 ${period}` : `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Appointments",
  description: "View and manage your appointments at Unknown Beauty.",
};

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ serviceId?: string }>;
}) {
  const { serviceId } = await searchParams;
  const requestedServiceId = Number(serviceId);
  const clerkUserId = await requireActiveUser();
  // `requireActiveUser()` already redirected when the row is missing, so this
  // only guards the impossible: id -1 matches no customer, so both lists come
  // back empty rather than erroring.
  const appUserId = (await getAppUserId(clerkUserId)) ?? -1;

  const [services, business, upcoming, history] = await Promise.all([
    getActiveServices(),
    getBusinessSettingsForDisplay(),
    getUpcomingAppointmentsForUser(appUserId),
    getRecentHistoryForUser(appUserId),
  ]);

  // Only honour a `?serviceId=` that names an active service. Number("abc") is
  // NaN, which is truthy — without this the wizard would open on a service that
  // does not exist.
  const preselectedServiceId = services.some(
    (service) => service.id === requestedServiceId,
  )
    ? requestedServiceId
    : undefined;

  return (
    <Container size="narrow" className="py-10 sm:py-16">
      <PageHeader
        title="Appointments"
        subtitle="Track upcoming visits and review your booking history."
        align="center"
      />

      <div className="space-y-7 sm:space-y-10">
        <section aria-labelledby="book-new">
          <SectionHeading id="book-new" title="Book new appointment" />
          {services.length === 0 ? (
            <EmptyServices
              phoneDisplay={business.phoneDisplay}
              phoneHref={business.phoneHref}
            />
          ) : (
            <BookAppointmentSection
              services={services}
              preselectedServiceId={preselectedServiceId}
              hoursDays={formatHoursDays(business.closedWeekdays)}
              hoursTime={formatHoursTime(business.openingHours)}
              timeZone={business.timeZone}
            />
          )}
        </section>

        <AppointmentGroup
          title="Upcoming"
          emptyMessage="No upcoming appointments. Choose a service above to book your first visit."
          appointments={upcoming}
        />
        {history.length > 0 && (
          <AppointmentGroup
            title="Recent history"
            emptyMessage="No past appointments."
            appointments={history}
          />
        )}
      </div>
    </Container>
  );
}
