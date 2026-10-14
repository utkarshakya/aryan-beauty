import type { Service } from "@prisma/client";

type SummaryRow = {
  label: string;
  value: string;
};

/** `YYYY-MM-DD` is parsed as UTC midnight, so format it back in UTC. */
function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(date));
}

export default function BookingSummary({
  service,
  date,
  time,
}: {
  service: Service;
  date: string;
  time: string;
}) {
  const rows: SummaryRow[] = [
    { label: "Service", value: service.name },
    { label: "Price", value: `₹${service.price} · ${service.durationMin} min` },
    { label: "Date", value: formatDate(date) },
    { label: "Time", value: time },
  ];

  return (
    <div className="rounded-control border border-border bg-background p-3 sm:p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        Your booking
      </p>
      <dl className="mt-2 space-y-1.5 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4">
            <dt className="shrink-0 text-muted">{row.label}</dt>
            <dd className="text-right font-medium text-foreground">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
