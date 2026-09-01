import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireOwnerAdmin } from "@/lib/auth";
import { createService, toggleService, updateService } from "./actions";

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
            services.map((service) => (
              <article key={service.id} className="rounded-xl border border-border bg-background p-3 shadow-sm sm:p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{service.name}</h3>
                    <p className="mt-1 text-sm text-muted">{service.active ? "Visible to customers" : "Hidden from customers"}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${service.active ? "bg-success-soft text-success" : "bg-neutral-soft text-neutral"}`}>
                    {service.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <form action={updateService.bind(null, service.id)} className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm font-medium text-foreground">Name<input name="name" defaultValue={service.name} required className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 font-normal text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary" /></label>
                  <label className="text-sm font-medium text-foreground">Category<input name="category" defaultValue={service.category} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 font-normal text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary" /></label>
                  <label className="text-sm font-medium text-foreground">Price<input name="price" type="number" min="0" step="1" defaultValue={service.price} required className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 font-normal text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary" /></label>
                  <label className="text-sm font-medium text-foreground">Duration (minutes)<input name="durationMin" type="number" min="1" step="1" defaultValue={service.durationMin} required className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 font-normal text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary" /></label>
                  <label className="text-sm font-medium text-foreground sm:col-span-2">Description<textarea name="description" defaultValue={service.description} rows={2} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 font-normal text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary" /></label>
                  <button type="submit" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-strong sm:col-span-2 sm:justify-self-start">Save changes</button>
                </form>
                <form action={toggleService.bind(null, service.id, !service.active)} className="mt-3 border-t border-border pt-3">
                  <button type="submit" className="text-sm font-medium text-muted underline hover:text-foreground">{service.active ? "Hide service from customers" : "Make service available"}</button>
                </form>
              </article>
            ))
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
