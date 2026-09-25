import Container from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { getBusinessSettingsForDisplay } from "@/lib/db/business";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatHoursDays(closedWeekdays: number[]): string {
  const openDays = [0, 1, 2, 3, 4, 5, 6].filter(d => !closedWeekdays.includes(d));
  if (openDays.length === 7) return "Monday – Sunday";
  if (openDays.length === 0) return "Currently closed";
  if (openDays.length === 1) return WEEKDAY_LABELS[openDays[0]];
  return `${WEEKDAY_LABELS[openDays[0]]} – ${WEEKDAY_LABELS[openDays[openDays.length - 1]]}`;
}

function formatHoursTime(openingHours: Record<string, { open: string; close: string }>): string {
  const hours = Object.values(openingHours);
  if (hours.length === 0) return "";
  const first = hours[0];
  return `${formatTime(first.open)} – ${formatTime(first.close)}`;
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return m === 0 ? `${hour}:00 ${period}` : `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export default async function Hero() {
  let business;
  try {
    business = await getBusinessSettingsForDisplay();
  } catch {
    business = {
      description: "Professional hair, skin, nail and beauty services — book your visit online in under a minute.",
      openingHours: {} as Record<string, { open: string; close: string }>,
      address: "Shop 12, Main Market Road",
    };
  }
  return (
    <section className="relative isolate overflow-hidden bg-primary-soft dark:bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 -top-40 hidden h-80 w-80 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl dark:block"
      />
      <Container className="relative py-12 text-center sm:py-20">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            Discover Your Natural Beauty
          </h1>
          <p className="mt-3 text-base text-muted sm:mt-4 sm:text-xl">
            {business.description}
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:mt-8 sm:flex-row sm:gap-3">
            <ButtonLink
              href="/appointments"
              size="lg"
              className="w-full max-w-[320px] sm:w-auto sm:max-w-none"
            >
              Book Appointment
            </ButtonLink>
            <ButtonLink
              href="/services"
              variant="secondary"
              size="lg"
              className="w-full max-w-[320px] sm:w-auto sm:max-w-none dark:bg-surface dark:text-primary dark:hover:bg-surface-strong"
            >
              View Services
            </ButtonLink>
          </div>
          <p className="mt-6 text-xs text-muted sm:mt-8 sm:text-sm">
            Open {formatHoursDays([])}, {formatHoursTime(business.openingHours)} ·{" "}
            {business.address}
          </p>
        </div>
      </Container>
    </section>
  );
}
