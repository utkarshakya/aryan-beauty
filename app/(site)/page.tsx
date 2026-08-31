import { prisma } from "@/lib/prisma";
import Hero from "@/app/components/Hero";
import ServicesPreview from "@/app/components/ServicesPreview";

export const dynamic = "force-dynamic";

export default async function Home() {
  const services = await prisma.service.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    take: 3,
  });

  return (
    <>
      <Hero />
      <ServicesPreview services={services} />
    </>
  );
}

