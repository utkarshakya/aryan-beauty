import { ButtonLink } from "./ui/Button";
import type { Service } from "@prisma/client";

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="flex flex-col rounded-xl border border-border bg-background p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {service.category}
      </p>
      <h3 className="mt-1 text-base font-semibold text-foreground sm:text-lg">
        {service.name}
      </h3>
      <p className="mt-2 flex-1 text-xs leading-relaxed text-muted line-clamp-3 sm:text-sm">
        {service.description}
      </p>
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-base font-semibold text-primary sm:text-lg">
          ₹{Math.round(service.price)}
        </span>
        <span className="text-sm text-muted">{service.durationMin} min</span>
      </div>
      <ButtonLink href={`/appointments?serviceId=${service.id}`} className="mt-5 w-full">
        Book Now
      </ButtonLink>
    </article>
  );
}
