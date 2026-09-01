"use client";

import { useState } from "react";
import type { Service } from "@prisma/client";
import { toggleService, updateService } from "./actions";

export default function ServiceEditor({ service }: { service: Service }) {
  const [editing, setEditing] = useState(false);

  return (
    <article className="rounded-xl border border-border bg-background p-4 shadow-sm sm:p-5">
      {!editing ? (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2"><h3 className="font-semibold text-foreground">{service.name}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${service.active ? "bg-success-soft text-success" : "bg-neutral-soft text-neutral"}`}>{service.active ? "Active" : "Inactive"}</span></div>
            <p className="mt-1 text-sm text-muted">{service.category} · ₹{Math.round(service.price)} · {service.durationMin} minutes</p>
            {service.description && <p className="mt-3 text-sm text-foreground">{service.description}</p>}
          </div>
          <button type="button" onClick={() => setEditing(true)} className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-neutral-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">Edit</button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between gap-3"><h3 className="font-semibold text-foreground">Edit service</h3><button type="button" onClick={() => setEditing(false)} className="text-sm font-medium text-muted underline hover:text-foreground">Cancel</button></div>
          <form action={updateService.bind(null, service.id)} className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-medium text-foreground">Name<input name="name" defaultValue={service.name} required className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 font-normal text-foreground" /></label>
            <label className="text-sm font-medium text-foreground">Category<input name="category" defaultValue={service.category} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 font-normal text-foreground" /></label>
            <label className="text-sm font-medium text-foreground">Price<input name="price" type="number" min="0" step="1" defaultValue={service.price} required className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 font-normal text-foreground" /></label>
            <label className="text-sm font-medium text-foreground">Duration (minutes)<input name="durationMin" type="number" min="1" step="1" defaultValue={service.durationMin} required className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 font-normal text-foreground" /></label>
            <label className="text-sm font-medium text-foreground sm:col-span-2">Description<textarea name="description" defaultValue={service.description} rows={2} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 font-normal text-foreground" /></label>
            <button type="submit" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-strong sm:col-span-2 sm:justify-self-start">Save changes</button>
          </form>
          <form action={toggleService.bind(null, service.id, !service.active)} className="mt-3 border-t border-border pt-3"><button type="submit" className="text-sm font-medium text-muted underline hover:text-foreground">{service.active ? "Hide service from customers" : "Make service available"}</button></form>
        </>
      )}
    </article>
  );
}
