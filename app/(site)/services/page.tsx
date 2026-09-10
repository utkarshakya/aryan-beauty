import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getBusinessSettingsForDisplay } from "@/lib/db/business";
import ServicesFilter from "@/app/components/ServicesFilter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Browse hair, skin, nail and beauty services at Unknown Beauty with transparent prices and durations.",
};

export default async function ServicesPage() {
  const [services, business] = await Promise.all([
    prisma.service.findMany({
      where: { active: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
    getBusinessSettingsForDisplay(),
  ]);

  return (
    <ServicesFilter
      services={services}
      phoneDisplay={business.phoneDisplay}
      phoneHref={business.phoneHref}
    />
  );
}
