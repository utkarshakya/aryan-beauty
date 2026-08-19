import { prisma } from "@/lib/prisma";
import Navbar from "../components/Navbar";
import ServicesFilter from "../components/ServicesFilter";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return (
    <>
      <Navbar />
      <ServicesFilter services={services} />
    </>
  );
}
