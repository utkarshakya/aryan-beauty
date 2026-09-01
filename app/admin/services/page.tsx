import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireOwnerAdmin } from "@/lib/auth";
import { createService } from "./actions";
import ServiceEditor from "./ServiceEditor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage Services",
  description: "Manage the parlour's services and prices.",
};

export default async function ManageServicesPage() {
  await requireOwnerAdmin();
  const services = await prisma.service.findMany({ orderBy: [{ active: "desc" }, { name: "asc" }] });

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
          <form action={createService} className="mt-5 space-y-4">
            <label className="block text-sm font-medium text-foreground">Name<input name="name" required className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 font-normal text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary" /></label>
            <label className="block text-sm font-medium text-foreground">Category<input name="category" defaultValue="Other" className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 font-normal text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary" /></label>
            <div className="grid grid-cols-2 gap-3"><label className="text-sm font-medium text-foreground">Price<input name="price" type="number" min="0" step="1" required className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 font-normal text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary" /></label><label className="text-sm font-medium text-foreground">Minutes<input name="durationMin" type="number" min="1" step="1" required className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 font-normal text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary" /></label></div>
            <label className="block text-sm font-medium text-foreground">Description<textarea name="description" rows={3} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 font-normal text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary" /></label>
            <button type="submit" className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-strong">Add service</button>
          </form>
        </section>
      </div>
    </div>
  );
}
