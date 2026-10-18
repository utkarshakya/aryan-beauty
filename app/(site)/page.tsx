import { prisma } from "@/lib/prisma";
import { getBusinessSettingsForDisplay } from "@/lib/db/business";
import Hero from "@/app/components/Hero";
import ServicesPreview from "@/app/components/ServicesPreview";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [services, business] = await Promise.all([
    prisma.service.findMany({
      where: { active: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      take: 3,
    }),
    getBusinessSettingsForDisplay(),
  ]);

  return (
    <>
      <Hero business={business} />
      <ServicesPreview services={services} />
    </>
  );
}

