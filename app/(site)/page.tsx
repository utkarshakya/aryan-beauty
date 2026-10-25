import { getBusinessSettingsForDisplay } from "@/lib/db/business";
import { getActiveServices } from "@/lib/db/services";
import Hero from "@/components/home/Hero";
import ServicesPreview from "@/components/home/ServicesPreview";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [services, business] = await Promise.all([
    getActiveServices(3),
    getBusinessSettingsForDisplay(),
  ]);

  return (
    <>
      <Hero business={business} />
      <ServicesPreview services={services} />
    </>
  );
}
