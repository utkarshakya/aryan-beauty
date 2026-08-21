import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
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

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await auth.protect();
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Appointments</h1>
      <AppointmentsList
        appointments={appointments}
        currentStatus={statusParam}
      />
    </div>
  );
}