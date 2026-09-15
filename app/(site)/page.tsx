import { prisma } from "@/lib/prisma";
import Hero from "@/app/components/Hero";
import ServicesPreview from "@/app/components/ServicesPreview";

export const dynamic = "force-dynamic";

export default async function Home() {
  let services: Awaited<ReturnType<typeof prisma.service.findMany>> = [];
  try {
    services = await prisma.service.findMany({
      where: { active: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      take: 3,
    });
  } catch (error) {
    console.error("Error loading services on homepage:", error);
  }

  return (
    <>
      <Hero />
      <ServicesPreview services={services} />
    </>
  );
}

