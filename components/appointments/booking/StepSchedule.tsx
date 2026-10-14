import type { TimeSlot } from "@/app/actions/appointments";
import {
  Button,
  ChoiceCard,
  EmptyState,
  Field,
  Input,
  Skeleton,
  SkeletonGroup,
} from "@/components/ui";

function todayIn(timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date());
}

function SlotChips({
  slots,
  selectedSlot,
  onSlotChange,
}: {
  slots: TimeSlot[];
  selectedSlot: string;
  onSlotChange: (startTime: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {slots.map((slot) => (
        <ChoiceCard
          key={slot.value}
          name="booking-slot"
          value={slot.value}
          checked={selectedSlot === slot.value}
          onChange={() => onSlotChange(slot.value)}
          className="justify-center px-2 text-center font-medium"
        >
          {slot.label}
        </ChoiceCard>
      ))}
    </div>
  );
}

export default function StepSchedule({
  selectedDate,
  onDateChange,
  selectedSlot,
  onSlotChange,
  slots,
  loadingSlots,
  slotFailed,
  onRetrySlotFetch,
  startTimeError,
  hoursDays,
  hoursTime,
  timeZone,
}: {
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedSlot: string;
  onSlotChange: (startTime: string) => void;
  slots: TimeSlot[];
  loadingSlots: boolean;
  slotFailed: boolean;
  onRetrySlotFetch: () => void;
  startTimeError?: string;
  hoursDays: string;
  hoursTime: string;
  timeZone: string;
}) {
  return (
    <div className="space-y-4">
      <Field
        label="Date"
        error={startTimeError}
        hint={
          <>
            Open {hoursDays}, {hoursTime}.
          </>
        }
      >
        <Input
          id="date"
          type="date"
          min={todayIn(timeZone)}
          value={selectedDate}
          onChange={(event) => onDateChange(event.target.value)}
        />
      </Field>

      {!selectedDate ? null : slotFailed ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-2 rounded-control bg-danger-soft px-3 py-2.5 text-xs text-danger sm:text-sm"
        >
          <span>
            Couldn&apos;t load available times. Check your connection and try
            again.
          </span>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onRetrySlotFetch}
          >
            Retry
          </Button>
        </div>
      ) : loadingSlots ? (
        <SkeletonGroup label="Finding available times…">
          <div aria-hidden="true" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton
                key={index}
                rounded="control"
                className="h-[44px] w-full"
              />
            ))}
          </div>
        </SkeletonGroup>
      ) : slots.length === 0 ? (
        <EmptyState
          title="No times available"
          body="That day is closed or fully booked. Try another date, or call us and we'll find you a slot."
          actions={
            <Button type="button" variant="secondary" onClick={() => onDateChange("")}>
              Choose another date
            </Button>
          }
        />
      ) : (
        <div>
          <p className="mb-1.5 block text-sm font-medium text-foreground">
            Available time
          </p>
          <SlotChips
            slots={slots}
            selectedSlot={selectedSlot}
            onSlotChange={onSlotChange}
          />
        </div>
      )}
    </div>
  );
}
