import ServiceCard from "./ServiceCard";
import { serviceGridClasses } from "./serviceGrid";
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
        <div className={serviceGridClasses}>
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </Container>
    </section>
  );
}
