import { Button, ButtonLink } from "@/components/ui";

type BookingSuccessData = {
  serviceName: string;
  startTime: string;
  name: string;
  phone: string | null;
};

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function BookingSuccess({
  success,
  phoneDisplay,
  phoneHref,
  onBookAnother,
}: {
  success: BookingSuccessData;
  phoneDisplay: string;
  phoneHref: string;
  onBookAnother: () => void;
}) {
  const { serviceName, startTime, name, phone } = success;
  const formatted = startTime
    ? new Date(startTime).toLocaleString("en-IN", {
        dateStyle: "full",
        timeStyle: "short",
      })
    : "";

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-card border border-success/30 bg-success-soft p-4 sm:p-8"
    >
      <div className="flex flex-col items-center text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-background sm:h-12 sm:w-12">
          <CheckIcon />
        </span>
        <h2 className="mt-3 text-xl font-bold tracking-tight sm:mt-4 sm:text-2xl">
          Booking request sent
        </h2>
        <p className="mt-2 text-muted">Thank you, {name}!</p>
      </div>

      <dl className="mt-5 space-y-2 rounded-control border border-border bg-background p-3 text-xs sm:mt-6 sm:p-4 sm:text-sm">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
          <dt className="font-medium text-foreground">Service</dt>
          <dd className="text-muted sm:text-right">{serviceName}</dd>
        </div>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
          <dt className="font-medium text-foreground">When</dt>
          <dd className="text-muted sm:text-right">{formatted}</dd>
        </div>
        {phone && (
          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
            <dt className="font-medium text-foreground">Phone</dt>
            <dd className="text-muted sm:text-right">{phone}</dd>
          </div>
        )}
      </dl>

      <div className="mt-5 rounded-control bg-success-soft p-3 text-xs sm:mt-6 sm:p-4 sm:text-sm">
        <p className="font-medium text-foreground">What happens next?</p>
        <p className="mt-1 text-muted">
          We&apos;ll contact you using your account details to confirm your
          appointment. If the time isn&apos;t available, we&apos;ll help you
          pick another slot.
        </p>
      </div>

      <p className="mt-5 text-center text-xs text-muted sm:mt-6 sm:text-sm">
        Questions?{" "}
        <a
          href={phoneHref}
          className="font-medium text-primary transition-colors hover:text-primary-strong"
        >
          Call us on {phoneDisplay}
        </a>
      </p>

      <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:mt-6 sm:flex-row sm:gap-3">
        <Button type="button" variant="secondary" onClick={onBookAnother}>
          Book another appointment
        </Button>
        <ButtonLink href="/services" variant="ghost">
          Browse services
        </ButtonLink>
      </div>
    </div>
  );
}
