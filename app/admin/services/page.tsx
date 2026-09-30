import type { Metadata } from "next";
import { requireOwnerAdmin } from "@/lib/auth";
import { getServicesAction } from "@/app/actions/services";
import { EmptyState, PageHeader, SectionHeading, cardClassName } from "@/components/ui";
import ServiceEditor from "@/components/services/ServiceEditor";
import ServiceForm from "@/components/services/ServiceForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage Services",
  description: "Manage the parlour's services and prices.",
};

export default async function ManageServicesPage() {
  await requireOwnerAdmin();
  const services = await getServicesAction();

  return (
    <div className="container mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-8">
      <PageHeader
        backHref="/admin"
        backLabel="Back to dashboard"
        title="Manage services"
        subtitle="Keep your public service menu and prices up to date."
      />

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
        <section aria-labelledby="services-heading">
          <SectionHeading id="services-heading" title="Current services" />
          {services.length === 0 ? (
            <EmptyState title="No services yet." />
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <ServiceEditor key={service.id} service={service} />
              ))}
            </div>
          )}
        </section>

        <section className={cardClassName("h-fit p-4 sm:p-6")} aria-labelledby="add-service-heading">
          <SectionHeading
            id="add-service-heading"
            title="Add a service"
            description="New services are visible to customers immediately."
          />
          <ServiceForm />
        </section>
      </div>
    </div>
  );
}
