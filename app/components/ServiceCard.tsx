import { ButtonLink } from "@/components/ui/Button";
import { cardClassName } from "@/components/ui";
import type { Service } from "@prisma/client";

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <article
      className={cardClassName(
        "flex h-full flex-col p-4 transition-all hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-6",
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-primary">
        {service.category}
      </p>
      <h3 className="mt-1 text-base font-semibold text-foreground sm:text-lg">
        {service.name}
      </h3>
      <p className="mt-2 flex-1 text-xs leading-relaxed text-muted line-clamp-3 sm:text-sm">
        {service.description}
      </p>
      <div className="mt-4 flex items-baseline justify-between border-t border-border pt-3">
        <span className="text-lg font-bold text-primary sm:text-xl">
          ₹{service.price}
        </span>
        <span className="text-sm text-muted">{service.durationMin} min</span>
      </div>
      <ButtonLink href={`/appointments?serviceId=${service.id}`} className="mt-5 w-full">
        Book Now
      </ButtonLink>
    </article>
  );
}
