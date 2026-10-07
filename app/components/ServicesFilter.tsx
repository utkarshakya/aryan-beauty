"use client";

import { useMemo, useState } from "react";
import type { Service } from "@prisma/client";
import ServiceCard from "./ServiceCard";
import { serviceGridClasses } from "./serviceGrid";
import EmptyServices from "./EmptyServices";
import Container from "@/components/ui/Container";
import { PageHeader, filterPillClasses } from "@/components/ui";

const ALL_CATEGORIES = "All";

export default function ServicesFilter({
  services,
  phoneDisplay,
  phoneHref,
}: {
  services: Service[];
  phoneDisplay: string;
  phoneHref: string;
}) {
  const categories = useMemo(
    () => [ALL_CATEGORIES, ...new Set(services.map((s) => s.category))],
    [services]
  );
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);

  const filteredServices =
    activeCategory === ALL_CATEGORIES
      ? services
      : services.filter((s) => s.category === activeCategory);

  return (
    <Container className="py-12 sm:py-20">
      <PageHeader
        title="Our Services"
        subtitle="Browse our range of professional beauty services and book online."
        align="center"
      />

      {services.length === 0 ? (
        <EmptyServices phoneDisplay={phoneDisplay} phoneHref={phoneHref} />
      ) : (
        <>
          <div
            className="mb-2 flex flex-wrap justify-center gap-1.5 sm:mb-3 sm:gap-2"
            role="group"
            aria-label="Filter services by category"
          >
            {categories.map((category) => {
              const active = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={active}
                  className={filterPillClasses(active)}
                >
                  {category}
                </button>
              );
            })}
          </div>
          <p className="mb-7 text-center text-xs text-muted sm:mb-10 sm:text-sm" role="status">
            Showing {filteredServices.length}{" "}
            {filteredServices.length === 1 ? "service" : "services"}
          </p>

          <div className={serviceGridClasses}>
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </>
      )}
    </Container>
  );
}
