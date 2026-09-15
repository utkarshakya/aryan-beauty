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
  let services: Awaited<ReturnType<typeof prisma.service.findMany>> = [];
  let phoneDisplay = "+91 98765 43210";
  let phoneHref = "tel:+919876543210";

  try {
    const [fetchedServices, business] = await Promise.all([
      prisma.service.findMany({
        where: { active: true },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      }),
      getBusinessSettingsForDisplay(),
    ]);
    services = fetchedServices;
    if (business) {
      phoneDisplay = business.phoneDisplay;
      phoneHref = business.phoneHref;
    }
  } catch (error) {
    console.error("Error fetching services page data from database:", error);
  }

  return (
    <ServicesFilter
      services={services}
      phoneDisplay={phoneDisplay}
      phoneHref={phoneHref}
    />
  );
}
