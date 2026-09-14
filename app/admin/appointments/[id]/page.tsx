import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getAdminAppointmentAction } from "@/app/actions/appointments";
import AppointmentDetail from "@/components/appointments/AppointmentDetail";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Appointment Detail",
  description: "View an appointment's customer, service, schedule, and notes.",
};

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const appointmentId = Number(id);

  if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
    notFound();
  }

  const appointment = await getAdminAppointmentAction(appointmentId);
  if (!appointment) notFound();

  return <AppointmentDetail appointment={appointment} />;
}