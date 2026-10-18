export const BOOKING_STEPS = ["Service", "Date & time", "Details"] as const;

export type BookingStep = 1 | 2 | 3;

function segmentClasses(step: BookingStep, currentStep: BookingStep) {
  if (step < currentStep) return "bg-primary";
  if (step === currentStep) return "bg-primary-soft";
  return "bg-muted-soft";
}

function labelClasses(step: BookingStep, currentStep: BookingStep) {
  if (step === currentStep) return "font-semibold text-foreground";
  if (step < currentStep) return "text-muted";
  return "text-muted/60";
}

export default function Stepper({ currentStep }: { currentStep: BookingStep }) {
  return (
    <div>
      <p role="status" className="text-meta font-semibold tracking-wide text-primary">
        Step {currentStep} of {BOOKING_STEPS.length}
      </p>

      <ol aria-hidden="true" className="mt-2 flex gap-1.5">
        {BOOKING_STEPS.map((_, index) => {
          const step = (index + 1) as BookingStep;
          return (
            <li
              key={step}
              className={`h-1.5 flex-1 rounded-full ${segmentClasses(step, currentStep)}`}
            />
          );
        })}
      </ol>

      <ol className="mt-2 flex justify-between gap-2 text-meta">
        {BOOKING_STEPS.map((title, index) => {
          const step = (index + 1) as BookingStep;
          const isCurrent = step === currentStep;
          return (
            <li
              key={title}
              aria-current={isCurrent ? "step" : undefined}
              className={labelClasses(step, currentStep)}
            >
              {title}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
