import type { Metadata } from "next";
import { getBusinessSettingsForDisplay } from "@/lib/db/business";
import { getActiveServices } from "@/lib/db/services";
import ServicesFilter from "@/components/services/ServicesFilter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Browse hair, skin, nail and beauty services at Unknown Beauty with transparent prices and durations.",
};

export default async function ServicesPage() {
  const [services, business] = await Promise.all([
    getActiveServices(),
    getBusinessSettingsForDisplay(),
  ]);

  return (
    <ServicesFilter
      services={services}
      phoneDisplay={business?.phoneDisplay ?? "+91 98765 43210"}
      phoneHref={business?.phoneHref ?? "tel:+919876543210"}
    />
  );
}
