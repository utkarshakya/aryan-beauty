import ServiceCard from "./ServiceCard";
import Container from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import type { Service } from "@prisma/client";

export default function ServicesPreview({ services }: { services: Service[] }) {
  if (services.length === 0) return null;

  return (
    <section className="py-12 sm:py-20">
      <Container>
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3 sm:mb-10 sm:gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight sm:text-3xl">
              Our Services
            </h2>
            <p className="mt-1 text-sm text-muted sm:mt-2 sm:text-base">
              Real prices, booked in under a minute.
            </p>
          </div>
          <ButtonLink href="/services" variant="secondary">
            View all services
          </ButtonLink>
        </div>
        <div className="grid grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 sm:justify-items-stretch sm:gap-6 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="w-full max-w-[320px] sm:max-w-none"
            >
              <ServiceCard service={service} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
