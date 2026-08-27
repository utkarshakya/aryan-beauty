import ServiceCard from "./ServiceCard";
import Container from "./ui/Container";
import { ButtonLink } from "./ui/Button";
import type { Service } from "@prisma/client";

export default function ServicesPreview({
  services,
}: {
  services: Service[];
}) {
  if (services.length === 0) return null;

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Our Services
            </h2>
            <p className="mt-2 text-muted">
              Real prices, booked in under a minute.
            </p>
          </div>
          <ButtonLink href="/services" variant="secondary">
            View all services
          </ButtonLink>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </Container>
    </section>
  );
}
