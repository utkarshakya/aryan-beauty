import { ButtonLink } from "./ui/Button";
import type { Service } from "@prisma/client";

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="flex flex-col rounded-xl border border-border bg-background p-6 shadow-sm transition-shadow hover:shadow-md">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {service.category}
      </p>
      <h3 className="mt-1 text-lg font-semibold text-foreground">
        {service.name}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted line-clamp-3">
        {service.description}
      </p>
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-lg font-semibold text-primary">
          ₹{Math.round(service.price)}
        </span>
        <span className="text-sm text-muted">{service.durationMin} min</span>
      </div>
      <ButtonLink href={`/book?serviceId=${service.id}`} className="mt-5 w-full">
        Book Now
      </ButtonLink>
    </article>
  );
}
