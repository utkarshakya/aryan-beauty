import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import BookingForm from "@/app/components/BookingForm";
import Container from "@/app/components/ui/Container";
import PageHeader from "@/app/components/PageHeader";
import EmptyServices from "@/app/components/EmptyServices";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description:
    "Book your appointment at Aryan Beauty online — no account needed, just your name and phone number.",
};

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ serviceId?: string }>;
}) {
  const services = await prisma.service.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const { serviceId } = await searchParams;
  const preselectedServiceId = serviceId ? Number(serviceId) : undefined;

  return (
    <Container size="narrow" className="py-16 sm:py-20">
      <PageHeader
        title="Book an Appointment"
        subtitle="No account needed — just your name and phone number."
      />
      {services.length === 0 ? (
        <EmptyServices />
      ) : (
        <BookingForm
          services={services}
          preselectedServiceId={preselectedServiceId}
        />
      )}
    </Container>
  );
}

