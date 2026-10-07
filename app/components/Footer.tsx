import Link from "next/link";
import Container from "@/components/ui/Container";
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

export default async function Footer() {
  const business = await getBusinessSettingsForDisplay();
  const hoursDays = formatHoursDays(business.closedWeekdays);
  const hoursTime = formatHoursTime(business.openingHours);

  return (
    <footer className="border-t border-border bg-muted-soft pb-safe">
      <Container className="py-8 sm:py-10">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <p className="text-base font-bold tracking-tight sm:text-lg">
              Unknown <span className="text-primary">Beauty</span>
            </p>
            <p className="mt-1 text-sm text-muted sm:mt-2">{business.tagline}</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Visit
            </h2>
            <address className="mt-2 space-y-1 text-sm not-italic text-muted">
              <p>
                {business.address}
                {business.addressLine2 ? `, ${business.addressLine2}` : ""}
              </p>
              <p>{hoursTime ? `${hoursDays}: ${hoursTime}` : hoursDays}</p>
            </address>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Contact
            </h2>
            <ul className="mt-1 space-y-0.5 text-sm text-muted">
              <li>
                <a
                  href={business.phoneHref}
                  className="inline-flex min-h-[44px] items-center font-medium text-primary transition-colors hover:text-primary-strong"
                >
                  {business.phoneDisplay}
                </a>
              </li>
              <li>
                <Link
                  href="/services"
                  className="inline-flex min-h-[44px] items-center transition-colors hover:text-foreground"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/appointments"
                  className="inline-flex min-h-[44px] items-center transition-colors hover:text-foreground"
                >
                  Book an appointment
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-8 border-t border-border pt-5 text-xs text-muted">
          © {new Date().getFullYear()} {business.name}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
