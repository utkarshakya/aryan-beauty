"use client";

import { useEffect } from "react";

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="h-4 w-4">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export default function BookingSuccess({ onDismiss }: { onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <section
      aria-labelledby="booking-success-title"
      className="mx-auto flex max-w-2xl items-start gap-3 rounded-card border border-success/30 bg-background p-4 shadow-card sm:p-5"
      role="status"
      aria-live="polite"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
        <CheckIcon />
      </span>
      <div className="min-w-0 flex-1">
        <h2 id="booking-success-title" className="text-body font-semibold text-foreground">
          Appointment request sent
        </h2>
        <p className="mt-1 text-meta text-muted sm:text-body">
          Your request has been sent and will be approved soon.
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss appointment confirmation"
        className="-my-2 -mr-2 flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-neutral-soft hover:text-foreground focus-ring"
      >
        <CloseIcon />
      </button>
    </section>
  );
}
