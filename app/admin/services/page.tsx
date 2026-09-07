import type { Metadata } from "next";
import Link from "next/link";
import { requireOwnerAdmin } from "@/lib/auth";
import { getServicesAction, ServiceEditor, ServiceForm } from "@/features/services-catalog";

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
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin" className="text-sm font-medium text-primary hover:text-primary-strong">
            ← Back to appointments
          </Link>
          <h1 className="mt-2 text-xl font-bold text-foreground sm:mt-3 sm:text-3xl">Manage services</h1>
          <p className="mt-1 text-sm text-muted sm:mt-2 sm:text-base">Keep your public service menu and prices up to date.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
        <section className="space-y-4" aria-labelledby="services-heading">
          <h2 id="services-heading" className="text-lg font-semibold text-foreground">Current services</h2>
          {services.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-muted">No services yet.</p>
          ) : (
            services.map((service) => <ServiceEditor key={service.id} service={service} />)
          )}
        </section>

        <section className="h-fit rounded-xl border border-border bg-background p-4 shadow-sm sm:p-6" aria-labelledby="add-service-heading">
          <h2 id="add-service-heading" className="text-lg font-semibold text-foreground">Add a service</h2>
          <p className="mt-1 text-sm text-muted">New services are visible to customers immediately.</p>
          <ServiceForm />
        </section>
      </div>
    </div>
  );
}
