import { prisma } from "@/lib/prisma";
import Navbar from "../components/Navbar";
import BookingForm from "../components/BookingForm";

export const dynamic = "force-dynamic";

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
    <>
      <Navbar />
      <main className="py-16 bg-white">
        <div className="max-w-xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">
            Book an Appointment
          </h1>
          <p className="text-center text-gray-600 mb-10">
            No account needed — just your name and phone number
          </p>
          <BookingForm
            services={services}
            preselectedServiceId={preselectedServiceId}
          />
        </div>
      </main>
    </>
  );
}