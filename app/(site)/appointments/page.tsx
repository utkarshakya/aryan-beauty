import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Container from "@/app/components/ui/Container";
import PageHeader from "@/app/components/PageHeader";
import CancelAppointmentButton from "./CancelAppointmentButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Appointments",
  description: "View and manage your appointments at Unknown Beauty.",
};

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

const formatTime = (date: Date) =>
  date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });

const statusClasses: Record<string, string> = {
  pending: "bg-warning-soft text-warning",
  confirmed: "bg-success-soft text-success",
  cancelled: "bg-neutral-soft text-neutral",
};

export default async function AppointmentsPage() {
  const { userId } = await auth();
  if (!userId) {
    await auth.protect();
  }

  const customer = await prisma.customer.findUnique({
    where: { clerkUserId: userId! },
    include: {
      appointments: {
        include: { service: true },
        orderBy: { startTime: "desc" },
      },
    },
  });

  const now = new Date();
  const upcoming = customer?.appointments.filter(
    (appointment) => appointment.startTime >= now && appointment.status !== "cancelled",
  ) ?? [];
  const history = customer?.appointments.filter(
    (appointment) => !upcoming.some(({ id }) => id === appointment.id),
  ) ?? [];

  return (
    <Container size="narrow" className="py-10 sm:py-16">
      <PageHeader
        title="My Appointments"
        subtitle="Keep track of your upcoming visits and booking history."
      />

      {!customer || customer.appointments.length === 0 ? (
        <div className="rounded-2xl border border-border bg-background p-5 text-center shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-foreground">No appointments yet</h2>
          <p className="mt-2 text-muted">Your booked appointments will appear here.</p>
          <div className="mt-6">
            <Link
              href="/book"
              className="inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Book an appointment
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-7 sm:space-y-10">
          <AppointmentGroup title="Upcoming" appointments={upcoming} />
          {history.length > 0 && <AppointmentGroup title="History" appointments={history} />}
        </div>
      )}
    </Container>
  );
}

function AppointmentGroup({
  title,
  appointments,
}: {
  title: string;
  appointments: Array<{
    id: number;
    startTime: Date;
    endTime: Date;
    status: string;
    service: { name: string; durationMin: number; price: number };
  }>;
}) {
  return (
    <section aria-labelledby={`${title.toLowerCase()}-appointments`}>
      <h2 id={`${title.toLowerCase()}-appointments`} className="mb-3 text-lg font-semibold text-foreground sm:mb-4 sm:text-xl">
        {title}
      </h2>
      {appointments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted sm:p-6 sm:text-sm">
          No upcoming appointments.
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <article
              key={appointment.id}
              className="rounded-xl border border-border bg-background p-3 shadow-sm sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">{appointment.service.name}</h3>
                  <p className="mt-1 text-sm text-muted">
                    {appointment.service.durationMin} minutes · ₹{Math.round(appointment.service.price)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[appointment.status] ?? "bg-neutral-soft text-neutral"}`}
                >
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>

              <div className="mt-4 border-t border-border pt-3 text-sm text-foreground">
                <p>{formatDate(appointment.startTime)}</p>
                <p className="mt-1 text-muted">
                  {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}
                </p>
              </div>

              {appointment.status !== "cancelled" && appointment.startTime > new Date() && (
                <div className="mt-4 border-t border-border pt-3">
                  <CancelAppointmentButton appointmentId={appointment.id} />
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
