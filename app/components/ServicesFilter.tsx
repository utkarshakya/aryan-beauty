"use client";

import { useMemo, useState } from "react";
import type { Service } from "@prisma/client";

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
    <main className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
          Our Services
        </h1>
        <p className="text-center text-gray-600 mb-10">
          Explore our range of professional beauty services
        </p>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 rounded-full font-medium transition-colors ${
                activeCategory === category
                  ? "bg-pink-600 text-white"
                  : "bg-pink-50 text-gray-700 hover:bg-pink-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-pink-50 rounded-xl p-6 flex flex-col"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                {service.name}
              </h3>
              <p className="text-gray-600 mt-2 flex-1">
                {service.description}
              </p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-pink-600 font-semibold">
                  ₹{Math.round(service.price)}
                </span>
                <span className="text-sm text-gray-500">
                  {service.durationMin} min
                </span>
              </div>
              <button
                type="button"
                className="mt-4 bg-pink-600 text-white px-6 py-2 rounded-full hover:bg-pink-700 transition-colors"
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
