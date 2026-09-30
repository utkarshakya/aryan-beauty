"use client";

import { useState } from "react";
import { updateBusinessSettingsAction } from "@/app/actions/business";
import { BusinessSettings } from "@prisma/client";
import {
  Button,
  Field,
  FormBanner,
  Input,
  SectionHeading,
  Select,
  Textarea,
  checkboxClass,
} from "@/components/ui";

const WEEKDAYS = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
] as const;

const TIMEZONES = [
  "Asia/Kolkata",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney",
  "UTC",
] as const;

const SLOT_INTERVALS = [15, 30, 45, 60] as const;

function isClosed(day: { key: string; label: string }, closedWeekdays: number[], openingHours: Record<string, { open: string; close: string }>) {
  return closedWeekdays.includes(WEEKDAYS.findIndex(d => d.key === day.key)) || !openingHours[day.key];
}

export default function BusinessSettingsForm({ settings }: { settings: BusinessSettings }) {
  const [name, setName] = useState(settings.name);
  const [phone, setPhone] = useState(settings.phone ?? "");
  const [phoneDisplay, setPhoneDisplay] = useState(settings.phoneDisplay ?? "");
  const [phoneHref, setPhoneHref] = useState(settings.phoneHref ?? "");
  const [address, setAddress] = useState(settings.address ?? "");
  const [addressLine2, setAddressLine2] = useState(settings.addressLine2 ?? "");
  const [tagline, setTagline] = useState(settings.tagline ?? "");
  const [description, setDescription] = useState(settings.description ?? "");
  const [timeZone, setTimeZone] = useState(settings.timeZone);
  const [openingHours, setOpeningHours] = useState<Record<string, { open: string; close: string }>>(settings.openingHours as Record<string, { open: string; close: string }>);
  const [closedWeekdays, setClosedWeekdays] = useState<number[]>(settings.closedWeekdays);
  const [closures, setClosures] = useState<Array<{ date: string; reason: string }>>(settings.closures as Array<{ date: string; reason: string }>);
  const [slotIntervalMin, setSlotIntervalMin] = useState(settings.slotIntervalMin);
  const [minBookingNoticeMin, setMinBookingNoticeMin] = useState(settings.minBookingNoticeMin);
  const [cancellationCutoffMin, setCancellationCutoffMin] = useState(settings.cancellationCutoffMin);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [closureDate, setClosureDate] = useState("");
  const [closureReason, setClosureReason] = useState("");

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name || name.length > 100) newErrors.name = "Enter a business name (max 100 chars)";
    if (!Number.isInteger(slotIntervalMin) || slotIntervalMin < 5 || slotIntervalMin > 120) newErrors.slotIntervalMin = "Enter a valid slot interval (5-120 minutes)";
    if (!Number.isInteger(minBookingNoticeMin) || minBookingNoticeMin < 0) newErrors.minBookingNoticeMin = "Enter a valid minimum booking notice (minutes)";
    if (!Number.isInteger(cancellationCutoffMin) || cancellationCutoffMin < 0) newErrors.cancellationCutoffMin = "Enter a valid cancellation cutoff (minutes)";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("phone", phone);
      formData.set("phoneDisplay", phoneDisplay);
      formData.set("phoneHref", phoneHref);
      formData.set("address", address);
      formData.set("addressLine2", addressLine2);
      formData.set("tagline", tagline);
      formData.set("description", description);
      formData.set("timeZone", timeZone);
      formData.set("openingHours", JSON.stringify(openingHours));
      formData.set("closedWeekdays", JSON.stringify(closedWeekdays));
      formData.set("closures", JSON.stringify(closures));
      formData.set("slotIntervalMin", String(slotIntervalMin));
      formData.set("minBookingNoticeMin", String(minBookingNoticeMin));
      formData.set("cancellationCutoffMin", String(cancellationCutoffMin));
      const result = await updateBusinessSettingsAction({ errors: {} }, formData);
      if (result.errors) {
        setErrors(result.errors);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleClosedWeekday = (dayIndex: number) => {
    setClosedWeekdays(prev => prev.includes(dayIndex)
      ? prev.filter(d => d !== dayIndex)
      : [...prev, dayIndex]
    );
  };

  const updateOpeningHour = (dayKey: string, field: "open" | "close", value: string) => {
    setOpeningHours(prev => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], [field]: value },
    }));
  };

  const addClosure = () => {
    if (!closureDate || !closureReason.trim()) return;
    setClosures(prev => [...prev, { date: closureDate, reason: closureReason.trim() }].sort((a, b) => a.date.localeCompare(b.date)));
    setClosureDate("");
    setClosureReason("");
  };

  const removeClosure = (index: number) => {
    setClosures(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <FormBanner>Business settings saved successfully</FormBanner>
      )}

      <section aria-labelledby="basic-heading">
        <SectionHeading id="basic-heading" title="Basic information" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Business name" error={errors.name}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
            />
          </Field>
          <Field label="Phone">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <Textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
            />
          </Field>
          <Field label="Address line 2" className="sm:col-span-2">
            <Input
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
            />
          </Field>
          <Field label="Phone (storage)">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field label="Phone (display)">
            <Input
              value={phoneDisplay}
              onChange={(e) => setPhoneDisplay(e.target.value)}
            />
          </Field>
          <Field label="Phone (href)">
            <Input
              value={phoneHref}
              onChange={(e) => setPhoneHref(e.target.value)}
            />
          </Field>
          <Field label="Tagline" className="sm:col-span-2">
            <Input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </Field>
          <Field label="Time zone">
            <Select
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
            >
              {TIMEZONES.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </Select>
          </Field>
        </div>
      </section>

      <section aria-labelledby="hours-heading">
        <SectionHeading
          id="hours-heading"
          title="Opening hours"
          description="Uncheck a day to mark it as closed. Closed days won&apos;t show available slots."
        />
        <div className="space-y-2">
          {WEEKDAYS.map(day => {
            const closed = isClosed(day, closedWeekdays, openingHours);
            const hours = openingHours[day.key] ?? { open: "09:00", close: "18:00" };
            return (
              <div key={day.key} className="flex flex-wrap items-center gap-3 rounded-control border border-border bg-background/50 p-3">
                <label className="flex items-center gap-2 min-w-[100px] sm:min-w-[120px]">
                  <input
                    type="checkbox"
                    checked={!closed}
                    onChange={() => toggleClosedWeekday(WEEKDAYS.findIndex(d => d.key === day.key))}
                    className={checkboxClass}
                  />
                  <span className="text-sm font-medium text-foreground">{day.label}</span>
                </label>
                {!closed && (
                  <>
                    <div className="flex items-center gap-2">
                      <label htmlFor={`open-${day.key}`} className="text-sm text-muted">Open</label>
                      <Input
                        id={`open-${day.key}`}
                        type="time"
                        value={hours.open}
                        onChange={(e) => updateOpeningHour(day.key, "open", e.target.value)}
                        style={{ width: "100px" }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label htmlFor={`close-${day.key}`} className="text-sm text-muted">Close</label>
                      <Input
                        id={`close-${day.key}`}
                        type="time"
                        value={hours.close}
                        onChange={(e) => updateOpeningHour(day.key, "close", e.target.value)}
                        style={{ width: "100px" }}
                      />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="closures-heading">
        <SectionHeading
          id="closures-heading"
          title="Closures & holidays"
          description="Add specific dates when the parlour is closed (holidays, vacation, etc.)."
        />
        <div className="flex flex-wrap gap-2">
          <Input
            type="date"
            value={closureDate}
            onChange={(e) => setClosureDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            style={{ width: "180px" }}
          />
          <Input
            type="text"
            value={closureReason}
            onChange={(e) => setClosureReason(e.target.value)}
            placeholder="Reason (e.g., Diwali, Annual leave)"
            style={{ flex: "1", minWidth: "200px" }}
          />
          <Button type="button" variant="secondary" onClick={addClosure} disabled={!closureDate || !closureReason.trim()}>
            Add
          </Button>
        </div>
        {closures.length > 0 && (
          <ul className="divide-y divide-border">
            {closures.map((closure, index) => (
              <li key={`${closure.date}-${index}`} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{new Date(closure.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</p>
                  <p className="text-xs text-muted">{closure.reason}</p>
                </div>
                <Button type="button" variant="ghost" size="md" onClick={() => removeClosure(index)}>Remove</Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="booking-heading">
        <SectionHeading id="booking-heading" title="Booking rules" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Slot interval (minutes)" error={errors.slotIntervalMin}>
            <Select
              value={slotIntervalMin}
              onChange={(e) => setSlotIntervalMin(Number(e.target.value))}
            >
              {SLOT_INTERVALS.map(interval => (
                <option key={interval} value={interval}>{interval} minutes</option>
              ))}
            </Select>
          </Field>
          <Field
            label="Minimum booking notice (minutes)"
            error={errors.minBookingNoticeMin}
            hint="How far in advance customers must book"
          >
            <Input
              type="number"
              min="0"
              step="1"
              value={minBookingNoticeMin}
              onChange={(e) => setMinBookingNoticeMin(Number(e.target.value))}
            />
          </Field>
          <Field
            label="Cancellation cutoff (minutes)"
            error={errors.cancellationCutoffMin}
            hint="How far in advance customers can cancel"
          >
            <Input
              type="number"
              min="0"
              step="1"
              value={cancellationCutoffMin}
              onChange={(e) => setCancellationCutoffMin(Number(e.target.value))}
            />
          </Field>
        </div>
      </section>

      <Button type="submit" disabled={saving} className="w-full sm:w-auto">
        {saving ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}