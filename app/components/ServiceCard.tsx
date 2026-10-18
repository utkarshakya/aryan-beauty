import { ButtonLink } from "@/components/ui/Button";
import { cardClassName } from "@/components/ui";
import type { Service } from "@prisma/client";

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <article
      className={cardClassName(
        "interactive-surface relative flex h-full flex-col p-4 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-5",
      )}
    >
      <p className="text-meta font-medium uppercase tracking-wide text-primary">
        {service.category}
      </p>
      <h3 className="mt-1 text-body-lg font-semibold text-foreground">
        {service.name}
      </h3>
      <p className="mt-2 flex-1 text-body leading-relaxed text-muted line-clamp-3">
        {service.description}
      </p>
      <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4">
        <span className="text-title font-bold text-primary">
          ₹{service.price}
        </span>
        <span className="text-body text-muted">{service.durationMin} min</span>
      </div>
      <ButtonLink
        href={`/appointments?serviceId=${service.id}`}
        className="mt-5 w-full after:absolute after:inset-0 after:content-['']"
      >
        Book Now
      </ButtonLink>
    </article>
  );
}
