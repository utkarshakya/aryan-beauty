import type { Service } from "@prisma/client";
import { ChoiceCard } from "@/components/ui";

export default function StepService({
  services,
  selectedServiceId,
  onSelect,
  error,
}: {
  services: Service[];
  selectedServiceId: string;
  onSelect: (serviceId: string) => void;
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 block text-body font-medium text-foreground">
        Service
      </legend>

      <div className="space-y-2">
        {services.map((service) => (
          <ChoiceCard
            key={service.id}
            name="booking-service"
            value={String(service.id)}
            checked={selectedServiceId === String(service.id)}
            onChange={() => onSelect(String(service.id))}
          >
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{service.name}</span>
              {service.description && (
                <span className="mt-0.5 block text-meta text-muted line-clamp-1">
                  {service.description}
                </span>
              )}
            </span>
            <span className="shrink-0 text-right">
              <span className="block font-bold text-primary">
                ₹{service.price}
              </span>
              <span className="block text-meta text-muted">
                {service.durationMin} min
              </span>
            </span>
          </ChoiceCard>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-1.5 text-body text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}
