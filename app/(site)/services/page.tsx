import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ServicesFilter from "@/app/components/ServicesFilter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Browse hair, skin, nail and beauty services at Aryan Beauty with transparent prices and durations.",
};

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return <ServicesFilter services={services} />;
}

