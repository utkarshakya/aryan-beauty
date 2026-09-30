import ServiceCard from "./ServiceCard";
import Container from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui";
import type { Service } from "@prisma/client";

export default function ServicesPreview({ services }: { services: Service[] }) {
  if (services.length === 0) return null;

  return (
    <section className="py-12 sm:py-20">
      <Container>
        <SectionHeading
          size="lg"
          title="Our Services"
          description="Real prices, booked in under a minute."
          actions={
            <ButtonLink href="/services" variant="secondary">
              View all services
            </ButtonLink>
          }
        />
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
