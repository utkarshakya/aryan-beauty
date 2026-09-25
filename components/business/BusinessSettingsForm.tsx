"use client";

import { useState } from "react";
import { updateBusinessSettingsAction } from "@/app/actions/business";
import { BusinessSettings } from "@prisma/client";
import { Button } from "@/components/ui";

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

  const inputClasses = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-ring";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="rounded-lg bg-success-soft px-4 py-3 text-sm text-success" role="status">
          Business settings saved successfully
        </div>
      )}

      <section className="space-y-4" aria-labelledby="basic-heading">
        <h3 id="basic-heading" className="text-lg font-semibold text-foreground">Basic information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground">Business name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              className={inputClasses}
            />
            {errors.name && <p className="mt-1.5 text-sm text-danger">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground">Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className={inputClasses}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground">Address line 2</label>
            <input
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Phone (storage)</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Phone (display)</label>
            <input
              value={phoneDisplay}
              onChange={(e) => setPhoneDisplay(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Phone (href)</label>
            <input
              value={phoneHref}
              onChange={(e) => setPhoneHref(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground">Tagline</label>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Time zone</label>
            <select
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              className={inputClasses}
            >
              {TIMEZONES.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="hours-heading">
        <h3 id="hours-heading" className="text-lg font-semibold text-foreground">Opening hours</h3>
        <p className="text-sm text-muted">Uncheck a day to mark it as closed. Closed days won&apos;t show available slots.</p>
        <div className="space-y-2">
          {WEEKDAYS.map(day => {
            const closed = isClosed(day, closedWeekdays, openingHours);
            const hours = openingHours[day.key] ?? { open: "09:00", close: "18:00" };
            return (
              <div key={day.key} className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-border bg-background/50">
                <label className="flex items-center gap-2 min-w-[100px] sm:min-w-[120px]">
                  <input
                    type="checkbox"
                    checked={!closed}
                    onChange={() => toggleClosedWeekday(WEEKDAYS.findIndex(d => d.key === day.key))}
                    className="rounded border-border text-primary focus-ring"
                  />
                  <span className="text-sm font-medium text-foreground">{day.label}</span>
                </label>
                {!closed && (
                  <>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-muted">Open</label>
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) => updateOpeningHour(day.key, "open", e.target.value)}
                        className={inputClasses}
                        style={{ width: "100px" }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-muted">Close</label>
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) => updateOpeningHour(day.key, "close", e.target.value)}
                        className={inputClasses}
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

      <section className="space-y-4" aria-labelledby="closures-heading">
        <h3 id="closures-heading" className="text-lg font-semibold text-foreground">Closures & holidays</h3>
        <p className="text-sm text-muted">Add specific dates when the parlour is closed (holidays, vacation, etc.).</p>
        <div className="flex flex-wrap gap-2">
          <input
            type="date"
            value={closureDate}
            onChange={(e) => setClosureDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className={inputClasses}
            style={{ width: "180px" }}
          />
          <input
            type="text"
            value={closureReason}
            onChange={(e) => setClosureReason(e.target.value)}
            placeholder="Reason (e.g., Diwali, Annual leave)"
            className={inputClasses}
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

      <section className="space-y-4" aria-labelledby="booking-heading">
        <h3 id="booking-heading" className="text-lg font-semibold text-foreground">Booking rules</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-foreground">Slot interval (minutes)</label>
            <select
              value={slotIntervalMin}
              onChange={(e) => setSlotIntervalMin(Number(e.target.value))}
              className={inputClasses}
            >
              {SLOT_INTERVALS.map(interval => (
                <option key={interval} value={interval}>{interval} minutes</option>
              ))}
            </select>
            {errors.slotIntervalMin && <p className="mt-1.5 text-sm text-danger">{errors.slotIntervalMin}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Minimum booking notice (minutes)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={minBookingNoticeMin}
              onChange={(e) => setMinBookingNoticeMin(Number(e.target.value))}
              className={inputClasses}
            />
            {errors.minBookingNoticeMin && <p className="mt-1.5 text-sm text-danger">{errors.minBookingNoticeMin}</p>}
            <p className="mt-1 text-xs text-muted">How far in advance customers must book</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Cancellation cutoff (minutes)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={cancellationCutoffMin}
              onChange={(e) => setCancellationCutoffMin(Number(e.target.value))}
              className={inputClasses}
            />
            {errors.cancellationCutoffMin && <p className="mt-1.5 text-sm text-danger">{errors.cancellationCutoffMin}</p>}
            <p className="mt-1 text-xs text-muted">How far in advance customers can cancel</p>
          </div>
        </div>
      </section>

      <Button type="submit" disabled={saving} className="w-full sm:w-auto">
        {saving ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}