import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import AppointmentsList from "@/app/components/AppointmentsList";

type StatusFilter = "default" | "all" | "pending" | "confirmed" | "cancelled";

const STATUS_FILTER_MAP: Record<StatusFilter, string[] | undefined> = {
  default: ["pending", "confirmed"],
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
      : "default";
  const statusFilter = STATUS_FILTER_MAP[statusParam];

  const appointments = await prisma.appointment.findMany({
    where: {
      startTime: { gte: startOfToday() },
      ...(statusFilter ? { status: { in: statusFilter } } : {}),
    },
    include: {
      customer: true,
      service: true,
    },
    orderBy: { startTime: "asc" },
  });

  return (
    <div className="container mx-auto px-3 py-5 sm:px-6 sm:py-8">
      <h1 className="mb-5 text-2xl font-bold text-foreground sm:mb-6 sm:text-3xl">
        Appointments
      </h1>
      <AppointmentsList
        appointments={appointments}
        currentStatus={statusParam}
      />
    </div>
  );
}
