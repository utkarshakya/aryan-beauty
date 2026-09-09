"use client";

import { useActionState, useEffect, useState } from "react";
import type { Service } from "@prisma/client";
import {
  createAppointment,
  getAvailableSlots,
  type BookingState,
  type TimeSlot,
} from "@/app/actions/appointments";
import { Button, ButtonLink } from "@/components/ui";
import { business } from "@/shared/config";

const initialState: BookingState = { errors: {} };

const inputClasses =
  "w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted/70 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:px-4 sm:py-2.5";
const validInputClasses = `${inputClasses} border-border`;
const errorInputClasses = `${inputClasses} border-danger bg-danger-soft`;
const errorTextClasses = "mt-1.5 text-sm text-danger";

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

export default function BookingForm({
  services,
  preselectedServiceId,
}: {
  services: Service[];
  preselectedServiceId?: number;
}) {
  const [state, formAction, pending] = useActionState(
    createAppointment,
    initialState,
  );
  const [dismissedError, setDismissedError] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState(
    preselectedServiceId ?? "",
  );
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [slotState, setSlotState] = useState<{
    key: string;
    slots: TimeSlot[];
  }>({ key: "", slots: [] });

  const errors = state && "errors" in state ? state.errors : {};
  const selectedService = services.find(
    (service) => service.id === Number(selectedServiceId),
  );

  const slotKey = `${selectedServiceId}:${selectedDate}`;
  const slots = slotState.key === slotKey ? slotState.slots : [];
  const loadingSlots = Boolean(
    selectedDate && selectedServiceId && slotState.key !== slotKey,
  );

  useEffect(() => {
    if (!selectedDate || !selectedServiceId) return;

    let active = true;
    getAvailableSlots(Number(selectedServiceId), selectedDate).then(
      (availableSlots) => {
        if (active) setSlotState({ key: slotKey, slots: availableSlots });
      },
    );

    return () => {
      active = false;
    };
  }, [selectedDate, selectedServiceId, slotKey]);

  if (state && "success" in state) {
    const { serviceName, startTime, name, phone } = state.success;
    const formatted = new Date(startTime).toLocaleString("en-IN", {
      dateStyle: "full",
      timeStyle: "short",
    });

    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-success/30 bg-success-soft p-4 sm:p-8"
      >
        <div className="flex flex-col items-center text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-white sm:h-12 sm:w-12">
            <CheckIcon />
          </span>
          <h2 className="mt-3 text-xl font-bold tracking-tight sm:mt-4 sm:text-2xl">
            Booking request sent
          </h2>
          <p className="mt-2 text-muted">Thank you, {name}!</p>
        </div>

        <dl className="mt-5 space-y-2 rounded-lg border border-border bg-background p-3 text-xs sm:mt-6 sm:p-4 sm:text-sm">
          <div className="flex justify-between gap-4">
            <dt className="font-medium text-foreground">Service</dt>
            <dd className="text-right text-muted">{serviceName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-medium text-foreground">When</dt>
            <dd className="text-right text-muted">{formatted}</dd>
          </div>
          {phone && (
            <div className="flex justify-between gap-4">
              <dt className="font-medium text-foreground">Phone</dt>
              <dd className="text-right text-muted">{phone}</dd>
            </div>
          )}
        </dl>

        <div className="mt-5 rounded-lg bg-success-soft p-3 text-xs sm:mt-6 sm:p-4 sm:text-sm">
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
            href={business.phoneHref}
            className="font-medium text-primary transition-colors hover:text-primary-strong"
          >
            Call us on {business.phoneDisplay}
          </a>
        </p>

        <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:mt-6 sm:flex-row sm:gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              const resetData = new FormData();
              resetData.set("__reset", "1");
              formAction(resetData);
            }}
          >
            Book another appointment
          </Button>
          <ButtonLink href="/services" variant="ghost">
            Browse services
          </ButtonLink>
        </div>
      </div>
    );
  }

  const submit = (formData: FormData) => {
    formAction(formData);
  };

  return (
    <form
      action={submit}
      className="space-y-4 rounded-2xl border border-border bg-background p-4 shadow-sm sm:space-y-5 sm:p-8"
    >
      {errors.form && errors.form !== dismissedError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-lg bg-danger-soft px-3 py-2.5 text-xs text-danger sm:px-4 sm:py-3 sm:text-sm"
        >
          <span>{errors.form}</span>
          <button
            type="button"
            onClick={() => setDismissedError(errors.form ?? null)}
            className="rounded-full p-1 font-bold leading-none transition-colors hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
            aria-label="Dismiss error"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div>
        <label htmlFor="serviceId" className="mb-1.5 block text-sm font-medium">
          Service
        </label>
        <select
          id="serviceId"
          name="serviceId"
          defaultValue={preselectedServiceId ?? ""}
          onChange={(event) => {
            setSelectedServiceId(event.target.value);
            setSelectedSlot("");
          }}
          required
          aria-invalid={Boolean(errors.serviceId) || undefined}
          className={errors.serviceId ? errorInputClasses : validInputClasses}
        >
          <option value="" disabled>
            Select a service
          </option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} — ₹{Math.round(service.price)} (
              {service.durationMin} min)
            </option>
          ))}
        </select>
        {selectedService && (
          <p className="mt-1.5 text-sm text-muted">
            Takes about {selectedService.durationMin} minutes.
          </p>
        )}
        {errors.serviceId && (
          <p className={errorTextClasses}>{errors.serviceId}</p>
        )}
      </div>

      <div>
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
            Mobile <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="numeric"
            placeholder="10-digit mobile number"
            aria-invalid={Boolean(errors.phone) || undefined}
            className={errors.phone ? errorInputClasses : validInputClasses}
          />
          {errors.phone && <p className={errorTextClasses}>{errors.phone}</p>}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor="date" className="mb-1.5 block text-sm font-medium">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            min={new Date().toLocaleDateString("en-CA")}
            value={selectedDate}
            onChange={(event) => {
              setSelectedDate(event.target.value);
              setSelectedSlot("");
            }}
            required
            aria-invalid={Boolean(errors.startTime) || undefined}
            className={errors.startTime ? errorInputClasses : validInputClasses}
          />
        </div>

        <div>
          <label
            htmlFor="startTime"
            className="mb-1.5 block text-sm font-medium"
          >
            Available time
          </label>
          <select
            id="startTime"
            name="startTime"
            value={selectedSlot}
            onChange={(event) => setSelectedSlot(event.target.value)}
            disabled={!selectedDate || !selectedServiceId || loadingSlots}
            required
            aria-invalid={Boolean(errors.startTime) || undefined}
            className={errors.startTime ? errorInputClasses : validInputClasses}
          >
            <option value="">
              {loadingSlots
                ? "Finding available times..."
                : !selectedDate
                  ? "Choose a date first"
                  : slots.length === 0
                    ? "No times available"
                    : "Select a time"}
            </option>
            {slots.map((slot) => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </select>
        </div>
        <p className="text-sm text-muted">
          Open {business.hoursDays}, {business.hoursTime}.
        </p>
        {errors.startTime && (
          <p
            role="alert"
            className="rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger"
          >
            {errors.startTime}
          </p>
        )}
      </div>

      <Button type="submit" disabled={pending} className="w-full" size="lg">
        {pending ? "Booking…" : "Confirm Booking"}
      </Button>
    </form>
  );
}
