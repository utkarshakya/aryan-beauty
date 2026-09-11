import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireActiveUser } from "@/lib/auth";
import { getBusinessSettingsForDisplay } from "@/lib/db/business";
import Container from "@/components/ui/Container";
import PageHeader from "@/app/components/PageHeader";
import BookAppointmentSection from "@/components/appointments/BookAppointmentSection";
import AppointmentGroup from "@/components/appointments/AppointmentGroup";
import EmptyServices from "@/app/components/EmptyServices";

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

const MAX_HISTORY = 10;

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ serviceId?: string }>;
}) {
  const { serviceId } = await searchParams;
  const preselectedServiceId = serviceId ? Number(serviceId) : undefined;
  const userId = await requireActiveUser();

  const appUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });
  const [customer, services, business] = await Promise.all([
    prisma.customer.findUnique({
      where: { userId: appUser?.id ?? -1 },
      include: {
        appointments: {
          orderBy: { startTime: "desc" },
        },
      },
    }),
    prisma.service.findMany({
      where: { active: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    getBusinessSettingsForDisplay(),
  ]);

  const now = new Date();
  const upcoming =
    customer?.appointments.filter(
      (a) => a.startTime >= now && a.status !== "cancelled",
    ) ?? [];
  const history =
    customer?.appointments
      .filter((a) => !upcoming.some((u) => u.id === a.id))
      .slice(0, MAX_HISTORY) ?? [];

  return (
    <Container size="narrow" className="py-10 sm:py-16">
      <PageHeader
        title="Appointments"
        subtitle="Track upcoming visits and review your booking history."
      />

      <div className="space-y-7 sm:space-y-10">
        <section aria-labelledby="book-new">
          <h2
            id="book-new"
            className="mb-3 text-lg font-semibold text-foreground sm:mb-4 sm:text-xl"
          >
            Book new appointment
          </h2>
          {services.length === 0 ? (
            <EmptyServices
              phoneDisplay={business.phoneDisplay}
              phoneHref={business.phoneHref}
            />
          ) : (
            <BookAppointmentSection
              services={services}
              preselectedServiceId={preselectedServiceId}
              phoneDisplay={business.phoneDisplay}
              phoneHref={business.phoneHref}
              hoursDays={formatHoursDays(business.closedWeekdays)}
              hoursTime={formatHoursTime(business.openingHours)}
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
