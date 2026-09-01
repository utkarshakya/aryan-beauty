import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Overview of appointments and services at Unknown Beauty.",
};

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

export default async function AdminDashboardPage() {
  await requireAdmin();
  const today = startOfToday();

  const [todayAppointments, pendingAppointments, confirmedAppointments, activeServices, upcomingAppointments] = await Promise.all([
    prisma.appointment.count({ where: { startTime: { gte: today }, status: { not: "cancelled" } } }),
    prisma.appointment.count({ where: { status: "pending", startTime: { gte: today } } }),
    prisma.appointment.count({ where: { status: "confirmed", startTime: { gte: today } } }),
    prisma.service.count({ where: { active: true } }),
    prisma.appointment.findMany({
      where: { startTime: { gte: today }, status: { not: "cancelled" } },
      include: { customer: true, service: true },
      orderBy: { startTime: "asc" },
      take: 5,
    }),
  ]);

  return (
    <div className="container mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-primary">Admin</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">A quick view of today&apos;s business.</p>
        </div>
      </div>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-4 sm:gap-4" aria-label="Business summary">
        <SummaryCard label="Today" value={todayAppointments} detail="appointments" />
        <SummaryCard label="Pending" value={pendingAppointments} detail="need confirmation" />
        <SummaryCard label="Confirmed" value={confirmedAppointments} detail="for today" />
        <SummaryCard label="Services" value={activeServices} detail="currently active" />
      </section>

      <section className="mt-6 rounded-xl border border-border bg-background p-4 shadow-sm sm:mt-8 sm:p-6" aria-labelledby="upcoming-heading">
        <div className="flex items-center justify-between gap-3">
          <h2 id="upcoming-heading" className="text-lg font-semibold text-foreground">Upcoming today</h2>
        </div>
        {upcomingAppointments.length === 0 ? (
          <p className="mt-4 rounded-lg bg-muted-soft p-4 text-sm text-muted">No appointments scheduled for today.</p>
        ) : (
          <div className="mt-4 divide-y divide-border">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{appointment.customer.name}</p>
                  <p className="truncate text-xs text-muted">{appointment.service.name}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium text-foreground">{appointment.startTime.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}</p>
                  <p className="text-xs capitalize text-muted">{appointment.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3 shadow-sm sm:p-5">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">{value}</p>
      <p className="mt-1 text-[11px] text-muted sm:text-xs">{detail}</p>
    </div>
  );
}
