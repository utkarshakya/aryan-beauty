"use client";

import { useMemo, useState } from "react";
import type { Service } from "@prisma/client";
import PageHeader from "./PageHeader";
import ServiceCard from "./ServiceCard";
import EmptyServices from "./EmptyServices";
import Container from "./ui/Container";

const ALL_CATEGORIES = "All";

export default function ServicesFilter({
  services,
}: {
  services: Service[];
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
    <Container className="py-16 sm:py-20">
      <PageHeader
        title="Our Services"
        subtitle="Browse our range of professional beauty services and book online."
      />

      {services.length === 0 ? (
        <EmptyServices />
      ) : (
        <>
          <div
            className="mb-3 flex flex-wrap justify-center gap-2"
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
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    active
                      ? "bg-primary text-white"
                      : "bg-primary-soft text-foreground hover:bg-primary-soft-strong"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
          <p className="mb-10 text-center text-sm text-muted" role="status">
            Showing {filteredServices.length}{" "}
            {filteredServices.length === 1 ? "service" : "services"}
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </>
      )}
    </Container>
  );
}
