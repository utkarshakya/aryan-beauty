"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Service } from "@prisma/client";
import {
  createAppointment,
  getAvailableSlotsAction,
  type BookingState,
  type TimeSlot,
} from "@/app/actions/appointments";
import { Button, FormBanner, cardClassName } from "@/components/ui";
import { logClientError } from "@/lib/errors";
import Stepper, { type BookingStep } from "./booking/Stepper";
import StepService from "./booking/StepService";
import StepSchedule from "./booking/StepSchedule";
import StepDetails from "./booking/StepDetails";
import BookingSummary from "./booking/BookingSummary";
import BookingSuccess from "./booking/BookingSuccess";

const initialState: BookingState = { errors: {} };
const LAST_STEP = 3;

const STEP_FOR_ERROR: Record<string, BookingStep> = {
  serviceId: 1,
  startTime: 2,
  phone: 3,
};

const PHONE_RE = /^[6-9]\d{9}$/;

export default function BookingWizard({
  services,
  preselectedServiceId,
  hoursDays,
  hoursTime,
  timeZone,
  onBookingComplete,
}: {
  services: Service[];
  preselectedServiceId?: number;
  hoursDays: string;
  hoursTime: string;
  timeZone: string;
  onBookingComplete: () => void;
}) {
  // A service chosen from a service card skips the first step entirely.
  const startStep: BookingStep = preselectedServiceId ? 2 : 1;

  const [state, formAction, pending] = useActionState(
    createAppointment,
    initialState,
  );
  // Navigation is scoped to the action state it happened under, so a fresh
  // server result can override it. A returned field error routes the customer
  // back to the step that owns the field; anything else keeps their step.
  const [navigation, setNavigation] = useState<{
    forState: BookingState;
    step: BookingStep;
  }>({ forState: initialState, step: startStep });
  const [dismissedError, setDismissedError] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState(
    preselectedServiceId != null ? String(preselectedServiceId) : "",
  );
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [phone, setPhone] = useState("");
  const [slotState, setSlotState] = useState<{
    key: string;
    slots: TimeSlot[];
  }>({ key: "", slots: [] });
  const [slotErrorKey, setSlotErrorKey] = useState<string | null>(null);
  const [slotRetryToken, setSlotRetryToken] = useState(0);
  const [clientPhoneError, setClientPhoneError] = useState<string | null>(null);

  const actionBarRef = useRef<HTMLDivElement>(null);

  const errors = state && "errors" in state ? state.errors : {};

  const errorStep =
    state && "errors" in state
      ? (Object.keys(STEP_FOR_ERROR).find(
          (key) => state.errors[key] !== undefined,
        ) as BookingStep | undefined)
      : undefined;

  const step =
    navigation.forState === state
      ? navigation.step
      : (errorStep ?? navigation.step);

  const slotKey = `${selectedServiceId}:${selectedDate}`;
  const slots = slotState.key === slotKey ? slotState.slots : [];
  const loadingSlots = Boolean(
    selectedDate && selectedServiceId && slotState.key !== slotKey,
  );
  const slotFailed = slotErrorKey === slotKey;

  const selectedService = services.find(
    (service) => service.id === Number(selectedServiceId),
  );
  const selectedSlotLabel =
    slots.find((slot) => slot.value === selectedSlot)?.label ??
    (selectedSlot
      ? new Intl.DateTimeFormat("en-IN", {
          timeStyle: "short",
          timeZone,
        }).format(new Date(selectedSlot))
      : "");

  useEffect(() => {
    if (!selectedDate || !selectedServiceId) return;

    let active = true;
    getAvailableSlotsAction(Number(selectedServiceId), selectedDate)
      .then((availableSlots) => {
        if (!active) return;
        setSlotState({ key: slotKey, slots: availableSlots });
        setSlotErrorKey(null);
      })
      .catch((error) => {
        if (!active) return;
        logClientError("action:getAvailableSlots", error);
        // Resolve the loading state so the grid isn't left spinning; the error
        // row in the step offers a Retry.
        setSlotState({ key: slotKey, slots: [] });
        setSlotErrorKey(slotKey);
      });

    return () => {
      active = false;
    };
  }, [selectedDate, selectedServiceId, slotKey, slotRetryToken]);

  // The action bar is pinned at the viewport bottom, so the toast tray has to
  // clear it. Measured rather than hardcoded: the bar grows with the safe-area
  // inset and with button wrapping on narrow screens.
  useEffect(() => {
    const bar = actionBarRef.current;
    const root = document.documentElement;
    if (!bar) return;

    const sync = () => {
      root.style.setProperty("--toast-inset-bottom", `${bar.offsetHeight}px`);
    };
    sync();

    const observer = new ResizeObserver(sync);
    observer.observe(bar);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--toast-inset-bottom");
    };
  }, []);

  function goToStep(next: BookingStep) {
    setDismissedError(null);
    setNavigation({ forState: state, step: next });
  }

  const retrySlotFetch = () => {
    setSlotState({ key: "", slots: [] });
    setSlotErrorKey(null);
    setSlotRetryToken((token) => token + 1);
  };

  const selectService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setSelectedSlot("");
  };

  const selectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot("");
  };

  const canAdvance =
    step === 1
      ? Boolean(selectedServiceId)
      : step === 2
        ? Boolean(selectedDate) && Boolean(selectedSlot) && !loadingSlots && !slotFailed
        : true;

  const submit = (formData: FormData) => {
    const submittedPhone = String(formData.get("phone") ?? "").trim();
    if (submittedPhone && !PHONE_RE.test(submittedPhone)) {
      setClientPhoneError("Enter a valid 10-digit mobile number");
      return;
    }
    setClientPhoneError(null);
    formAction(formData);
  };

  if (state && "success" in state) {
    return (
      <BookingSuccess
        onDismiss={onBookingComplete}
      />
    );
  }

  return (
    <form
      action={submit}
      className={`space-y-4 sm:space-y-5 ${cardClassName("p-4 sm:p-8")}`}
    >
      <input type="hidden" name="serviceId" value={selectedServiceId} />
      <input type="hidden" name="startTime" value={selectedSlot} />

      {errors.form && errors.form !== dismissedError && (
        <FormBanner
          tone="danger"
          onDismiss={() => setDismissedError(errors.form ?? null)}
        >
          {errors.form}
        </FormBanner>
      )}

      <Stepper currentStep={step} />

      {step === 1 && (
        <StepService
          services={services}
          selectedServiceId={selectedServiceId}
          onSelect={selectService}
          error={errors.serviceId}
        />
      )}

      {step === 2 && (
        <StepSchedule
          selectedDate={selectedDate}
          onDateChange={selectDate}
          selectedSlot={selectedSlot}
          onSlotChange={setSelectedSlot}
          slots={slots}
          loadingSlots={loadingSlots}
          slotFailed={slotFailed}
          onRetrySlotFetch={retrySlotFetch}
          startTimeError={errors.startTime}
          hoursDays={hoursDays}
          hoursTime={hoursTime}
          timeZone={timeZone}
        />
      )}

      {step === 3 && selectedService && (
        <div className="space-y-4">
          <BookingSummary
            service={selectedService}
            date={selectedDate}
            time={selectedSlotLabel}
          />
          <StepDetails
            phone={phone}
            onPhoneChange={(value) => {
              setPhone(value);
              setClientPhoneError(null);
            }}
            phoneError={errors.phone ?? clientPhoneError ?? undefined}
          />
        </div>
      )}

      <div
        ref={actionBarRef}
        className="sticky bottom-0 z-[70] -mx-4 mt-1 rounded-b-card border-t border-border bg-background/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] backdrop-blur sm:-mx-8 sm:px-8"
      >
        <div
          className={`flex flex-col gap-2 sm:flex-row sm:items-center ${step > 1 ? "sm:justify-between" : "sm:justify-end"}`}
        >
          {step > 1 && (
            <Button
              key="back"
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => goToStep((step - 1) as BookingStep)}
            >
              Back
            </Button>
          )}

          {step < LAST_STEP ? (
            <Button
              key="advance"
              type="button"
              className="w-full sm:w-auto"
              onClick={() => goToStep((step + 1) as BookingStep)}
              disabled={!canAdvance}
            >
              Continue
            </Button>
          ) : (
            // Distinct keys: Continue and Confirm occupy the same slot in the
            // action bar, so without them React would patch Continue's DOM
            // node's type from "button" to "submit" mid-click and the browser
            // would submit the form the moment the customer reached step 3.
            <Button
              key="submit"
              type="submit"
              className="w-full sm:w-auto"
              disabled={pending}
              size="lg"
            >
              {pending ? "Booking…" : "Confirm Booking"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
