import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Container from "@/components/ui/Container";
import PageHeader from "@/app/components/PageHeader";
import BookAppointmentSection from "@/features/appointments/components/BookAppointmentSection";
import AppointmentGroup from "@/features/appointments/components/AppointmentGroup";
import EmptyServices from "@/app/components/EmptyServices";

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
  const { userId } = await auth();
  if (!userId) {
    await auth.protect();
  }

  const appUser = await prisma.user.findUnique({
    where: { clerkUserId: userId! },
  });
  if (!appUser) {
    await auth.protect();
  }

  const [customer, services] = await Promise.all([
    prisma.customer.findUnique({
      where: { userId: appUser!.id },
      include: {
        appointments: {
          include: { service: true },
          orderBy: { startTime: "desc" },
        },
      },
    }),
    prisma.service.findMany({
      where: { active: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
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
            <EmptyServices />
          ) : (
            <BookAppointmentSection
              services={services}
              preselectedServiceId={preselectedServiceId}
            />
          )}
        </section>

        {!customer || customer.appointments.length === 0 ? null : (
          <>
            <AppointmentGroup
              title="Upcoming"
              emptyMessage="No upcoming appointments."
              appointments={upcoming}
            />
            {history.length > 0 && (
              <AppointmentGroup
                title="Recent history"
                emptyMessage="No past appointments."
                appointments={history}
              />
            )}
          </>
        )}
      </div>
    </Container>
  );
}
